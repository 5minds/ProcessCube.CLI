import chalk from 'chalk';
import { DataModels as AtlasEngineDataModels } from '@atlas-engine/atlas_engine_client';

import { ApiClient } from '../../client/api_client';
import { Session, loadSession } from '../../session/session';
import { addJsonPipingHintToResultJson, createResultJson } from '../../cli/result_json';
import { logJsonResult, logNoValidSessionError } from '../../cli/logging';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';
import { sortUserTasks } from '../list-user-tasks/sorting';

export type FlowNodeInstance = AtlasEngineDataModels.FlowNodeInstances.FlowNodeInstance;
export type UserTask = AtlasEngineDataModels.FlowNodeInstances.UserTask;

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
  outputFormat: string
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
    limit
  );

  let resultJson = createResultJson('user-tasks', userTasks);
  resultJson = addJsonPipingHintToResultJson(resultJson);

  if (outputFormat === OUTPUT_FORMAT_JSON) {
    logJsonResult(resultJson);
  } else if (outputFormat === OUTPUT_FORMAT_TEXT) {
    console.table(userTasks, ['processModelId', 'processInstanceId', 'state', 'correlationId', 'flowNodeInstanceId']);
    console.log(
      `${resultJson.result.length} results shown` +
        chalk.gray(' - use `--help` to learn more about filtering and sorting.')
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
  limit: number
): Promise<UserTask[]> {
  const apiClient = new ApiClient(session);

  let allUserTasks = await apiClient.getAllUserTasks(
    filterByCorrelationId,
    filterByProcessModelId,
    rejectByProcessModelId,
    filterByState,
    flowNodeInstanceId,
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
  allUserTasks = sortUserTasks(allUserTasks, sortByProcessModelId, sortByState);

  const userTasks = allUserTasks;

  if (limit != null && limit > 0) {
    return userTasks.slice(0, limit);
  }

  return userTasks;
}
