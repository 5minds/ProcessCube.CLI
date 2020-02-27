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
  filterProcessInstancesByProcessModelId
} from './filtering';
import { sortProcessInstances } from './sorting';

export type ProcessInstance = DataModels.Correlations.ProcessInstance;

export async function listProcessInstances(
  pipedProcessInstanceIds: string[] | null,
  pipedProcessModelIds: string[] | null,
  createdAfter: string,
  createdBefore: string,
  filterByProcessModelId: string[],
  filterByState: string[],
  sortByProcessModelId: string,
  sortByState: string,
  sortByCreatedAt: string,
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
    pipedProcessInstanceIds,
    pipedProcessModelIds,
    createdAfter,
    createdBefore,
    filterByProcessModelId,
    filterByState,
    sortByProcessModelId,
    sortByState,
    sortByCreatedAt,
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
  pipedProcessInstanceIds: string[] | null,
  pipedProcessModelIds: string[] | null,
  createdAfter: string,
  createdBefore: string,
  filterByProcessModelId: string[],
  filterByState: string[],
  sortByProcessModelId: string,
  sortByState: string,
  sortByCreatedAt: string,
  limit: number
): Promise<ProcessInstance[]> {
  let allProcessInstances = await getAllProcessInstances(session, filterByProcessModelId, filterByState);

  if (pipedProcessInstanceIds != null) {
    allProcessInstances = allProcessInstances.filter((processInstance: any) =>
      pipedProcessInstanceIds.includes(processInstance.processInstanceId)
    );
  }

  if (pipedProcessModelIds != null) {
    allProcessInstances = allProcessInstances.filter((processInstance: any) =>
      pipedProcessModelIds.includes(processInstance.processModelId)
    );
  }

  allProcessInstances = filterProcessInstancesDateAfter(allProcessInstances, 'createdAt', createdAfter);
  allProcessInstances = filterProcessInstancesDateBefore(allProcessInstances, 'createdAt', createdBefore);

  allProcessInstances = sortProcessInstances(allProcessInstances, sortByProcessModelId, sortByState, sortByCreatedAt);

  const processInstances = allProcessInstances;

  if (limit != null && limit > 0) {
    return processInstances.slice(0, limit);
  }

  return processInstances;
}

async function getAllProcessInstances(
  session: AtlasSession,
  filterByProcessModelId: string[],
  filterByState: string[]
): Promise<ProcessInstance[]> {
  if (filterByState.length > 0) {
    return getAllProcessInstancesViaStateAndFilterByProcessModelId(session, filterByState, filterByProcessModelId);
  }

  return getAllProcessInstancesViaAllProcessModels(session, filterByProcessModelId);
}

async function getAllProcessInstancesViaAllProcessModels(
  session: AtlasSession,
  filterByProcessModelId: string[]
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

  return allProcessInstances;
}

async function getAllProcessInstancesViaStateAndFilterByProcessModelId(
  session: AtlasSession,
  filterByState: string[],
  filterByProcessModelId: string[]
): Promise<ProcessInstance[]> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  let allProcessInstances = [];
  for (const state of filterByState) {
    const result = await managementApiClient.getProcessInstancesByState(
      identity,
      state as DataModels.Correlations.CorrelationState
    );

    allProcessInstances = allProcessInstances.concat(result.processInstances);
  }

  const processInstances = filterProcessInstancesByProcessModelId(allProcessInstances, filterByProcessModelId);

  return processInstances;
}

function mapToShort(list: any): string[] {
  return list.map((processInstance: any) => {
    return { ...processInstance, xml: '...', identity: '...' };
  });
}
