import { ApiClient } from '../../client/api_client';
import { addJsonPipingHintToResultJson, createResultJson } from '../../cli/result_json';
import { loadSession } from '../../session/session';
import { logError, logJsonResult, logJsonResultAsTextTable } from '../../cli/logging';

import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';
import { StoppedProcessInstanceInfo } from '../../contracts/api_client_types';

export async function stopProcessInstance(processInstanceIds: string[], outputFormat: string): Promise<void> {
  const session = loadSession();
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
      logJsonResultAsTextTable(
        resultJson,
        ['success', 'processInstanceId', 'correlationId', 'error'],
        'Stopped Process Instances'
      );
      break;
  }
}
