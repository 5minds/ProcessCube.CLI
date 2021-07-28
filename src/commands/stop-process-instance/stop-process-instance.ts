import { ApiClient } from '../../client/api_client';
import { addJsonPipingHintToResultJson, createResultJson, useMessageForResultJsonErrors } from '../../cli/result_json';
import { loadAtlasSession } from '../../session/atlas_session';
import { logError, logJsonResult } from '../../cli/logging';

import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';
import { StoppedProcessInstanceInfo } from '../../contracts/api_client_types';

export async function stopProcessInstance(processInstanceIds: string[], outputFormat: string): Promise<void> {
  const session = loadAtlasSession();
  if (session == null) {
    logError('No session found. Aborting.');
    return;
  }

  const apiClient = new ApiClient(session);

  const results: StoppedProcessInstanceInfo[] = [];
  for (const processInstanceId of processInstanceIds) {
    const result = await apiClient.stopProcessInstance(processInstanceId);
    results.push(result);
  }

  let resultJson = createResultJson('process-instances', results);
  resultJson = addJsonPipingHintToResultJson(resultJson);

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      logJsonResult(resultJson);
      break;
    case OUTPUT_FORMAT_TEXT:
      console.table(useMessageForResultJsonErrors(results), ['success', 'processInstanceId', 'correlationId', 'error']);
      break;
  }
}
