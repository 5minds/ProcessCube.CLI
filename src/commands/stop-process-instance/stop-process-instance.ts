import chalk from 'chalk';

import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { createResultJson } from '../../cli/result_json';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';

export async function stopProcessInstance(processInstanceIds: string[], options: any, format: string): Promise<void> {
  const session = loadAtlasSession();
  if (session == null) {
    console.log(chalk.red('No session found. Aborting.'));
    return;
  }

  // TODO: once we support multiple starts, we have to accumulate an array here
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

  const processInstanceBefore = await managementApiClient.getProcessInstanceById(identity, processInstanceId);

  console.log('processInstanceBefore', processInstanceBefore);

  // TODO: make sure the process instance was "alive" before and is terminated afterwards
  await managementApiClient.terminateProcessInstance(identity, processInstanceId);

  const result = await managementApiClient.getProcessInstanceById(identity, processInstanceId);

  console.log('result', result);
}
