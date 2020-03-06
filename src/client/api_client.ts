import { DataModels } from '@process-engine/management_api_contracts';

import * as fs from 'fs';

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

// TODO: missing IIdentity here
type Identity = any;

export class ApiClient {
  private identity: Identity;
  private managementApiClient: ManagementApiClient;

  constructor(session: AtlasSession) {
    const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

    this.identity = identity;
    this.managementApiClient = managementApiClient;
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
      return { success: false, filename, processModelId, error };
    }

    return { success: true, filename, processModelId };
  }

  async removeProcessModel(processModelId: string): Promise<RemovedProcessModelInfo> {
    try {
      await this.managementApiClient.deleteProcessDefinitionsByProcessModelId(this.identity, processModelId);

      return { success: true, processModelId };
    } catch (error) {
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
      return { success: false, processInstanceId, error };
    }
  }

  // // TODO: wahrscheinlich zwei Methoden
  async getProcessModels(offset?: number, limit?: number): Promise<any[]> {
    const result = await this.managementApiClient.getProcessModels(this.identity, offset, limit);

    return result.processModels;
  }

  async getProcessModelsByIds(processModelIds: string[] | null = null): Promise<any[]> {
    const processModels = await this.getProcessModels();

    return processModels.filter((processModel: any) => processModelIds.includes(processModel.id));
  }

  // getAllProcessInstances(
  //   filterByCorrelationId: string[],
  //   filterByProcessModelId: string[],
  //   rejectByProcessModelId: string[],
  //   filterByState: string[],
  //   rejectByState: string[]
  // ): Promise<ProcessInstance[]>;

  // getAllProcessInstancesViaCorrelations(correlationIds: string[]): Promise<ProcessInstance[]>;

  // getAllProcessInstancesViaIds(processInstanceIds: string[]): Promise<ProcessInstance[]>;

  // getProcessInstancesWithTokens(
  //   session: AtlasSession,
  //   rawProcessInstances: ProcessInstance[]
  // ): Promise<ProcessInstanceWithTokens[]>;
}
