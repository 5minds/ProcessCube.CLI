import * as moment from 'moment';

import { toFilterRegexes } from '../cli/filter_regexes';

type FilterableProcessInstance = {
  createdAt?: any; // is given as string, but should be a Date according to the management_api_contracts
  finishedAt?: any;
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

export function filterProcessInstancesByEndTimeAfter(
  processInstances: FilterableProcessInstance[],
  completedAfter: string
): any[] {
  if (completedAfter == null) {
    return processInstances;
  }
  if (!moment(completedAfter).isValid()) {

    throw new Error(`Invalid date format '${completedAfter}'! Please enter a valid date format.`);
  }
  const afterDate = moment(completedAfter);

  return processInstances.filter((processInstance: FilterableProcessInstance) => {

    if (!processInstance['finishedAt']) {
      return false;
    }
    
    return moment(processInstance['finishedAt']).isAfter(afterDate);
  
  });
}

export function filterProcessInstancesByEndTimeBefore(
  processInstances: FilterableProcessInstance[],
  completedBefore: string
): any[] {
  if (completedBefore == null) {
    return processInstances;
  }
  if (!moment(completedBefore).isValid()){

    throw new Error(`Invalid date format '${completedBefore}'! Please enter a valid date format.`);
  }

  const beforeDate = moment(completedBefore);

  return processInstances.filter((processInstance: FilterableProcessInstance) => {

    if (!processInstance['finishedAt']) {
      return false;
    }
    
    return moment(processInstance['finishedAt']).isBefore(beforeDate);
  
  });
  
}

export function filterProcessInstancesByExecutionTime(
  processInstances: FilterableProcessInstance[],
  filterByExecutionTime: string
): any[] {

    if (filterByExecutionTime == null) {
      return processInstances;
    }
      const regexExecutionTime = /([<]|[>]) *([ 0-9]{1,}) *([smhd])/g;
      const executionTimeMatches = regexExecutionTime.exec(filterByExecutionTime);
    
      const lastIndexOfExecutionTime = filterByExecutionTime.substr(filterByExecutionTime.length - 1);

      if (executionTimeMatches == null){
        throw new Error(`Unable to parse completed-in parameter '${filterByExecutionTime}'. '${lastIndexOfExecutionTime}' is not known unit of time. Please use either d, h, m or s.`);
      }
      
      const parsedComparisonType = executionTimeMatches[1];

      const parsedTime = executionTimeMatches[2];
      const time = parseInt(parsedTime);

      const parsedUnitOfTime = executionTimeMatches[3];
      const unitOfTime = getUnitOfTimeForAbbreviation(parsedUnitOfTime);
 
      return processInstances.filter((processInstance: FilterableProcessInstance) => isCompletedIn(processInstance, parsedComparisonType, time, unitOfTime));  
}

function getUnitOfTimeForAbbreviation(abbreviation: string): moment.unitOfTime.Diff {
  switch(abbreviation) {
    case 'd':
      return 'days';
    case 'h':
      return 'hours';
    case 'm':
      return 'minutes';
    case 's':
      return 'seconds';
  }
}

function isCompletedIn(processInstance: FilterableProcessInstance, comparisonType: string, time: number, unitOfTime: moment.unitOfTime.Diff): boolean {
  if (comparisonType === '>') {
    return moment(processInstance.createdAt)
      .add(time, unitOfTime)
      .isBefore(processInstance.finishedAt);
  } else if (comparisonType === '<') {
    return moment(processInstance.createdAt)
      .add(time, unitOfTime)
      .isAfter(processInstance.finishedAt);
  } 

  throw new Error(`Unknown comparison type: '${comparisonType}'. It should be > or <.`);
}
