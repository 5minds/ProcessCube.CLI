import { logError, logJsonResult, logJsonResultAsTextTable } from '../../cli/logging';
import { addJsonPipingHintToResultJson, createResultJson, useMessageForResultJsonErrors } from '../../cli/result_json';
import { ApiClient } from '../../client/api_client';
import { RetriedProcessInstanceInfo } from '../../contracts/api_client_types';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';
import { loadSession } from '../../session/session';

export async function retryProcessInstance(processInstanceIds: string[], flowNodeInstanceId: string, updateProcessModel: boolean, outputFormat: string): Promise<void> {
  const session = loadSession();
  if (session == null) {
    logError('No session found. Aborting.');
    return;
  }

  const apiClient = new ApiClient(session);

  const results: RetriedProcessInstanceInfo[] = [];
  for (const processInstanceId of processInstanceIds) {
    const result = await apiClient.retryProcessInstance(processInstanceId, flowNodeInstanceId, updateProcessModel);
    results.push(result);
  }

  let resultJson = createResultJson('process-instances', results);
  resultJson = addJsonPipingHintToResultJson(resultJson);

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      logJsonResult(resultJson);
      break;
    case OUTPUT_FORMAT_TEXT:
      logJsonResultAsTextTable(resultJson, ['success', 'processInstanceId', 'error'], 'Retried Process Instances');
      break;
  }
}
