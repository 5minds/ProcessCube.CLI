import chalk from 'chalk';
import * as yesno from 'yesno';

import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { createResultJson } from '../../cli/result_json';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { logError } from '../../cli/logging';

export async function removeProcessModels(processModelIds: string[], autoYes: boolean, format: string): Promise<void> {
  const session = loadAtlasSession();
  if (session == null) {
    logError('No session found. Aborting.');
    return;
  }

  if (autoYes !== true) {
    const yes = await yesno({
      question: 'Are you sure you want to continue?'
    });

    if (yes !== true) {
      console.log('User cancelled operation.');
      return;
    }
  }

  const removedProcessModelIds = [];
  for (const processModelId of processModelIds) {
    const success = await removeProcessModelViaClient(session, processModelId);
    if (success) {
      removedProcessModelIds.push(processModelId);
    }
  }

  const resultJson = createResultJson('removed-process-model-ids', removedProcessModelIds);

  switch (format) {
    case OUTPUT_FORMAT_JSON:
      console.log(JSON.stringify(resultJson, null, 2));
      break;
    case OUTPUT_FORMAT_TEXT:
      console.table(removedProcessModelIds, ['processInstanceId', 'correlationId']);
      break;
  }
}

export async function removeProcessModelViaClient(session: AtlasSession, processModelId: string): Promise<boolean> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  try {
    await managementApiClient.deleteProcessDefinitionsByProcessModelId(identity, processModelId);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
