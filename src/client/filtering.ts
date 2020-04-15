import * as moment from 'moment';

import { toFilterRegexes } from '../cli/filter_regexes';

type FilterableProcessInstance = {
  createdAt?: any; // is given as string, but should be a Date according to the management_api_contracts
  processModelId: string;
  state: string;
};

export function filterProcessInstancesDateAfter(
  processInstances: FilterableProcessInstance[],
  fieldName: string,
  createdAfter: string
): any[] {
  if (createdAfter == null) {
    return processInstances;
  }

  // TODO: validation of input
  const afterDate = moment(createdAfter);

  return processInstances.filter((processInstance: FilterableProcessInstance) =>
    moment(processInstance[fieldName]).isAfter(afterDate)
  );
}

export function filterProcessInstancesDateBefore(
  processInstances: FilterableProcessInstance[],
  fieldName: string,
  createdBefore: string
): any[] {
  if (createdBefore == null) {
    return processInstances;
  }

  // TODO: validation of input
  const beforeDate = moment(createdBefore);

  return processInstances.filter((processInstance: FilterableProcessInstance) =>
    moment(processInstance[fieldName]).isBefore(beforeDate)
  );
}

export function filterProcessInstancesByState(
  processInstances: FilterableProcessInstance[],
  filterByState: string[]
): any[] {
  if (filterByState.length === 0) {
    return processInstances;
  }

  return processInstances.filter((processInstance: FilterableProcessInstance) => {
    const anyFilterMatched = filterByState.some((state: string) => processInstance.state === state);
    return anyFilterMatched;
  });
}

export function rejectProcessInstancesByState(
  processInstances: FilterableProcessInstance[],
  rejectByState: string[]
): any[] {
  if (rejectByState.length === 0) {
    return processInstances;
  }

  return processInstances.filter((processInstance: FilterableProcessInstance) => {
    const anyFilterMatched = rejectByState.some((state: string) => processInstance.state === state);
    return !anyFilterMatched;
  });
}

export function filterProcessInstancesByProcessModelId(
  processInstances: FilterableProcessInstance[],
  filterByProcessModelId: string[]
): any[] {
  if (filterByProcessModelId.length === 0) {
    return processInstances;
  }

  const filterRegexes = toFilterRegexes(filterByProcessModelId);

  return processInstances.filter((processInstance: FilterableProcessInstance) => {
    const anyFilterMatched = filterRegexes.some((regex: RegExp) => processInstance.processModelId.match(regex) != null);
    return anyFilterMatched;
  });
}

export function rejectProcessInstancesByProcessModelId(
  processInstances: FilterableProcessInstance[],
  filterByProcessModelId: string[]
): any[] {
  if (filterByProcessModelId.length === 0) {
    return processInstances;
  }

  const filterRegexes = toFilterRegexes(filterByProcessModelId);

  return processInstances.filter((processInstance: FilterableProcessInstance) => {
    const anyFilterMatched = filterRegexes.some((regex: RegExp) => processInstance.processModelId.match(regex) != null);
    return !anyFilterMatched;
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
