import chalk from 'chalk';
import * as moment from 'moment';

import { DataModels } from '@process-engine/management_api_contracts';

import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { createResultJson } from '../../cli/result_json';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { getProcessModels } from '../list-process-models/list-process-models';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { toFilterRegexes } from '../../cli/filter_regexes';

type ProcessInstance = DataModels.Correlations.ProcessInstance;

export async function listProcessInstances(
  createdAfter: string,
  createdBefore: string,
  filterByProcessModelId: string[],
  filterByState: string[],
  limit: number,
  format: string
) {
  const session = loadAtlasSession();
  if (session == null) {
    console.log(chalk.red('No session found. Aborting.'));
    return;
  }

  const processInstances = await getProcessInstances(
    session,
    createdAfter,
    createdBefore,
    filterByProcessModelId,
    filterByState,
    limit
  );

  const resultJson = createResultJson('process-instances', mapToShort(processInstances));

  if (format === OUTPUT_FORMAT_JSON) {
    console.log(JSON.stringify(resultJson, null, 2));
  } else if (format === OUTPUT_FORMAT_TEXT) {
    console.table(processInstances, ['createdAt', 'finishedAt', 'processModelId', 'processInstanceId', 'state']);
  }
}

async function getProcessInstances(
  session: AtlasSession,
  createdAfter: string,
  createdBefore: string,
  filterByProcessModelId: string[],
  filterByState: string[],
  limit: number
): Promise<ProcessInstance[]> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  const allProcessModels = await getProcessModels(session);
  const processModels = filterProcessModelsById(allProcessModels, filterByProcessModelId);

  let allProcessInstances = [];
  for (const processModel of processModels) {
    try {
      const result = await managementApiClient.getProcessInstancesForProcessModel(identity, processModel.id);
      allProcessInstances = allProcessInstances.concat(result.processInstances);
    } catch (e) {
      if (e.message.includes('No ProcessInstances for ProcessModel')) {
        // OMG, why are we using errors for normal control-flow?
      } else {
        throw e;
      }
    }
  }

  allProcessInstances = filterProcessInstancesDateAfter(allProcessInstances, 'createdAt', createdAfter);
  allProcessInstances = filterProcessInstancesDateBefore(allProcessInstances, 'createdAt', createdBefore);

  const processInstances = filterProcessInstancesByState(allProcessInstances, filterByState);

  if (limit != null && limit > 0) {
    return processInstances.slice(0, limit);
  }

  return processInstances;
}

export function filterProcessInstancesDateAfter(
  processInstances: any[],
  fieldName: string,
  createdAfter: string
): any[] {
  if (createdAfter == null) {
    return processInstances;
  }

  // TODO: validation of input
  const afterDate = moment(createdAfter);

  return processInstances.filter((processInstance: any) => moment(processInstance[fieldName]).isAfter(afterDate));
}

export function filterProcessInstancesDateBefore(
  processInstances: any[],
  fieldName: string,
  createdBefore: string
): any[] {
  if (createdBefore == null) {
    return processInstances;
  }

  // TODO: validation of input
  const beforeDate = moment(createdBefore);

  return processInstances.filter((processInstance: any) => moment(processInstance[fieldName]).isBefore(beforeDate));
}

export function filterProcessInstancesByState(processInstances: any[], filterByState: string[]): any[] {
  if (filterByState.length === 0) {
    return processInstances;
  }

  return processInstances.filter((processInstance: any) => {
    const anyFilterMatched = filterByState.some((state: string) => processInstance.state === state);
    return anyFilterMatched;
  });
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
  return list.map((processInstance: any) => {
    return { ...processInstance, xml: '...' };
  });
}
