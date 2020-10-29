import * as JSON5 from 'json5';

export const PROCESS_A_completedIn_24_days_01_error = {
    id: 'PROCESS_A_completedIn_24_days_01_error',
    createdAt: '2019-06-06T11:12:53.252Z',
    finishedAt: '2019-06-30T11:12:53.252Z',
    processModelId: 'Process_A',
    state: 'error'
  };
  export const PROCESS_A_completedIn_2_hours_02_error = {
    id: 'PROCESS_A_completedIn_2_hours_02_error',
    createdAt: '2019-06-16T11:12:53.252Z',
    finishedAt: '2019-06-16T13:12:53.252Z',
    processModelId: 'Process_A',
    state: 'error'
  };
  export const PROCESS_A_completedIn_10_minutes_03_finished = {
    id: 'PROCESS_A_completedIn_10_minutes_03_finished',
    createdAt: '2019-06-26T11:12:53.252Z',
    finishedAt: '2019-06-26T11:22:53.252Z',
    processModelId: 'Process_A',
    state: 'finished'
  };
  
  export const PROCESS_B_completedIn_04_running = {
    id: 'PROCESS_B_completedIn_04_running',
    createdAt: '2019-07-26T11:12:53.252Z',
    processModelId: 'Process_B',
    state: 'running'
  };
  
  export const PROCESS_B_completedIn_3_seconds_07_finished = {
    id: 'PROCESS_B_completedIn_3_seconds_07_finished',
    createdAt: '2019-06-25T11:12:53.252Z',
    finishedAt: '2019-06-25T11:12:56.252Z',
    processModelId: 'Process_B',
    state: 'finished'
  };
  
  export const PROCESS_C_completedIn_50_milliseconds_05_finished = {
    id: 'PROCESS_C_completedIn_50_milliseconds_05_finished',
    createdAt: '2019-08-26T11:12:53.252Z',
    finishedAt: '2019-08-26T11:12:53.302Z',
    processModelId: 'Process_C',
    state: 'finished'
  };
  
  export const PROCESS_C_completedIn_1_years_06_error = {
    id: 'PROCESS_C_completedIn_1_years_06_error',
    createdAt: '2019-09-26T11:12:53.252Z',
    finishedAt: '2020-09-26T11:12:53.252Z',
    processModelId: 'Process_C',
    state: 'error'
  };

  export const COMPLETEDIN_PROCESS_INSTANCES = [
    PROCESS_A_completedIn_24_days_01_error,
    PROCESS_A_completedIn_2_hours_02_error,
    PROCESS_A_completedIn_10_minutes_03_finished,
    PROCESS_B_completedIn_04_running,
    PROCESS_B_completedIn_3_seconds_07_finished,
    PROCESS_C_completedIn_50_milliseconds_05_finished,
    PROCESS_C_completedIn_1_years_06_error
  
  ];

  export function getMockedProcessInstances() {
    return JSON5.parse(JSON.stringify(COMPLETEDIN_PROCESS_INSTANCES));
  }
  
  export function mapIds(list: any): string[] {
    return list.map((item) => item.id);
  }
  