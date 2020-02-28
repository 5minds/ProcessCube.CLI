import { createResultJson } from '../../cli/result_json';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { loadAtlasSession, AtlasSession } from '../../session/atlas_session';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { toFilterRegexes } from '../../cli/filter_regexes';
import { logError } from '../../cli/logging';

export async function listProcessModels(
  pipedProcessModelIds: string[] | null,
  filterById: string[],
  rejectById: string[],
  outputFormat: string
) {
  const session = loadAtlasSession();
  if (session == null) {
    logError('No session found. Aborting.');
    return;
  }

  const allProcessModels = await getProcessModels(session, pipedProcessModelIds);

  const filteredProcessModels = filterProcessModelsById(allProcessModels, filterById);

  const processModels = rejectProcessModelsById(filteredProcessModels, rejectById);

  const resultJson = createResultJson('process-models', mapToShort(processModels));

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      console.log(JSON.stringify(resultJson, null, 2));
      break;
    case OUTPUT_FORMAT_TEXT:
      console.table(resultJson.result, ['id', 'startEventIds']);
      break;
  }
}

export async function getProcessModels(
  session: AtlasSession,
  pipedProcessModelIds: string[] | null = null
): Promise<any[]> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  const result = await managementApiClient.getProcessModels(identity);

  if (pipedProcessModelIds != null) {
    return result.processModels.filter((processModel: any) => pipedProcessModelIds.includes(processModel.id));
  }

  return result.processModels;
}

export function filterProcessModelsById(processModels: any[], filterById: string[]): any[] {
  if (filterById.length === 0) {
    return processModels;
  }

  const filterRegexes = toFilterRegexes(filterById);

  return processModels.filter((processModel: any) => {
    const anyFilterMatched = filterRegexes.some((regex: RegExp) => processModel.id.match(regex) != null);
    return anyFilterMatched;
  });
}

export function rejectProcessModelsById(processModels: any[], rejectById: string[]): any[] {
  if (rejectById.length === 0) {
    return processModels;
  }

  const filterRegexes = toFilterRegexes(rejectById);

  return processModels.filter((processModel: any) => {
    const anyFilterMatched = filterRegexes.some((regex: RegExp) => processModel.id.match(regex) != null);
    return !anyFilterMatched;
  });
}

function mapToShort(list: any): string[] {
  return list.map((model: any) => {
    return { ...model, xml: '...', startEventIds: model.startEvents.map((event: any) => event.id) };
  });
}
