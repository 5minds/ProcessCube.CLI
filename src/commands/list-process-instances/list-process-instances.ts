import { DataModels } from '@process-engine/management_api_contracts';

import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { createResultJson } from '../../cli/result_json';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';

import { filterProcessModelsById } from '../list-process-models/list-process-models';

import {
  filterProcessInstancesByProcessModelId,
  filterProcessInstancesByState,
  filterProcessInstancesDateAfter,
  filterProcessInstancesDateBefore,
  rejectProcessInstancesByProcessModelId,
  rejectProcessInstancesByState
} from './filtering';
import { sortProcessInstances } from './sorting';
import { logError, logJsonResult, logNoValidSessionError } from '../../cli/logging';
import { ApiClient } from '../../client/api_client';

export type ProcessInstance = DataModels.Correlations.ProcessInstance;

export async function listProcessInstances(
  pipedProcessInstanceIds: string[] | null,
  pipedProcessModelIds: string[] | null,
  createdAfter: string,
  createdBefore: string,
  filterByCorrelationId: string[],
  filterByProcessModelId: string[],
  rejectByProcessModelId: string[],
  filterByState: string[],
  rejectByState: string[],
  sortByProcessModelId: string,
  sortByState: string,
  sortByCreatedAt: string,
  limit: number,
  outputFormat: string
) {
  const session = loadAtlasSession();
  if (session == null) {
    logNoValidSessionError();
    return;
  }

  const processInstances = await getProcessInstances(
    session,
    pipedProcessInstanceIds,
    pipedProcessModelIds,
    createdAfter,
    createdBefore,
    filterByCorrelationId,
    filterByProcessModelId,
    rejectByProcessModelId,
    filterByState,
    rejectByState,
    sortByProcessModelId,
    sortByState,
    sortByCreatedAt,
    limit
  );

  const resultJson = createResultJson('process-instances', mapToShort(processInstances));

  if (outputFormat === OUTPUT_FORMAT_JSON) {
    logJsonResult(resultJson);
  } else if (outputFormat === OUTPUT_FORMAT_TEXT) {
    console.table(processInstances, [
      'createdAt',
      'finishedAt',
      'processModelId',
      'processInstanceId',
      'state',
      'correlationId'
    ]);
  }
}

async function getProcessInstances(
  session: AtlasSession,
  pipedProcessInstanceIds: string[] | null,
  pipedProcessModelIds: string[] | null,
  createdAfter: string,
  createdBefore: string,
  filterByCorrelationId: string[],
  filterByProcessModelId: string[],
  rejectByProcessModelId: string[],
  filterByState: string[],
  rejectByState: string[],
  sortByProcessModelId: string,
  sortByState: string,
  sortByCreatedAt: string,
  limit: number
): Promise<ProcessInstance[]> {
  let allProcessInstances = await getAllProcessInstances(
    session,
    filterByCorrelationId,
    filterByProcessModelId,
    rejectByProcessModelId,
    filterByState,
    rejectByState
  );

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
  filterByCorrelationId: string[],
  filterByProcessModelId: string[],
  rejectByProcessModelId: string[],
  filterByState: string[],
  rejectByState: string[]
): Promise<ProcessInstance[]> {
  let allProcessInstances: ProcessInstance[];
  if (filterByCorrelationId.length > 0) {
    allProcessInstances = await getAllProcessInstancesViaCorrelations(session, filterByCorrelationId);
  } else if (filterByState.length > 0) {
    allProcessInstances = await getAllProcessInstancesViaStateAndFilterByProcessModelId(
      session,
      filterByState,
      filterByProcessModelId
    );
  } else {
    allProcessInstances = await getAllProcessInstancesViaAllProcessModels(session, filterByProcessModelId);
  }

  allProcessInstances = filterProcessInstancesByProcessModelId(allProcessInstances, filterByProcessModelId);
  allProcessInstances = filterProcessInstancesByState(allProcessInstances, filterByState);
  allProcessInstances = rejectProcessInstancesByProcessModelId(allProcessInstances, rejectByProcessModelId);
  allProcessInstances = rejectProcessInstancesByState(allProcessInstances, rejectByState);

  return allProcessInstances;
}

async function getAllProcessInstancesViaCorrelations(
  session: AtlasSession,
  correlationIds: string[]
): Promise<ProcessInstance[]> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  let allProcessInstances = [];
  for (const correlationId of correlationIds) {
    const result = await managementApiClient.getProcessInstancesForCorrelation(identity, correlationId);
    allProcessInstances = allProcessInstances.concat(result.processInstances);
  }

  return allProcessInstances;
}

async function getAllProcessInstancesViaAllProcessModels(
  session: AtlasSession,
  filterByProcessModelId: string[]
): Promise<ProcessInstance[]> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  const apiClient = new ApiClient(session);
  const allProcessModels = await apiClient.getProcessModels();

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

  return allProcessInstances;
}

function mapToShort(list: any): string[] {
  return list.map((processInstance: any) => {
    return { ...processInstance, xml: '...', identity: '...' };
  });
}
