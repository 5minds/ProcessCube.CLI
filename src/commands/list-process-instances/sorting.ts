type SortableProcessInstance = {
  createdAt?: any; // is given as string, but should be a Date according to the management_api_contracts
  processModelId: string;
  state: string;
};

// TODO: `string` seems unnecessary here
type SortingDirection = 'asc' | 'desc' | string;

export function sortProcessInstances(
  processInstances: SortableProcessInstance[],
  sortByProcessModelId: SortingDirection | null,
  sortByState: SortingDirection | null,
  sortByCreatedAt: SortingDirection | null
): any[] {
  const compareFns = [];
  if (sortByProcessModelId != null) {
    compareFns.push(sortByProcessModelId === 'asc' ? sortByProcessModelIdAscFn : sortByProcessModelIdDescFn);
  }
  if (sortByState != null) {
    compareFns.push(sortByState === 'asc' ? sortByStateAscFn : sortByStateDescFn);
  }
  compareFns.push(sortByCreatedAt === 'asc' ? sortByCreatedAtAscFn : sortByCreatedAtDescFn);

  const metaCompareFn = (a: SortableProcessInstance, b: SortableProcessInstance) => {
    for (const compareFn of compareFns) {
      const result = compareFn(a, b);
      if (result != 0) {
        return result;
      }
    }
    return 0;
  };

  return processInstances.sort(metaCompareFn);
}

export function sortUserTasks(
  processInstances: SortableProcessInstance[],
  sortByProcessModelId: SortingDirection | null,
  sortByState: SortingDirection | null
): any[] {
  const compareFns = [];
  if (sortByProcessModelId != null) {
    compareFns.push(sortByProcessModelId === 'asc' ? sortByProcessModelIdAscFn : sortByProcessModelIdDescFn);
  }
  if (sortByState != null) {
    compareFns.push(sortByState === 'asc' ? sortByStateAscFn : sortByStateDescFn);
  }

  const metaCompareFn = (a: SortableProcessInstance, b: SortableProcessInstance) => {
    for (const compareFn of compareFns) {
      const result = compareFn(a, b);
      if (result != 0) {
        return result;
      }
    }
    return 0;
  };

  return processInstances.sort(metaCompareFn);
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
