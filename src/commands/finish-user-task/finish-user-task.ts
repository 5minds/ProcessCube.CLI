import { addJsonPipingHintToResultJson, createResultJson, useMessageForResultJsonErrors } from '../../cli/result_json';
import { FinishedUserTaskInfo } from '../../contracts/api_client_types';
import { loadAtlasSession } from '../../session/atlas_session';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';
import { logJsonResult, logNoValidSessionError } from '../../cli/logging';
import { ApiClient } from '../../client/api_client';

export async function finishUserTask(
  flowNodeInstanceId: string,
  resultValues: any,
  outputFormat: string
): Promise<void> {
  const session = loadAtlasSession();
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
      console.table(useMessageForResultJsonErrors([result]), ['success', 'flowNodeInstanceId', 'error']);
      break;
  }
}
