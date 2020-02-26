import chalk from 'chalk';
import * as fs from 'fs';
import * as glob from 'glob';

import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { createResultJson } from '../../cli/result_json';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { getProcessModelIdFromBpmn } from '../../cli/bpmn';

export async function deploy(globPatterns: string[], format: string): Promise<void> {
  const session = loadAtlasSession();
  if (session == null) {
    console.log(chalk.red('No session found. Aborting.'));
    return;
  }

  for (const pattern of globPatterns) {
    const files = glob.sync(pattern);
    for (const filename of files) {
      const result = await deployFileViaClient(session, filename);
    }
  }

  // const resultJson = createResultJson('process-instance-ids', processInstanceIds);

  // switch (format) {
  //   case OUTPUT_FORMAT_JSON:
  //     console.dir(resultJson, { depth: null });
  //     break;
  //   case OUTPUT_FORMAT_TEXT:
  //     console.table(processInstanceIds, ['processInstanceId', 'correlationId']);
  //     break;
  // }
}

export async function deployFileViaClient(session: AtlasSession, filename: string): Promise<void> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  const xml = fs.readFileSync(filename).toString();

  const name: string = await getProcessModelIdFromBpmn(xml);
  if (name == null) {
    throw new Error('Unexpected value: `processModel` should not be null here');
  }

  const payload = {
    xml: xml,
    overwriteExisting: true
  };

  await managementApiClient.updateProcessDefinitionsByName(identity, name, payload);

  console.log(chalk.greenBright('deployed:'), filename, '->', name);
}
