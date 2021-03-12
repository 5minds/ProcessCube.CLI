import * as fs from 'fs';

import { DataModels } from '@process-engine/management_api_contracts';
import { AtlasEngineClient, DataModels as AtlasEngineDataModels } from '@atlas-engine/atlas_engine_client';

import { getIdentityAndManagementApiClient } from './management_api_client';
import { ManagementApiClient } from '@process-engine/management_api_client';

import { AtlasSession } from '../session/atlas_session';
import { BpmnDocument } from '../cli/bpmn_document';
import {
  DeployedProcessModelInfo,
  FinishedUserTaskInfo,
  RemovedProcessModelInfo,
  StartedProcessModelInfo,
  StoppedProcessInstanceInfo
} from '../contracts/api_client_types';
import {
  filterProcessInstancesByProcessModelId,
  filterProcessInstancesByState,
  filterProcessModelsById,
  rejectProcessInstancesByProcessModelId,
  rejectProcessInstancesByState
} from './filtering';
import { logError } from '../cli/logging';
import { isUrlAvailable } from './is_url_available';
import { FlowNodeInstanceState } from '@atlas-engine/atlas_engine_client/dist/types/data_models/flow_node_instance';

// TODO: missing IIdentity here
type Identity = any;

type UserTask = AtlasEngineDataModels.FlowNodeInstances.UserTask;
type FlowNodeInstance = AtlasEngineDataModels.FlowNodeInstances.FlowNodeInstance;

type ProcessInstance = DataModels.Correlations.ProcessInstance;
type ProcessInstanceWithTokens = ProcessInstance & {
  tokens: DataModels.TokenHistory.TokenHistoryGroup;
};

export class ApiClient {
  private engineUrl: string;
  private identity: Identity;
  private managementApiClient: ManagementApiClient;
  private atlasEngineClient: AtlasEngineClient;

  constructor(session: AtlasSession) {
    this.engineUrl = session.engineUrl;
    const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

    this.identity = identity;
    this.managementApiClient = managementApiClient;
    this.atlasEngineClient = new AtlasEngineClient(session.engineUrl, this.identity);
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

    const payload = {
      xml: xml,
      overwriteExisting: true
    };

    try {
      await this.managementApiClient.updateProcessDefinitionsByName(this.identity, processModelId, payload);
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, filename, processModelId, error };
    }

    return { success: true, filename, processModelId };
  }

  async removeProcessModel(processModelId: string): Promise<RemovedProcessModelInfo> {
    try {
      await this.managementApiClient.deleteProcessDefinitionsByProcessModelId(this.identity, processModelId);

      return { success: true, processModelId };
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, processModelId, error };
    }
  }

  async startProcessModel(
    processModelId: string,
    startEventId: string,
    payload: any = {},
    waitForProcessToFinish: boolean
  ): Promise<StartedProcessModelInfo> {
    try {
      const callbackType = waitForProcessToFinish
        ? DataModels.ProcessModels.StartCallbackType.CallbackOnProcessInstanceFinished
        : DataModels.ProcessModels.StartCallbackType.CallbackOnProcessInstanceCreated;
      const response = await this.managementApiClient.startProcessInstance(
        this.identity,
        processModelId,
        payload,
        callbackType,
        startEventId
      );

      const result: StartedProcessModelInfo = {
        success: true,
        processModelId: processModelId,
        startEventId: startEventId,
        processInstanceId: response.processInstanceId,
        correlationId: response.correlationId,
        inputValues: payload.inputValues,
        endEventId: response.endEventId
      };

      if (waitForProcessToFinish === true) {
        const tokenHistoryGroup = await this.managementApiClient.getTokensForProcessInstance(
          this.identity,
          response.processInstanceId
        );

        const token = this.getToken(tokenHistoryGroup, -1, 'onExit');

        return { ...result, payload: token.payload };
      }

      return result;
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, processModelId, startEventId, error };
    }
  }

  private getToken(
    tokenHistoryGroup: DataModels.TokenHistory.TokenHistoryGroup,
    index: number,
    tokenEventType: string
  ): any | null {
    const flowNodeIds = Object.keys(tokenHistoryGroup).reverse();
    const tokenIndex = index >= 0 ? index : flowNodeIds.length + index;
    const flowNodeId: string = flowNodeIds[tokenIndex];
    const token = tokenHistoryGroup[flowNodeId];
    if (token == null) {
      return null;
    }
    const tokenHistoryEntries = token.tokenHistoryEntries;

    return tokenHistoryEntries.find((entry) => entry.tokenEventType === tokenEventType);
  }

  async stopProcessInstance(processInstanceId: string): Promise<StoppedProcessInstanceInfo> {
    try {
      await this.managementApiClient.terminateProcessInstance(this.identity, processInstanceId);

      return {
        success: true,
        processInstanceId
      };
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, processInstanceId, error };
    }
  }

  async retryProcessInstance(processInstanceId: string): Promise<StoppedProcessInstanceInfo> {
    try {
      await this.atlasEngineClient.processInstances.retryProcessInstance(processInstanceId);

      return {
        success: true,
        processInstanceId
      };
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, processInstanceId, error };
    }
  }

  async getProcessModels(offset?: number, limit?: number): Promise<any[]> {
    try {
      const result = await this.managementApiClient.getProcessModels(this.identity, offset, limit);

      return result.processModels;

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
    rejectByState: string[]
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
    rejectByState: string[]
  ): Promise<UserTask[]> {
    let allUserTasks: UserTask[];
     try {
      const userTaskList = await this.atlasEngineClient.userTasks.query(this.identity);
      allUserTasks = userTaskList.userTasks;
      
      if (filterByCorrelationId.length > 0) {
        allUserTasks = await this.getAllUserTasksViaCorrelations(filterByCorrelationId);
      } else if (filterByState.length > 0) {
        allUserTasks = await this.getAllUserTasksViaState(filterByState);
      } else if (filterByProcessModelId.length > 0) {
        allUserTasks = await this.getAllUserTasksViaAllProcessModels(filterByProcessModelId);
      } else if (filterByFlowNodeInstanceId.length > 0) {
        allUserTasks = await this.getAllUserTasksViaFlowNodeInstances(filterByFlowNodeInstanceId)
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
      await this.atlasEngineClient.userTasks.finishUserTask(
        flowNodeInstanceId,
        payload,
        this.identity
        );

      const result: FinishedUserTaskInfo = {
        success: true,
        flowNodeInstanceId: flowNodeInstanceId,
        resultValues: payload.resultValues
      };
      return result;
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, flowNodeInstanceId, error };
    }
  }

  async getFlowNodeInstancesForProcessInstance(processInstanceId: string[]): Promise<FlowNodeInstance[]>{
    try {
      const result = await this.atlasEngineClient.flowNodeInstances.queryFlowNodeInstances({
        processInstanceId: processInstanceId,
      });
      return result.flowNodeInstances;
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
      throw error;
    }
  }

  async getAllUserTasksViaCorrelations(correlationIds: string[]): Promise<UserTask[]> {
      try {
        const result = await this.atlasEngineClient.userTasks.query({
          correlationId: correlationIds,
        });
        
        return result.userTasks;
      } catch (error) {
        await this.warnAndExitIfEnginerUrlNotAvailable();
        throw error;
      }
  }

  private async getAllUserTasksViaAllProcessModels(
    filterByProcessModelId: string[]
  ): Promise<UserTask[]> {
    const allProcessModels = await this.getProcessModels();

    const processModels = filterProcessModelsById(allProcessModels, filterByProcessModelId);

    let allUserTasks = [];
    for (const processModel of processModels) {
      try {

        const result = await this.atlasEngineClient.userTasks.query({
          processModelId: processModel.id,
        });

        allUserTasks = allUserTasks.concat(result.userTasks);
      } catch (e) {
        if (
          e.message.includes('No ProcessInstances for ProcessModel') ||
          e.message.includes('not found')
        ) {
          
        } else {
          throw e;
        }
      }
    }
    return allUserTasks;
  }

  private async getAllUserTasksViaState(filterByState: string[]): Promise<UserTask[]> {
      try {
        const result = await this.atlasEngineClient.userTasks.query({
          state: filterByState as unknown as FlowNodeInstanceState[],
        });
  
       return result.userTasks;
      } catch (error) {
        await this.warnAndExitIfEnginerUrlNotAvailable();
        throw error;
      }
  }

  async getAllUserTasksViaFlowNodeInstances(flowNodeInstanceId: string[]): Promise<UserTask[]> {
    try {
      const result = await this.atlasEngineClient.userTasks.query({
        flowNodeInstanceId: flowNodeInstanceId,
      });

      return result.userTasks;
    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
    }

  }

  async getAllProcessInstancesViaCorrelations(correlationIds: string[]): Promise<ProcessInstance[]> {
    let allProcessInstances = [];
    for (const correlationId of correlationIds) {
      try {
        const result = await this.managementApiClient.getProcessInstancesForCorrelation(this.identity, correlationId);
        allProcessInstances = allProcessInstances.concat(result.processInstances);
      } catch (error) {
        await this.warnAndExitIfEnginerUrlNotAvailable();
        throw error;
      }
      
    }

    return allProcessInstances;
  }

  async getAllProcessInstancesViaIds(processInstanceIds: string[]): Promise<ProcessInstance[]> {
    let allProcessInstances = [];
    for (const processInstanceId of processInstanceIds) {
      try {
        const rawProcessInstance = await this.managementApiClient.getProcessInstanceById(
          this.identity,
          processInstanceId
        );
        allProcessInstances.push(rawProcessInstance);

      } catch (error) {
        await this.warnAndExitIfEnginerUrlNotAvailable();
        throw error;
      }
    }

    return allProcessInstances;
  }

  async getLatestProcessInstance(): Promise<ProcessInstance> {
    try {

      const sortByCreatedAtDescFn = (a: any, b: any) => {
        if (a.createdAt > b.createdAt) {
          return -1;
        }
        if (a.createdAt < b.createdAt) {
          return 1;
        }
        return 0;
      };
  
      const correlationResult = await this.managementApiClient.getAllCorrelations(this.identity);
      const latestCorrelation = correlationResult.correlations.sort(sortByCreatedAtDescFn)[0];
      const processInstances = latestCorrelation.processInstances;
  
      return processInstances.sort(sortByCreatedAtDescFn)[0];

    } catch (error) {
      await this.warnAndExitIfEnginerUrlNotAvailable();
      throw error;
    }
    
  }

  async addTokensToProcessInstances(rawProcessInstances: ProcessInstance[]): Promise<ProcessInstanceWithTokens[]> {
    const processInstancesWithTokens: ProcessInstanceWithTokens[] = [];
    for (const rawProcessInstance of rawProcessInstances) {
      const tokens = await this.managementApiClient.getTokensForProcessInstance(
        this.identity,
        rawProcessInstance.processInstanceId
      );
      const processInstance = { ...rawProcessInstance, tokens };

      processInstancesWithTokens.push(processInstance);
    }

    return processInstancesWithTokens;
  }

  private async getAllProcessInstancesViaAllProcessModels(
    filterByProcessModelId: string[]
  ): Promise<ProcessInstance[]> {
    const allProcessModels = await this.getProcessModels();

    const processModels = filterProcessModelsById(allProcessModels, filterByProcessModelId);

    let allProcessInstances = [];
    for (const processModel of processModels) {
      try {
        const result = await this.managementApiClient.getProcessInstancesForProcessModel(
          this.identity,
          processModel.id
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
    let allProcessInstances: ProcessInstance[] = [];
    for (const state of filterByState) {
      try {
        const result = await this.managementApiClient.getProcessInstancesByState(
          this.identity,
          state as DataModels.Correlations.CorrelationState
        );
  
        allProcessInstances = allProcessInstances.concat(result.processInstances);

      } catch (error) {
        await this.warnAndExitIfEnginerUrlNotAvailable();
        throw error;
      }
      
    }

    return allProcessInstances;
  }

  private async warnAndExitIfEnginerUrlNotAvailable(): Promise<void> {
    if (! await isUrlAvailable(this.engineUrl)) {
      logError(`Could not connect to engine: Please make sure it is running.`);
      process.exit(1);
    }
  }
}
