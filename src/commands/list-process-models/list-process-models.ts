import chalk from 'chalk';

import { createResultJson } from '../../cli/result_json';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { loadAtlasSession, AtlasSession } from '../../session/atlas_session';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { toFilterRegexes } from '../../cli/filter_regexes';

export async function listProcessModels(options: any, format: string) {
  const session = loadAtlasSession();
  if (session == null) {
    console.log(chalk.red('No session found. Aborting.'));
    return;
  }

  const allProcessModels = await getProcessModels(session);

  const processModels = filterProcessModelsById(allProcessModels, options.filterById);

  const resultJson = createResultJson('process-models', mapToShort(processModels));

  switch (format) {
    case OUTPUT_FORMAT_JSON:
      console.dir(resultJson, { depth: null });
      break;
    case OUTPUT_FORMAT_TEXT:
      console.table(processModels, ['id', 'startEvents']);
      break;
  }
}

export async function getProcessModels(session: AtlasSession): Promise<any[]> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  const result = await managementApiClient.getProcessModels(identity);

  return result.processModels;
}

export function filterProcessModelsById(processModels: any[], filterById: string[]): any[] {
  if (filterById.length === 0) {
    return processModels;
  }

  const filterRegexes = toFilterRegexes(filterById);

  return processModels.filter((processModel: any) => {
    const anyFilterMatched = filterRegexes.some((regex: RegExp) => regex.exec(processModel.id) != null);
    return anyFilterMatched;
  });
}

function mapToShort(list: any): string[] {
  return list.map((model: any) => {
    return { ...model, xml: '...' };
  });
}
