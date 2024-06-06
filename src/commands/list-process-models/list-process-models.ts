import chalk from 'chalk';

import { toFilterRegexes } from '../../cli/filter_regexes';
import { logError, logJsonResult, logJsonResultAsTextTable } from '../../cli/logging';
import { addJsonPipingHintToResultJson, createResultJson } from '../../cli/result_json';
import { ApiClient } from '../../client/api_client';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';
import { loadSession } from '../../session/session';

export async function listProcessModels(
  pipedProcessModelIds: string[] | null,
  filterById: string[],
  rejectById: string[],
  showAllFields: boolean,
  outputFormat: string,
) {
  const session = loadSession();
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

  let resultProcessModels;
  if (showAllFields) {
    resultProcessModels = mapToLong(processModels);
  } else {
    resultProcessModels = mapToShort(processModels);
  }

  let resultJson = createResultJson('process-models', resultProcessModels);
  resultJson = addJsonPipingHintToResultJson(resultJson);

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      logJsonResult(resultJson);
      break;
    case OUTPUT_FORMAT_TEXT:
      logJsonResultAsTextTable(resultJson, ['id', 'name', 'startEventIds'], 'List of Process Models');
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

function mapToShort(list: any): any[] {
  return addStartEventIds(list).map((model: any) => {
    return { ...model, xml: '...' };
  });
}

function mapToLong(list: any): any[] {
  return addStartEventIds(list);
}

function addStartEventIds(list: any): any[] {
  return list.map((model: any) => {
    return { ...model, startEventIds: model.startEvents.map((event: any) => event.id) };
  });
}
