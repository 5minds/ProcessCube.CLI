import { ApiClient } from '../../client/api_client';
import { addJsonPipingHintToResultJson, createResultJson, useMessageForResultJsonErrors } from '../../cli/result_json';
import { loadSession } from '../../session/session';
import { logError, logJsonResult } from '../../cli/logging';

import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';

export async function startProcessInstance(
  pipedProcessModelIds: string[] | null,
  givenProcessModelId: string,
  givenStartEventId: string,
  correlationId: string,
  startToken: any,
  waitForProcessToFinish: boolean,
  outputFormat: string
): Promise<void> {
  const session = loadSession();
  if (session == null) {
    logError('No session found. Aborting.');
    return;
  }

  let processModelId: string = Array.isArray(pipedProcessModelIds) ? pipedProcessModelIds[0] : givenProcessModelId;
  if (processModelId == null) {
    logError('No argument `process_model_id`. Aborting.');
    return;
  }

  const apiClient = new ApiClient(session);

  let startEventId: string = givenStartEventId;
  if (startEventId == null) {
    startEventId = await getSingleStartEventIdOrNull(apiClient, processModelId);

    if (startEventId == null) {
      logError('You have to specific a start event, since there is more than one.');
      process.exit(1);
    }
  }

  const startRequestPayload = { correlationId, startToken };
  const processInstance = await apiClient.startProcessModel(
    processModelId,
    startEventId,
    startRequestPayload,
    waitForProcessToFinish
  );
  const processInstances = [processInstance];

  let resultJson = createResultJson('process-instances', processInstances);
  resultJson = addJsonPipingHintToResultJson(resultJson);

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      logJsonResult(resultJson);
      break;
    case OUTPUT_FORMAT_TEXT:
      console.table(useMessageForResultJsonErrors(processInstances), [
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

async function getSingleStartEventIdOrNull(apiClient: ApiClient, processModelId: string): Promise<string | null> {
  const processModels = await apiClient.getProcessModelsByIds([processModelId]);
  const processModel = processModels[0];
  if (processModel == null) {
    logError('No process model with the id "' + processModelId + '" was found. Please check the spelling.');
    process.exit(1);
  }
  if (processModel.startEvents.length === 1) {
    return processModel.startEvents[0].id;
  }

  return null;
}
