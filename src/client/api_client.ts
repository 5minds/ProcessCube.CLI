import * as fs from 'fs';

import chalk from 'chalk';
import { DataModels } from '@process-engine/management_api_contracts';
import { AdminDomainHttpClient } from '@atlas-engine/atlas_engine_admin_client';

import { getIdentityAndManagementApiClient } from './management_api_client';
import { ManagementApiClient } from '@process-engine/management_api_client';

import { AtlasSession } from '../session/atlas_session';
import { BpmnDocument } from '../cli/bpmn_document';
import {
  DeployedProcessModelInfo,
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

// TODO: missing IIdentity here
type Identity = any;

type ProcessInstance = DataModels.Correlations.ProcessInstance;
type ProcessInstanceWithTokens = ProcessInstance & {
  tokens: DataModels.TokenHistory.TokenHistoryGroup;
};

export class ApiClient {
  private engineUrl: string;
  private identity: Identity;
  private managementApiClient: ManagementApiClient;
  private adminDomainHttpClient: AdminDomainHttpClient;

  constructor(session: AtlasSession) {
    this.engineUrl = session.engineUrl;
    const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

    this.identity = identity;
    this.managementApiClient = managementApiClient;
    this.adminDomainHttpClient = new AdminDomainHttpClient(session.engineUrl, this.identity);
  }

  async deployFile(filename: string): Promise<DeployedProcessModelInfo> {
    const xml = fs.readFileSync(filename).toString();
    const bpmnDocument = new BpmnDocument();
    await bpmnDocument.loadXml(xml);

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
      this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, filename, processModelId, error };
    }

    return { success: true, filename, processModelId };
  }

  async removeProcessModel(processModelId: string): Promise<RemovedProcessModelInfo> {
    try {
      await this.managementApiClient.deleteProcessDefinitionsByProcessModelId(this.identity, processModelId);

      return { success: true, processModelId };
    } catch (error) {
      this.warnAndExitIfEnginerUrlNotAvailable();

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
      this.warnAndExitIfEnginerUrlNotAvailable();

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
      this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, processInstanceId, error };
    }
  }

  async retryProcessInstance(processInstanceId: string): Promise<StoppedProcessInstanceInfo> {
    try {
      await this.adminDomainHttpClient.processInstances.retryProcessInstance(processInstanceId);

      return {
        success: true,
        processInstanceId
      };
    } catch (error) {
      this.warnAndExitIfEnginerUrlNotAvailable();

      return { success: false, processInstanceId, error };
    }
  }

  async getProcessModels(offset?: number, limit?: number): Promise<any[]> {
    const result = await this.managementApiClient.getProcessModels(this.identity, offset, limit);

    return result.processModels;
  }

  async getProcessModelsByIds(processModelIds: string[] | null = null): Promise<any[]> {
    const processModels = await this.getProcessModels();

    return processModels.filter((processModel: any) => processModelIds.includes(processModel.id));
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
      this.warnAndExitIfEnginerUrlNotAvailable();
      throw error;
    }

    allProcessInstances = filterProcessInstancesByProcessModelId(allProcessInstances, filterByProcessModelId);
    allProcessInstances = filterProcessInstancesByState(allProcessInstances, filterByState);
    allProcessInstances = rejectProcessInstancesByProcessModelId(allProcessInstances, rejectByProcessModelId);
    allProcessInstances = rejectProcessInstancesByState(allProcessInstances, rejectByState);

    return allProcessInstances;
  }

  async getAllProcessInstancesViaCorrelations(correlationIds: string[]): Promise<ProcessInstance[]> {
    let allProcessInstances = [];
    for (const correlationId of correlationIds) {
      const result = await this.managementApiClient.getProcessInstancesForCorrelation(this.identity, correlationId);
      allProcessInstances = allProcessInstances.concat(result.processInstances);
    }

    return allProcessInstances;
  }

  async getAllProcessInstancesViaIds(processInstanceIds: string[]): Promise<ProcessInstance[]> {
    let allProcessInstances = [];
    for (const processInstanceId of processInstanceIds) {
      const rawProcessInstance = await this.managementApiClient.getProcessInstanceById(
        this.identity,
        processInstanceId
      );
      allProcessInstances.push(rawProcessInstance);
    }

    return allProcessInstances;
  }

  async getLatestProcessInstance(): Promise<ProcessInstance> {
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
      const result = await this.managementApiClient.getProcessInstancesByState(
        this.identity,
        state as DataModels.Correlations.CorrelationState
      );

      allProcessInstances = allProcessInstances.concat(result.processInstances);
    }

    return allProcessInstances;
  }

  private warnAndExitIfEnginerUrlNotAvailable(): void {
    if (!isUrlAvailable(this.engineUrl)) {
      logError(`Could not connect to engine: Please make sure it is running.`);
      process.exit(1);
    }
  }
}
