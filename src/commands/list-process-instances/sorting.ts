type SortableProcessInstance = {
  createdAt?: any; // is given as string, but should be a Date according to the management_api_contracts
  processModelId: string;
  state: string;
};

// TODO: `string` seems unnecessary here
type SortingDirection = 'asc' | 'desc' | string;

export function sortProcessInstancesByProcessModelId(
  processInstances: SortableProcessInstance[],
  sortByProcessModelId: SortingDirection
): any[] {
  if (sortByProcessModelId == null) {
    return processInstances;
  }

  const sortByProcessModelIdAscFn = (a: SortableProcessInstance, b: SortableProcessInstance) => {
    if (a.processModelId < b.processModelId) {
      return -1;
    }
    if (a.processModelId > b.processModelId) {
      return 1;
    }
    return 0;
  };

  const sortByProcessModelIdDescFn = (a: SortableProcessInstance, b: SortableProcessInstance) => {
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

export function sortProcessInstancesByState(
  processInstances: SortableProcessInstance[],
  sortByState: SortingDirection
): any[] {
  if (sortByState == null) {
    return processInstances;
  }

  const sortByStateAscFn = (a: SortableProcessInstance, b: SortableProcessInstance) => {
    if (a.state < b.state) {
      return -1;
    }
    if (a.state > b.state) {
      return 1;
    }
    return 0;
  };

  const sortByStateDescFn = (a: SortableProcessInstance, b: SortableProcessInstance) => {
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

export function sortProcessInstancesByCreatedAt(
  processInstances: SortableProcessInstance[],
  sortByCreatedAt: SortingDirection
): any[] {
  if (sortByCreatedAt == null) {
    return processInstances;
  }

  const sortByCreatedAtAscFn = (a: SortableProcessInstance, b: SortableProcessInstance) => {
    if (a.createdAt < b.createdAt) {
      return -1;
    }
    if (a.createdAt > b.createdAt) {
      return 1;
    }
    return 0;
  };

  const sortByCreatedAtDescFn = (a: SortableProcessInstance, b: SortableProcessInstance) => {
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
