import { ProcessInstance } from './list-process-instances';

export function sortProcessInstancesByProcessModelId(
  processInstances: ProcessInstance[],
  sortByProcessModelId: string
): any[] {
  if (sortByProcessModelId == null) {
    return processInstances;
  }

  const sortByProcessModelIdAscFn = (a: ProcessInstance, b: ProcessInstance) => {
    if (a.processModelId < b.processModelId) {
      return -1;
    }
    if (a.processModelId > b.processModelId) {
      return 1;
    }
    return 0;
  };

  const sortByProcessModelIdDescFn = (a: ProcessInstance, b: ProcessInstance) => {
    if (a.processModelId > b.processModelId) {
      return -1;
    }
    if (a.processModelId < b.processModelId) {
      return 1;
    }
    return 0;
  };

  const sortByProcessModelIdFn =
    sortByProcessModelId.toLowerCase() === 'asc' ? sortByProcessModelIdAscFn : sortByProcessModelIdDescFn;

  return processInstances.sort(sortByProcessModelIdFn);
}

export function sortProcessInstancesByState(processInstances: ProcessInstance[], sortByState: string): any[] {
  if (sortByState == null) {
    return processInstances;
  }

  const sortByStateAscFn = (a: ProcessInstance, b: ProcessInstance) => {
    if (a.state < b.state) {
      return -1;
    }
    if (a.state > b.state) {
      return 1;
    }
    return 0;
  };

  const sortByStateDescFn = (a: ProcessInstance, b: ProcessInstance) => {
    if (a.state > b.state) {
      return -1;
    }
    if (a.state < b.state) {
      return 1;
    }
    return 0;
  };

  const sortByStateFn = sortByState.toLowerCase() === 'asc' ? sortByStateAscFn : sortByStateDescFn;

  return processInstances.sort(sortByStateFn);
}

export function sortProcessInstancesByCreatedAt(processInstances: ProcessInstance[], sortByCreatedAt: string): any[] {
  if (sortByCreatedAt == null) {
    return processInstances;
  }

  const sortByCreatedAtAscFn = (a: ProcessInstance, b: ProcessInstance) => {
    if (a.createdAt < b.createdAt) {
      return -1;
    }
    if (a.createdAt > b.createdAt) {
      return 1;
    }
    return 0;
  };

  const sortByCreatedAtDescFn = (a: ProcessInstance, b: ProcessInstance) => {
    if (a.createdAt > b.createdAt) {
      return -1;
    }
    if (a.createdAt < b.createdAt) {
      return 1;
    }
    return 0;
  };

  const sortByCreatedAtFn = sortByCreatedAt.toLowerCase() === 'asc' ? sortByCreatedAtAscFn : sortByCreatedAtDescFn;

  return processInstances.sort(sortByCreatedAtFn);
}
