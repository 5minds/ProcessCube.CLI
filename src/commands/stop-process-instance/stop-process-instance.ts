import chalk from 'chalk';

import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { createResultJson } from '../../cli/result_json';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { logError } from '../../cli/logging';

export async function stopProcessInstance(processInstanceIds: string[], options: any, format: string): Promise<void> {
  const session = loadAtlasSession();
  if (session == null) {
    logError('No session found. Aborting.');
    return;
  }

  for (const processInstanceId of processInstanceIds) {
    await stopProcessInstanceViaClient(session, processInstanceId);
  }

  const resultJson = createResultJson('process-instance-ids', processInstanceIds);

  switch (format) {
    case OUTPUT_FORMAT_JSON:
      console.dir(resultJson, { depth: null });
      break;
    case OUTPUT_FORMAT_TEXT:
      console.table(processInstanceIds, ['processInstanceId', 'correlationId']);
      break;
  }
}

export async function stopProcessInstanceViaClient(session: AtlasSession, processInstanceId: string): Promise<void> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  // TODO: make sure the process instance was "alive" before and is terminated afterwards
  await managementApiClient.terminateProcessInstance(identity, processInstanceId);
}
