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
  try {
    // TODO: validation of input
    const afterDate = moment(completedAfter).format('YYYY-MM-DD');
    console.log(afterDate);

    return processInstances.filter((processInstance: FilterableProcessInstance) =>
      moment(processInstance['finishedAt']).isAfter(afterDate)
    );

  } catch (error) {
    console.error(`Invalid date format! Please enter a valid date format.`, error);
  }
}

export function filterProcessInstancesByEndTimeBefore(
  processInstances: FilterableProcessInstance[],
  completedBefore: string
): any[] {
  if (completedBefore == null) {
    return processInstances;
  }
  try {
     // TODO: validation of input
    const beforeDate = moment(completedBefore).format('YYYY-MM-DD');
    console.log(beforeDate);

    return processInstances.filter((processInstance: FilterableProcessInstance) =>
      moment(processInstance['finishedAt']).isBefore(beforeDate)
    );

  } catch (error){
    console.error(`Invalid date format! Please enter a valid date format.`, error);
  }
}

export function filterProcessInstanceByExecutionTime(
  processInstances: FilterableProcessInstance[],
  filterByExecutionTime: string
  ): any[] {

    if (filterByExecutionTime == null) {
      return processInstances;
    }
      //const regexp = new RegExp("([<]|[>]) +[ 0-9]{1,}");
    
      const regex = /([<]|[>]) +[ 0-9]{1,}[smhd.]/g;
      const isCorrectExecutionTime = regex.test(filterByExecutionTime);
      if (!isCorrectExecutionTime){
        throw console.error('Invalid execution time format.');
      }
      const lastIndexOfExecutionTime = filterByExecutionTime.substr(filterByExecutionTime.length - 1);
      
      const numberFilter = parseInt(filterByExecutionTime
        .replace("<", "")
        .replace(">", "")
        .replace("h", ""));

      if (lastIndexOfExecutionTime == 's'){
        console.log('Calculation of the execution time in seconds.')
        return processInstances.filter((processInstance: FilterableProcessInstance) => {
          const executionTime = moment(processInstance.finishedAt).diff(processInstance.createdAt, 'seconds');
          return executionTime > numberFilter;
        }
        );
      }
      if (lastIndexOfExecutionTime == 'm'){
        console.log('Calculation of the execution time in minutes.')
        return processInstances.filter((processInstance: FilterableProcessInstance) => {
          const executionTime = moment(processInstance.finishedAt).diff(processInstance.createdAt, 'minute');
          return executionTime > numberFilter;
        }
        );
      }
      if (lastIndexOfExecutionTime == 'h'){
        console.log('Calculation of the execution time in hours.')
        return processInstances.filter((processInstance: FilterableProcessInstance) => {
          const executionTime = moment(processInstance.finishedAt).diff(processInstance.createdAt, 'hours');
          return executionTime > numberFilter;
        }
        );
      }
      if (lastIndexOfExecutionTime == 'd'){
        console.log('Calculation of the execution time in days.')
        return processInstances.filter((processInstance: FilterableProcessInstance) => {
          const executionTime = moment(processInstance.finishedAt).diff(processInstance.createdAt, 'days');
          return executionTime > numberFilter;
        }
        );
      }
}