import chalk from 'chalk';

import { DataModels } from '@process-engine/management_api_contracts';

import { createResultJson } from '../../cli/result_json';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { loadAtlasSession } from '../../session/atlas_session';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';

type ProcessInstance = DataModels.Correlations.ProcessInstance;

export async function showProcessInstance(processInstanceIds: string[], options: any, format: string): Promise<void> {
  const session = loadAtlasSession();
  if (session == null) {
    console.log(chalk.red('No session found. Aborting.'));
    return;
  }
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  const processInstances: ProcessInstance[] = [];
  for (const processInstanceId of processInstanceIds) {
    const processInstance = await managementApiClient.getProcessInstanceById(identity, processInstanceId);

    processInstances.push(processInstance);
  }

  const resultJson = createResultJson('process-instances', processInstances);

  switch (format) {
    case OUTPUT_FORMAT_JSON:
      console.dir(resultJson, { depth: null });
      break;
    case OUTPUT_FORMAT_TEXT:
      console.table(processInstances, ['createdAt', 'finishedAt', 'processModelId', 'processInstanceId', 'state']);
      break;
  }
}
