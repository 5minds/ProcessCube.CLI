import { UserTaskInstance } from '@5minds/processcube_engine_sdk';

import { logJsonResult, logJsonResultAsTextTable, logNoValidSessionError } from '../../cli/logging';
import { addJsonPipingHintToResultJson, createResultJson } from '../../cli/result_json';
import { ApiClient } from '../../client/api_client';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';
import { Session, loadSession } from '../../session/session';
import { sortUserTasks } from '../list-user-tasks/sorting';

export async function listUserTasks(
  pipedProcessInstanceIds: string[] | null,
  pipedProcessModelIds: string[] | null,
  filterByFlowNodeInstanceId: string[],
  filterByCorrelationId: string[],
  filterByProcessModelId: string[],
  rejectByProcessModelId: string[],
  filterByState: string[],
  rejectByState: string[],
  sortByProcessModelId: string,
  sortByState: string,
  limit: number,
  outputFormat: string,
) {
  const session = loadSession();
  if (session == null) {
    logNoValidSessionError();
    return;
  }

  const userTasks = await getUserTasks(
    session,
    pipedProcessInstanceIds,
    pipedProcessModelIds,
    filterByFlowNodeInstanceId,
    filterByCorrelationId,
    filterByProcessModelId,
    rejectByProcessModelId,
    filterByState,
    rejectByState,
    sortByProcessModelId,
    sortByState,
    limit,
  );

  let resultJson = createResultJson('user-tasks', userTasks);
  resultJson = addJsonPipingHintToResultJson(resultJson);

  if (outputFormat === OUTPUT_FORMAT_JSON) {
    logJsonResult(resultJson);
  } else if (outputFormat === OUTPUT_FORMAT_TEXT) {
    logJsonResultAsTextTable(
      resultJson,
      ['flowNodeInstanceId', 'flowNodeName', 'state', 'processModelId', 'processInstanceId', 'correlationId'],
      'List of User Tasks',
    );
  }
}

async function getUserTasks(
  session: Session,
  pipedProcessInstanceIds: string[] | null,
  pipedProcessModelIds: string[] | null,
  flowNodeInstanceId: string[],
  filterByCorrelationId: string[],
  filterByProcessModelId: string[],
  rejectByProcessModelId: string[],
  filterByState: string[],
  rejectByState: string[],
  sortByProcessModelId: string,
  sortByState: string,
  limit: number,
): Promise<UserTaskInstance[]> {
  const apiClient = new ApiClient(session);

  let allUserTasks = await apiClient.getAllUserTasks(
    filterByCorrelationId,
    filterByProcessModelId,
    rejectByProcessModelId,
    filterByState,
    flowNodeInstanceId,
    rejectByState,
  );

  if (pipedProcessInstanceIds != null) {
    allUserTasks = allUserTasks.filter((processInstance: any) =>
      pipedProcessInstanceIds.includes(processInstance.processInstanceId),
    );
  }

  if (pipedProcessModelIds != null) {
    allUserTasks = allUserTasks.filter((processInstance: any) =>
      pipedProcessModelIds.includes(processInstance.processModelId),
    );
  }
  allUserTasks = sortUserTasks(allUserTasks, sortByProcessModelId, sortByState);

  const userTasks = allUserTasks;

  if (limit != null && limit > 0) {
    return userTasks.slice(0, limit);
  }

  return userTasks;
}
