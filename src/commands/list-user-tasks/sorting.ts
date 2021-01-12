type SortableUserTask = {
    processModelId: string;
    state: string;
  };
  
  // TODO: `string` seems unnecessary here
  type SortingDirection = 'asc' | 'desc' | string;
  
  export function sortUserTasks(
    userTasks: SortableUserTask[],
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
  
    const metaCompareFn = (a: SortableUserTask, b: SortableUserTask) => {
      for (const compareFn of compareFns) {
        const result = compareFn(a, b);
        if (result != 0) {
          return result;
        }
      }
      return 0;
    };
  
    return userTasks.sort(metaCompareFn);
  }
  
  const sortByProcessModelIdAscFn = (a: SortableUserTask, b: SortableUserTask) => {
    if (a.processModelId < b.processModelId) {
      return -1;
    }
    if (a.processModelId > b.processModelId) {
      return 1;
    }
    return 0;
  };
  
  const sortByProcessModelIdDescFn = (a: SortableUserTask, b: SortableUserTask) => {
    if (a.processModelId > b.processModelId) {
      return -1;
    }
    if (a.processModelId < b.processModelId) {
      return 1;
    }
    return 0;
  };
  
  const sortByStateAscFn = (a: SortableUserTask, b: SortableUserTask) => {
    if (a.state < b.state) {
      return -1;
    }
    if (a.state > b.state) {
      return 1;
    }
    return 0;
  };
  
  const sortByStateDescFn = (a: SortableUserTask, b: SortableUserTask) => {
    if (a.state > b.state) {
      return -1;
    }
    if (a.state < b.state) {
      return 1;
    }
    return 0;
  };
  