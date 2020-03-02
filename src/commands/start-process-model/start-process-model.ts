import { ApiClient } from '../../client/api_client';
import { createResultJson } from '../../cli/result_json';
import { loadAtlasSession } from '../../session/atlas_session';
import { logError } from '../../cli/logging';

import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';

export async function startProcessInstance(
  processModelId: string,
  startEventId: string,
  correlationId: string,
  inputValues: any,
  waitForProcessToFinish: boolean,
  outputFormat: string
): Promise<void> {
  const session = loadAtlasSession();
  if (session == null) {
    logError('No session found. Aborting.');
    return;
  }

  const apiClient = new ApiClient(session);

  const startRequestPayload = { correlationId, inputValues };
  const processInstance = await apiClient.startProcessModel(
    processModelId,
    startEventId,
    startRequestPayload,
    waitForProcessToFinish
  );
  const processInstances = [processInstance];

  const resultJson = createResultJson('process-instances', processInstances);

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      console.log(JSON.stringify(resultJson, null, 2));
      break;
    case OUTPUT_FORMAT_TEXT:
      console.table(processInstances, [
        'success',
        'processModelId',
        'startEventId',
        'processInstanceId',
        'correlationId',
        'error'
      ]);
      break;
  }
}
