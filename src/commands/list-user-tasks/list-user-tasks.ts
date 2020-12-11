import { DataModels} from '@process-engine/management_api_contracts';    

import { ApiClient } from '../../client/api_client';
import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { addJsonPipingHintToResultJson, createResultJson } from '../../cli/result_json';
import { logJsonResult, logNoValidSessionError } from '../../cli/logging';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { sortProcessInstances } from '../list-process-instances/sorting';

export type ProcessInstance = DataModels.Correlations.ProcessInstance;
//export type UserTask = DataModels.UserTasks.UserTask;

export async function listUserTasks(
  pipedProcessInstanceIds: string[] | null,
  pipedProcessModelIds: string[] | null,
  processModelId: string[],
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

  const processInstances = await getUserTasks(
    session,
    pipedProcessInstanceIds,
    pipedProcessModelIds,
    processModelId,
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

  let resultJson = createResultJson('user-tasks', resultProcessInstances);
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

async function getUserTasks(
    session: AtlasSession,
    pipedProcessInstanceIds: string[] | null,
    pipedProcessModelIds: string[] | null,
    processModelId: string[],
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

    let allUserTasks = await apiClient.getAllUserTasks(
        processModelId,
        filterByCorrelationId,
        filterByProcessModelId,
        rejectByProcessModelId,
        filterByState,
        rejectByState
    );

  if (pipedProcessInstanceIds != null) {
      allUserTasks = allUserTasks.filter((processInstance: any) =>
      pipedProcessInstanceIds.includes(processInstance.processInstanceId)
    );
  }

  if (pipedProcessModelIds != null) {
      allUserTasks = allUserTasks.filter((processInstance: any) =>
      pipedProcessModelIds.includes(processInstance.processModelId)
    );
  }

  allUserTasks = sortProcessInstances(allUserTasks, sortByProcessModelId, sortByState, sortByCreatedAt);

  const processInstances = allUserTasks;

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

    return { ...processInstance, xml: '...', identity: identity };
  });
}
