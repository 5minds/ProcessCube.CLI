import { logJsonResult, logJsonResultAsTextTable, logNoValidSessionError } from '../../cli/logging';
import { addJsonPipingHintToResultJson, createResultJson, useMessageForResultJsonErrors } from '../../cli/result_json';
import { ApiClient } from '../../client/api_client';
import { FinishedUserTaskInfo } from '../../contracts/api_client_types';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';
import { loadSession } from '../../session/session';

export async function finishUserTask(
  flowNodeInstanceId: string,
  resultValues: any,
  outputFormat: string,
): Promise<void> {
  const session = loadSession();
  if (session == null) {
    logNoValidSessionError();
    return;
  }

  const apiClient = new ApiClient(session);

  const result = await apiClient.finishSuspendedUserTask(flowNodeInstanceId, resultValues);

  let resultJson = createResultJson('user-tasks', result);
  resultJson = addJsonPipingHintToResultJson(resultJson);

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      logJsonResult(resultJson);
      break;
    case OUTPUT_FORMAT_TEXT:
      logJsonResultAsTextTable(resultJson, ['success', 'flowNodeInstanceId', 'error'], 'Finished User Tasks');
      break;
  }
}
