import { ApiClient } from '../../client/api_client';
import { createResultJson } from '../../cli/result_json';
import { loadAtlasSession } from '../../session/atlas_session';
import { logError, logJsonResult } from '../../cli/logging';
import { toFilterRegexes } from '../../cli/filter_regexes';

import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';

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

  const apiClient = new ApiClient(session);

  let allProcessModels;
  if (pipedProcessModelIds != null) {
    allProcessModels = await apiClient.getProcessModelsByIds(pipedProcessModelIds);
  } else {
    allProcessModels = await apiClient.getProcessModels();
  }

  const filteredProcessModels = filterProcessModelsById(allProcessModels, filterById);

  const processModels = rejectProcessModelsById(filteredProcessModels, rejectById);

  const resultJson = createResultJson('process-models', mapToShort(processModels));

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      logJsonResult(resultJson);
      break;
    case OUTPUT_FORMAT_TEXT:
      console.table(resultJson.result, ['id', 'startEventIds']);
      break;
  }
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
