import { DataModels } from '@process-engine/management_api_contracts';
import { DataModels as AtlasEngineDataModels } from '@atlas-engine/atlas_engine_client'; 

import { ApiClient } from '../../client/api_client';
import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { addJsonPipingHintToResultJson, createResultJson } from '../../cli/result_json';
import { filterProcessInstancesByEndTimeAfter, filterProcessInstancesByEndTimeBefore, filterProcessInstancesByExecutionTime, 
  filterProcessInstancesDateAfter, filterProcessInstancesDateBefore} from '../../client/filtering';
import { logJsonResult, logNoValidSessionError } from '../../cli/logging';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { sortProcessInstances } from './sorting';

export type ProcessInstance = DataModels.Correlations.ProcessInstance;
export type FlowNodeInstance = AtlasEngineDataModels.FlowNodeInstances.FlowNodeInstance;
export type ProcessInstanceWithTokens = AtlasEngineDataModels.FlowNodeInstances.ProcessToken;

export async function listProcessInstances(
  pipedProcessInstanceIds: string[] | null,
  pipedProcessModelIds: string[] | null,
  createdAfter: string,
  createdBefore: string,
  completedAfter: string,
  completedBefore: string,
  completedIn: string,
  filterByCorrelationId: string[],
  filterByProcessModelId: string[],
  rejectByProcessModelId: string[],
  filterByState: string[],
  rejectByState: string[],
  sortByProcessModelId: string,
  sortByState: string,
  sortByCreatedAt: string,
  limit: number,
  showAllFields: boolean,
  outputFormat: string
) {
  const session = loadAtlasSession();
  if (session == null) {
    logNoValidSessionError();
    return;
  }

  const processInstances = await getProcessInstances(
    session,
    pipedProcessInstanceIds,
    pipedProcessModelIds,
    createdAfter,
    createdBefore,
    completedAfter,
    completedBefore,
    completedIn,
    filterByCorrelationId,
    filterByProcessModelId,
    rejectByProcessModelId,
    filterByState,
    rejectByState,
    sortByProcessModelId,
    sortByState,
    sortByCreatedAt,
    limit
  );

  let resultProcessInstances: any[];
  if (showAllFields) {
    resultProcessInstances = mapToLong(processInstances);
  } else {
    resultProcessInstances = mapToShort(processInstances);
  }

  let resultJson = createResultJson('process-instances', resultProcessInstances);
  resultJson = addJsonPipingHintToResultJson(resultJson);

  if (outputFormat === OUTPUT_FORMAT_JSON) {
    logJsonResult(resultJson);
  } else if (outputFormat === OUTPUT_FORMAT_TEXT) {
    console.table(processInstances, [
      'createdAt',
      'finishedAt',
      'processModelId',
      'processInstanceId',
      'state',
      'correlationId'
    ]);
  }
}

async function getProcessInstances(
  session: AtlasSession,
  pipedProcessInstanceIds: string[] | null,
  pipedProcessModelIds: string[] | null,
  createdAfter: string,
  createdBefore: string,
  completedAfter: string,
  completedBefore: string,
  completedIn: string,
  filterByCorrelationId: string[],
  filterByProcessModelId: string[],
  rejectByProcessModelId: string[],
  filterByState: string[],
  rejectByState: string[],
  sortByProcessModelId: string,
  sortByState: string,
  sortByCreatedAt: string,
  limit: number
): Promise<ProcessInstance[]> {
  const apiClient = new ApiClient(session);

  let allProcessInstances = await apiClient.getAllProcessInstances(
    filterByCorrelationId,
    filterByProcessModelId,
    rejectByProcessModelId,
    filterByState,
    rejectByState
  );

  if (pipedProcessInstanceIds != null) {
    allProcessInstances = allProcessInstances.filter((processInstance: any) =>
      pipedProcessInstanceIds.includes(processInstance.processInstanceId)
    );
  }

  if (pipedProcessModelIds != null) {
    allProcessInstances = allProcessInstances.filter((processInstance: any) =>
      pipedProcessModelIds.includes(processInstance.processModelId)
    );
  }

  allProcessInstances = filterProcessInstancesDateAfter(allProcessInstances, 'createdAt', createdAfter);
  allProcessInstances = filterProcessInstancesDateBefore(allProcessInstances, 'createdAt', createdBefore);

  allProcessInstances = filterProcessInstancesByEndTimeAfter(allProcessInstances, completedAfter);
  allProcessInstances = filterProcessInstancesByEndTimeBefore(allProcessInstances, completedBefore);

  allProcessInstances = filterProcessInstancesByExecutionTime(allProcessInstances, completedIn);

  allProcessInstances = sortProcessInstances(allProcessInstances, sortByProcessModelId, sortByState, sortByCreatedAt);

  const processInstances = allProcessInstances;

  if (limit != null && limit > 0) {
    return processInstances.slice(0, limit);
  }

  return processInstances;
}

function mapToLong(list: any): any[] {
  return list;
}

function mapToShort(list: any): any[] {
  return list.map((processInstance: any) => {
    const identity = { ...processInstance.identity, token: '...' };
  
    const token = findToken(processInstance);

    return { ...processInstance, xml: '...', finalToken: token, identity: identity };
  });
}

async function findToken(processInstance: FlowNodeInstance): Promise <any[]>{
  const state = processInstance.state;
  
  if (state != 'finished') {
    return null;
  } 
  const tokens = processInstance.tokens;  

  return tokens;
}
