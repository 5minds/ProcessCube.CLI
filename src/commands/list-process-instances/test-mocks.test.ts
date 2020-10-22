import * as JSON5 from 'json5';

export const PROCESS_A_createdAt_01_error = {
  id: 'PROCESS_A_createdAt_01_error',
  createdAt: '2019-06-06T11:12:53.252Z',
  processModelId: 'Process_A',
  state: 'error'
};
export const PROCESS_A_createdAt_02_error = {
  id: 'PROCESS_A_createdAt_02_error',
  createdAt: '2019-06-16T11:12:53.252Z',
  processModelId: 'Process_A',
  state: 'error'
};
export const PROCESS_A_createdAt_03_finished = {
  id: 'PROCESS_A_createdAt_03_finished',
  createdAt: '2019-06-26T11:12:53.252Z',
  processModelId: 'Process_A',
  state: 'finished'
};

export const PROCESS_B_createdAt_04_running = {
  id: 'PROCESS_B_createdAt_04_running',
  createdAt: '2019-07-26T11:12:53.252Z',
  processModelId: 'Process_B',
  state: 'running'
};

export const PROCESS_B_createdAt_07_finished = {
  id: 'PROCESS_B_createdAt_07_finished',
  createdAt: '2019-10-26T11:12:53.252Z',
  processModelId: 'Process_B',
  state: 'finished'
};

export const PROCESS_C_createdAt_05_finished = {
  id: 'PROCESS_C_createdAt_05_finished',
  createdAt: '2019-08-26T11:12:53.252Z',
  processModelId: 'Process_C',
  state: 'finished'
};

export const PROCESS_C_createdAt_06_error = {
  id: 'PROCESS_C_createdAt_06_error',
  createdAt: '2019-09-26T11:12:53.252Z',
  processModelId: 'Process_C',
  state: 'error'
};

export const PROCESS_INSTANCES = [
  PROCESS_A_createdAt_01_error,
  PROCESS_A_createdAt_03_finished,
  PROCESS_B_createdAt_04_running,
  PROCESS_C_createdAt_06_error,
  PROCESS_B_createdAt_07_finished,
  PROCESS_A_createdAt_02_error,
  PROCESS_C_createdAt_05_finished,

];

export function getMockedProcessInstances() {
  return JSON5.parse(JSON.stringify(PROCESS_INSTANCES));
}

export function mapIds(list: any): string[] {
  return list.map((item) => item.id);
}
