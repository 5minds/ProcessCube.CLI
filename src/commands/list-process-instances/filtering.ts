import * as moment from 'moment';

import { toFilterRegexes } from '../../cli/filter_regexes';
import { ProcessInstance } from './list-process-instances';

export function filterProcessInstancesDateAfter(
  processInstances: ProcessInstance[],
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
  processInstances: ProcessInstance[],
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

export function filterProcessInstancesByState(processInstances: ProcessInstance[], filterByState: string[]): any[] {
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
