import * as JSON5 from 'json5';

export const PROCESS_A_userTask_01_error = {
  id: 'PROCESS_A_userTask_01_error',
  processModelId: 'Process_A',
  flowNodeInstanceId: 'Process_A',
  state: 'error'
};
export const PROCESS_A_userTask_02_error = {
  id: 'PROCESS_A_userTask_02_error',
  processModelId: 'Process_A',
  flowNodeInstanceId: 'Process_A',
  state: 'error',
};
export const PROCESS_A_userTask_03_finished = {
  id: 'PROCESS_A_userTask_03_finished',
  processModelId: 'Process_A',
  flowNodeInstanceId: 'Process_A',
  state: 'finished'
};

export const PROCESS_B_userTask_04_running = {
  id: 'PROCESS_B_userTask_04_running',
  processModelId: 'Process_B',
  flowNodeInstanceId: 'Process_B',
  state: 'running'
};

export const PROCESS_B_userTask_07_finished = {
  id: 'PROCESS_B_userTask_07_finished',
  processModelId: 'Process_B',
  flowNodeInstanceId: 'Process_B',
  state: 'finished'
};

export const PROCESS_C_userTask_05_finished = {
  id: 'PROCESS_C_userTask_05_finished',
  processModelId: 'Process_C',
  flowNodeInstanceId: 'Process_C',
  state: 'finished'
};

export const PROCESS_C_userTask_06_error = {
  id: 'PROCESS_C_userTask_06_error',
  processModelId: 'Process_C',
  flowNodeInstanceId: 'Process_C',
  state: 'error'
};

export const USER_TASKS = [
  PROCESS_A_userTask_01_error,
  PROCESS_A_userTask_03_finished,
  PROCESS_B_userTask_04_running,
  PROCESS_C_userTask_06_error,
  PROCESS_B_userTask_07_finished,
  PROCESS_A_userTask_02_error,
  PROCESS_C_userTask_05_finished,

];

export function getMockedUserTasks() {
  return JSON5.parse(JSON.stringify(USER_TASKS));
}

export function mapIds(list: any): string[] {
  return list.map((item) => item.id);
}