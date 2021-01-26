import { addJsonPipingHintToResultJson, createResultJson } from '../../cli/result_json';
import { FinishedUserTaskInfo } from '../../contracts/api_client_types';
import { loadAtlasSession } from '../../session/atlas_session';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { logJsonResult, logNoValidSessionError } from '../../cli/logging';
import { ApiClient } from '../../client/api_client';

export async function finishUserTask(flowNodeInstanceId: string, userTaskResult: string[], outputFormat: string): Promise<void> {

  const session = loadAtlasSession();
  if (session == null) {
    logNoValidSessionError();
    return;
  }

  const apiClient = new ApiClient(session);

  const results: FinishedUserTaskInfo[] = [];
  const result = await apiClient.finishSuspendedUserTask(flowNodeInstanceId, userTaskResult);

  results.push(result);

  let resultJson = createResultJson('finished-user-task', results);
  resultJson = addJsonPipingHintToResultJson(resultJson);

  switch (outputFormat) {
      case OUTPUT_FORMAT_JSON:
          logJsonResult(resultJson);
          break;
      case OUTPUT_FORMAT_TEXT:
          console.table(results, ['success', 'flowNodeInstanceId', 'error']);
          break;
   }
}