import yesno from 'yesno';

import { logError, logJsonResult, logJsonResultAsTextTable } from '../../cli/logging';
import { createResultJson, useMessageForResultJsonErrors } from '../../cli/result_json';
import { ApiClient } from '../../client/api_client';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';
import { loadSession } from '../../session/session';

export async function removeProcessModels(
  processModelIds: string[],
  autoYes: boolean,
  outputFormat: string,
): Promise<void> {
  const session = loadSession();
  if (session == null) {
    logError('No session found. Aborting.');
    return;
  }

  if (autoYes !== true) {
    const yes = await yesno({
      question: 'Are you sure you want to continue?',
    });

    if (yes !== true) {
      console.log('User cancelled operation. Aborting.');
      process.exit(255);
    }
  }

  const apiClient = new ApiClient(session);

  const results = [];
  for (const processModelId of processModelIds) {
    const result = await apiClient.removeProcessModel(processModelId);

    results.push(result);
  }

  const resultJson = createResultJson('removed-process-model-ids', results);

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      logJsonResult(resultJson);
      break;
    case OUTPUT_FORMAT_TEXT:
      logJsonResultAsTextTable(resultJson, ['success', 'processModelId', 'error'], 'Stopped Process Instances');
      break;
  }
}
