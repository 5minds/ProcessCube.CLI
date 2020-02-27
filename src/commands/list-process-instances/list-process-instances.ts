import chalk from 'chalk';

import { DataModels } from '@process-engine/management_api_contracts';

import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { createResultJson } from '../../cli/result_json';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';

import { getProcessModels, filterProcessModelsById } from '../list-process-models/list-process-models';

import {
  filterProcessInstancesDateAfter,
  filterProcessInstancesDateBefore,
  filterProcessInstancesByState
} from './filtering';
import {
  sortProcessInstancesByProcessModelId,
  sortProcessInstancesByState,
  sortProcessInstancesByCreatedAt
} from './sorting';

export type ProcessInstance = DataModels.Correlations.ProcessInstance;

export async function listProcessInstances(
  createdAfter: string,
  createdBefore: string,
  filterByProcessModelId: string[],
  filterByState: string[],
  sortByCreatedAt: string,
  sortByProcessModelId: string,
  sortByState: string,
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
    sortByCreatedAt,
    sortByProcessModelId,
    sortByState,
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
  sortByCreatedAt: string,
  sortByProcessModelId: string,
  sortByState: string,
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
  allProcessInstances = filterProcessInstancesByState(allProcessInstances, filterByState);

  allProcessInstances = sortProcessInstancesByProcessModelId(allProcessInstances, sortByProcessModelId);
  allProcessInstances = sortProcessInstancesByState(allProcessInstances, sortByState);
  allProcessInstances = sortProcessInstancesByCreatedAt(allProcessInstances, sortByCreatedAt);

  const processInstances = allProcessInstances;

  if (limit != null && limit > 0) {
    return processInstances.slice(0, limit);
  }

  return processInstances;
}

function mapToShort(list: any): string[] {
  return list.map((processInstance: any) => {
    return { ...processInstance, xml: '...', identity: '...' };
  });
}
