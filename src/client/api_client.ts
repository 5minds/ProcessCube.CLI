import * as fs from 'fs';

import { EngineClient } from '@5minds/processcube_engine_client';
import {
  FlowNodeInstance,
  FlowNodeInstanceState,
  ProcessInstance,
  ProcessInstanceSortableColumns,
  ProcessInstanceState,
  ProcessModel,
  UserTaskInstance,
} from '@5minds/processcube_engine_sdk/';

import { BpmnDocument } from '../cli/bpmn_document';
import { logError } from '../cli/logging';
import {
  DeployedProcessModelInfo,
  FinishedUserTaskInfo,
  RemovedProcessModelInfo,
  StartedProcessModelInfo,
  StoppedProcessInstanceInfo,
} from '../contracts/api_client_types';
import { Session } from '../session/session';
import {
  filterProcessInstancesByProcessModelId,
  filterProcessInstancesByState,
  filterProcessModelsById,
  rejectProcessInstancesByProcessModelId,
  rejectProcessInstancesByState,
} from './filtering';
import { getIdentity } from './identity';
import { isUrlAvailable } from './is_url_available';

export { ProcessInstance } from '@5minds/processcube_engine_sdk/';

// TODO: missing IIdentity here
type Identity = any;

export type ProcessInstanceWithFlowNodeInstances = ProcessInstance & {
  flowNodeInstances: FlowNodeInstance[];
};

export class ApiClient {
  private engineUrl: string;
  private identity: Identity;
  private engineClient: EngineClient;

  constructor(session: Session) {
    this.engineUrl = session.engineUrl;
    this.identity = getIdentity(session);
    this.engineClient = new EngineClient(session.engineUrl, this.identity);
  }

  async deployFile(filename: string): Promise<DeployedProcessModelInfo> {
    const xml = fs.readFileSync(filename).toString();
    const bpmnDocument = new BpmnDocument();

    try {
      await bpmnDocument.loadXml(xml);
    } catch (error) {
      throw new Error(`The specified file is invalid! Please enter a valid BPMN file. ${error}`);
    }

    const processModelId: string = bpmnDocument.getProcessModelId();
    if (processModelId == null) {
      throw new Error('Unexpected value: `processModelId` should not be null here');
    }

    try {
      await this.engineClient.processDefinitions.deployFiles(filename, {
        overwriteExisting: true,
        identity: this.identity,
      });
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, filename, processModelId, error: normalizeError(error) };
    }

    return { success: true, filename, processModelId };
  }

  async removeProcessModel(processModelId: string): Promise<RemovedProcessModelInfo> {
    try {
      const processDefinition = await this.engineClient.processDefinitions.getByProcessModelId(processModelId, {
        identity: this.identity,
        includeXml: false,
      });
      await this.engineClient.processDefinitions.deleteById(processDefinition.processDefinitionId);

      return { success: true, processModelId };
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, processModelId, error: normalizeError(error) };
    }
  }

  async startProcessModel(
    processModelId: string,
    startEventId: string,
    payload: any = {},
    waitForProcessToFinish: boolean,
  ): Promise<StartedProcessModelInfo> {
    try {
      let response;
      if (waitForProcessToFinish) {
        response = await this.engineClient.processDefinitions.startProcessInstanceAndAwaitEndEvent(
          {
            processModelId,
            startEventId,
            initialToken: payload.startToken,
            correlationId: payload.correlationId,
          },
          this.identity,
        );
      } else {
        response = await this.engineClient.processDefinitions.startProcessInstance(
          {
            processModelId,
            startEventId,
            initialToken: payload.startToken,
            correlationId: payload.correlationId,
          },
          this.identity,
        );
      }

      const result: StartedProcessModelInfo = {
        success: true,
        processModelId: processModelId,
        startEventId: startEventId,
        processInstanceId: response.processInstanceId,
        correlationId: response.correlationId,
        startToken: payload.startToken,
        endEventId: response.endEventId,
        endToken: response.tokenPayload,
      };

      return result;
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();

      const processInstanceId = error?.additionalInformation?.processInstanceId;
      const correlationId = error?.additionalInformation?.correlationId;

      return {
        success: false,
        processModelId,
        startEventId,
        processInstanceId,
        correlationId,
        error: normalizeError(error),
      };
    }
  }

  async stopProcessInstance(processInstanceId: string): Promise<StoppedProcessInstanceInfo> {
    try {
      await this.engineClient.processInstances.terminateProcessInstance(processInstanceId, this.identity);

      return {
        success: true,
        processInstanceId,
      };
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, processInstanceId, error: normalizeError(error) };
    }
  }

  async retryProcessInstance(processInstanceId: string): Promise<StoppedProcessInstanceInfo> {
    try {
      await this.engineClient.processInstances.retryProcessInstance(processInstanceId);

      return {
        success: true,
        processInstanceId,
      };
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, processInstanceId, error: normalizeError(error) };
    }
  }

  async getProcessModels(offset?: number, limit?: number, includeXml: boolean = false): Promise<ProcessModel[]> {
    try {
      const result = await this.engineClient.processDefinitions.getAll({
        identity: this.identity,
        includeXml: includeXml,
        offset: offset,
        limit: limit,
      });

      let processModels = [];
      result.processDefinitions.forEach((definition) => {
        const modelsWithXml = definition.processModels.map((model) => {
          return { ...model, xml: definition.xml, id: model.processModelId, name: model.processModelName };
        });
        processModels = processModels.concat(...modelsWithXml);
      });

      return processModels;
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
      throw error;
    }
  }

  async getProcessModelsByIds(processModelIds: string[] | null = null): Promise<any[]> {
    try {
      const processModels = await this.getProcessModels();

      return processModels.filter((processModel: any) => processModelIds.includes(processModel.id));
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
      throw error;
    }
  }

  async getAllProcessInstances(
    filterByCorrelationId: string[],
    filterByProcessModelId: string[],
    rejectByProcessModelId: string[],
    filterByState: string[],
    rejectByState: string[],
  ): Promise<ProcessInstance[]> {
    let allProcessInstances: ProcessInstance[];

    try {
      if (filterByCorrelationId.length > 0) {
        allProcessInstances = await this.getAllProcessInstancesViaCorrelations(filterByCorrelationId);
      } else if (filterByState.length > 0) {
        allProcessInstances = await this.getAllProcessInstancesViaState(filterByState);
      } else {
        allProcessInstances = await this.getAllProcessInstancesViaAllProcessModels(filterByProcessModelId);
      }
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
      throw error;
    }
    allProcessInstances = filterProcessInstancesByProcessModelId(allProcessInstances, filterByProcessModelId);
    allProcessInstances = filterProcessInstancesByState(allProcessInstances, filterByState);
    allProcessInstances = rejectProcessInstancesByProcessModelId(allProcessInstances, rejectByProcessModelId);
    allProcessInstances = rejectProcessInstancesByState(allProcessInstances, rejectByState);

    return allProcessInstances;
  }

  async getAllUserTasks(
    filterByCorrelationId: string[],
    filterByProcessModelId: string[],
    rejectByProcessModelId: string[],
    filterByState: string[],
    filterByFlowNodeInstanceId: string[],
    rejectByState: string[],
  ): Promise<UserTaskInstance[]> {
    let allUserTasks: UserTaskInstance[];
    try {
      const userTaskList = await this.engineClient.userTasks.query(this.identity);
      allUserTasks = userTaskList.userTasks;

      if (filterByCorrelationId.length > 0) {
        allUserTasks = await this.getAllUserTasksViaCorrelations(filterByCorrelationId);
      } else if (filterByState.length > 0) {
        allUserTasks = await this.getAllUserTasksViaState(filterByState);
      } else if (filterByProcessModelId.length > 0) {
        allUserTasks = await this.getAllUserTasksViaAllProcessModels(filterByProcessModelId);
      } else if (filterByFlowNodeInstanceId.length > 0) {
        allUserTasks = await this.getAllUserTasksViaFlowNodeInstances(filterByFlowNodeInstanceId);
      }
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
      throw error;
    }
    allUserTasks = filterProcessInstancesByState(allUserTasks, filterByState);
    allUserTasks = filterProcessInstancesByProcessModelId(allUserTasks, filterByProcessModelId);
    allUserTasks = rejectProcessInstancesByProcessModelId(allUserTasks, rejectByProcessModelId);
    allUserTasks = rejectProcessInstancesByState(allUserTasks, rejectByState);

    return allUserTasks;
  }

  async finishSuspendedUserTask(flowNodeInstanceId: string, payload: any = {}): Promise<FinishedUserTaskInfo> {
    try {
      await this.engineClient.userTasks.finishUserTask(flowNodeInstanceId, payload, this.identity);

      const result: FinishedUserTaskInfo = {
        success: true,
        flowNodeInstanceId: flowNodeInstanceId,
        resultValues: payload.resultValues,
      };

      return result;
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, flowNodeInstanceId, error: normalizeError(error) };
    }
  }

  async getAllUserTasksViaCorrelations(correlationIds: string[]): Promise<UserTaskInstance[]> {
    try {
      const result = await this.engineClient.userTasks.query({
        correlationId: correlationIds,
      });

      return result.userTasks;
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
      throw error;
    }
  }

  private async getAllUserTasksViaAllProcessModels(filterByProcessModelId: string[]): Promise<UserTaskInstance[]> {
    const allProcessModels = await this.getProcessModels();

    const processModels = filterProcessModelsById(allProcessModels, filterByProcessModelId);

    let allUserTasks = [];
    for (const processModel of processModels) {
      try {
        const result = await this.engineClient.userTasks.query({
          processModelId: processModel.id,
        });

        allUserTasks = allUserTasks.concat(result.userTasks);
      } catch (e) {
        if (e.message.includes('No ProcessInstances for ProcessModel') || e.message.includes('not found')) {
        } else {
          throw e;
        }
      }
    }
    return allUserTasks;
  }

  private async getAllUserTasksViaState(filterByState: string[]): Promise<UserTaskInstance[]> {
    try {
      const result = await this.engineClient.userTasks.query({
        state: filterByState as unknown as FlowNodeInstanceState[],
      });

      return result.userTasks;
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
      throw error;
    }
  }

  async getAllUserTasksViaFlowNodeInstances(flowNodeInstanceId: string[]): Promise<UserTaskInstance[]> {
    try {
      const result = await this.engineClient.userTasks.query({
        flowNodeInstanceId: flowNodeInstanceId,
      });

      return result.userTasks;
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
    }
  }

  async getAllProcessInstancesViaCorrelations(correlationIds: string[]): Promise<ProcessInstance[]> {
    try {
      const result = await this.engineClient.processInstances.query({ correlationId: correlationIds }, this.identity);
      return result.processInstances;
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
      throw error;
    }
  }

  async getAllProcessInstancesViaIds(processInstanceIds: string[]): Promise<ProcessInstance[]> {
    try {
      const rawProcessInstance = await this.engineClient.processInstances.query(
        { processInstanceId: processInstanceIds },
        this.identity,
      );
      return rawProcessInstance.processInstances;
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
      throw error;
    }
  }

  async getLatestProcessInstance(): Promise<ProcessInstance> {
    try {
      const result = await this.engineClient.processInstances.query(
        {},
        {
          identity: this.identity,
          sortSettings: {
            sortBy: ProcessInstanceSortableColumns.createdAt,
            sortDir: 'DESC',
          },
        },
      );

      /*
      {}, this.identity, undefined, 1, {
        sortBy: ProcessInstanceSortableColumns.createdAt,
        sortDir: 'DESC'
      }); */
      return result.processInstances[0];
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
      throw error;
    }
  }

  async addFlowNodeInstancesToProcessInstances(
    rawProcessInstances: ProcessInstance[],
  ): Promise<ProcessInstanceWithFlowNodeInstances[]> {
    const processInstancesWithFlowNodeInstances: ProcessInstanceWithFlowNodeInstances[] = [];
    for (const rawProcessInstance of rawProcessInstances) {
      const flowNodeInstanceResult = await this.engineClient.flowNodeInstances.query(
        { processInstanceId: rawProcessInstance.processInstanceId },
        this.identity,
      );
      const processInstance = { ...rawProcessInstance, flowNodeInstances: flowNodeInstanceResult.flowNodeInstances };

      processInstancesWithFlowNodeInstances.push(processInstance);
    }

    return processInstancesWithFlowNodeInstances;
  }

  private async getAllProcessInstancesViaAllProcessModels(
    filterByProcessModelId: string[],
  ): Promise<ProcessInstance[]> {
    const allProcessModels = await this.getProcessModels();

    const processModels = filterProcessModelsById(allProcessModels, filterByProcessModelId);

    let allProcessInstances = [];
    for (const processModel of processModels) {
      try {
        const result = await this.engineClient.processInstances.query(
          { processModelId: processModel.id },
          this.identity,
        );

        allProcessInstances = allProcessInstances.concat(result.processInstances);
      } catch (e) {
        if (
          e.message.includes('No ProcessInstances for ProcessModel') ||
          e.message.includes('No ProcessIntances for ProcessModel') ||
          e.message.includes('not found')
        ) {
          // OMG, why are we using errors for normal control-flow?
        } else {
          throw e;
        }
      }
    }

    return allProcessInstances;
  }

  private async getAllProcessInstancesViaState(filterByState: string[]): Promise<ProcessInstance[]> {
    const states = filterByState as ProcessInstanceState[];

    let allProcessInstances: ProcessInstance[] = [];
    for (const state of states) {
      try {
        const result = await this.engineClient.processInstances.query({ state }, this.identity);

        allProcessInstances = allProcessInstances.concat(result.processInstances);
      } catch (error) {
        await this.warnAndExitIfEnginerUrlNotAvailable();
        throw error;
      }
    }

    return allProcessInstances;
  }

  private async warnAndExitIfEnginerUrlNotAvailable(): Promise<void> {
    if (!(await isUrlAvailable(this.engineUrl))) {
      logError(`Could not connect to engine: Please make sure it is running.`);
      process.exit(1);
    }
  }
}

function normalizeError(error: any): any {
  return {
    name: error.name,
    code: error.code,
    message: error.message,
    additionalInformation: error.additionalInformation,
  };
}
