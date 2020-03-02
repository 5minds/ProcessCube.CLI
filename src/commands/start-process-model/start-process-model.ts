import { loadAtlasSession } from '../../session/atlas_session';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { logError } from '../../cli/logging';
import { ApiClient } from '../../client/api_client';
import { createResultJson } from '../../cli/result_json';

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

  // TODO: once we support multiple starts, we have to accumulate an array here
  const startRequestPayload = { correlationId, inputValues };
  const result = await apiClient.startProcessInstance(
    processModelId,
    startEventId,
    startRequestPayload,
    waitForProcessToFinish
  );
  const processInstances = [result];

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
