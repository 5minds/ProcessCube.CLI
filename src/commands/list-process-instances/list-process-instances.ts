import chalk from 'chalk';

import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { createResultJson } from '../../cli/result_json';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { getProcessModels } from '../list-process-models/list-process-models';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { toFilterRegexes } from '../../cli/filter_regexes';

export async function listProcessInstances(filterByProcessModelId: string[], filterByState: string[], format: string) {
  const session = loadAtlasSession();
  if (session == null) {
    console.log(chalk.red('No session found. Aborting.'));
    return;
  }

  const processInstances = await getProcessInstances(session, filterByProcessModelId, filterByState);

  const resultJson = createResultJson('process-instance-ids', mapToShort(processInstances));

  if (format === OUTPUT_FORMAT_JSON) {
    console.dir(resultJson, { depth: null });
  } else if (format === OUTPUT_FORMAT_TEXT) {
    console.table(processInstances, ['createdAt', 'finishedAt', 'processModelId', 'processInstanceId', 'state']);
  }
}

export async function getProcessInstances(
  session: AtlasSession,
  filterByProcessModelId: string[],
  filterByState: string[]
): Promise<any[]> {
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

  const processInstances = filterProcessInstancesByState(allProcessInstances, filterByState);

  return processInstances;
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
