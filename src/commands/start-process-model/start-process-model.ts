import { DataModels } from '@process-engine/management_api_contracts';

import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { logError } from '../../cli/logging';

type StartedProcessInstanceInfo = DataModels.ProcessModels.ProcessStartResponsePayload;

export async function startProcessInstance(
  processModelId: string,
  startEventId: string,
  format: string
): Promise<void> {
  const session = loadAtlasSession();
  if (session == null) {
    logError('No session found. Aborting.');
    return;
  }

  // TODO: once we support multiple starts, we have to accumulate an array here
  const result = await startProcessInstanceViaClient(session, processModelId, startEventId);
  const processInstances = [result];
  const resultJson = createResultJson('process-instances', processInstances);

  switch (format) {
    case OUTPUT_FORMAT_JSON:
      console.dir(resultJson, { depth: null });
      break;
    case OUTPUT_FORMAT_TEXT:
      console.table(processInstances, ['processInstanceId', 'correlationId']);
      break;
  }
}

export async function startProcessInstanceViaClient(
  session: AtlasSession,
  processModelId: string,
  startEventId: string
): Promise<StartedProcessInstanceInfo> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);
  const payload = {};
  const callbackType = DataModels.ProcessModels.StartCallbackType.CallbackOnProcessInstanceCreated;
  const result = await managementApiClient.startProcessInstance(
    identity,
    processModelId,
    payload,
    callbackType,
    startEventId
  );

  return result;
}

function createResultJson(resultType: string, result: any): any {
  return { result_type: resultType, result: result };
}
