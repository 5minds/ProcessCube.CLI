import * as assert from 'assert';

import { filterProcessInstancesByEndTimeAfter, filterProcessInstancesByEndTimeBefore, filterProcessInstanceByExecutionTime, 
         filterProcessInstancesByProcessModelId, filterProcessInstancesByState} from './filtering';

import {
  PROCESS_A_completedIn_24_days_01_error,
  PROCESS_A_completedIn_2_hours_02_error,
  PROCESS_A_completedIn_10_minutes_03_finished,
  PROCESS_B_completedIn_04_running,
  PROCESS_B_completedIn_3_seconds_07_finished,
  PROCESS_C_completedIn_50_milliseconds_05_finished,
  PROCESS_C_completedIn_1_years_06_error,
  getMockedProcessInstances,
  mapIds
} from './completedIn-test-mocks.test';

describe('filtering', () => {
  describe('filterProcessInstancesDateBefore()', () => {
    it('should filter by createdAt before', () => {
      const processInstances = getMockedProcessInstances();
      const result = filterProcessInstancesByState(processInstances, ['error', 'running', 'finished']);

      const expected = processInstances;

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });
  });

  describe('filterProcessInstancesByState()', () => {
    it('should filter by state with wide pattern', () => {
      const processInstances = getMockedProcessInstances();
      const result = filterProcessInstancesByState(processInstances, ['error', 'running', 'finished']);

      const expected = processInstances;

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should filter by state with specific pattern: error', () => {
      const processInstances = getMockedProcessInstances();
      const result = filterProcessInstancesByState(processInstances, ['error']);

      const expected = [PROCESS_A_completedIn_24_days_01_error, PROCESS_A_completedIn_2_hours_02_error, PROCESS_C_completedIn_1_years_06_error];
      const expectedIds = mapIds(expected);

      for (const resultId of mapIds(result)) {
        assert.ok(expectedIds.includes(resultId), `'${resultId}' should not appear in result`);
      }

      assert.deepStrictEqual(result.length, expected.length);
    });
  });

  describe('filterProcessInstancesByProcessModelId()', () => {
    it('should filter by processModelId with wide pattern: Process_', () => {
      const processInstances = getMockedProcessInstances();
      const result = filterProcessInstancesByProcessModelId(processInstances, ['Process_']);

      const expected = processInstances;

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should filter by processModelId with wide regex pattern: Process_', () => {
      const processInstances = getMockedProcessInstances();
      const result = filterProcessInstancesByProcessModelId(processInstances, ['^Process_\\w$']);

      const expected = processInstances;

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should filter by processModelId with specific pattern: Process_A', () => {
      const processInstances = getMockedProcessInstances();
      const result = filterProcessInstancesByProcessModelId(processInstances, ['Process_A']);

      const expected = [PROCESS_A_completedIn_24_days_01_error, PROCESS_A_completedIn_2_hours_02_error, PROCESS_A_completedIn_10_minutes_03_finished];
      const expectedIds = mapIds(expected);

      for (const resultId of mapIds(result)) {
        assert.ok(expectedIds.includes(resultId), `'${resultId}' should not appear in result`);
      }

      assert.deepStrictEqual(result.length, expected.length);
    });
  });

  describe('filterProcessInstancesByEndTimeAfter()', () => {
    it('should filter by finishedAt after', () => {
      const processInstances = getMockedProcessInstances();
      const result = filterProcessInstancesByEndTimeAfter(processInstances, '2019-06-26T11:22:53.252Z');

      const expected = [PROCESS_A_completedIn_24_days_01_error, PROCESS_C_completedIn_50_milliseconds_05_finished, PROCESS_C_completedIn_1_years_06_error];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });
  });

  describe('filterProcessInstancesByEndTimeBefore()', () => {
    it('should filter by createdAt before', () => {
      const processInstances = getMockedProcessInstances();
      const result = filterProcessInstancesByEndTimeBefore(processInstances, '2019-06-26T11:22:53.252Z');

      const expected = [PROCESS_A_completedIn_2_hours_02_error, PROCESS_B_completedIn_3_seconds_07_finished];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });
  });

  describe('filterProcessInstanceExecutionTime()', () => {
    it('should filter by execution time', () => {
      const processInstances = getMockedProcessInstances();

      const resultForGreaterThanSeconds = filterProcessInstanceByExecutionTime(processInstances, '> 3s');
      const resultForGreaterThanMinutes = filterProcessInstanceByExecutionTime(processInstances, '> 10m');
      const resultForGreaterThanHours = filterProcessInstanceByExecutionTime(processInstances, '> 2h');
      const resultForGreaterThanDays = filterProcessInstanceByExecutionTime(processInstances, '> 24d');

      const resultForLessThanSeconds = filterProcessInstanceByExecutionTime(processInstances, '< 3s');
      const resultForLessThanMinutes = filterProcessInstanceByExecutionTime(processInstances, '< 10m');
      const resultForLessThanHours = filterProcessInstanceByExecutionTime(processInstances, '< 2h');
      const resultForLessThanDays = filterProcessInstanceByExecutionTime(processInstances, '< 24d');

      const expectedForGreaterThanSeconds = [PROCESS_A_completedIn_24_days_01_error,
        PROCESS_A_completedIn_2_hours_02_error,
        PROCESS_A_completedIn_10_minutes_03_finished,
        PROCESS_B_completedIn_04_running,
        PROCESS_C_completedIn_1_years_06_error
      ];

      const expectedForGreaterThanMinutes = [PROCESS_A_completedIn_24_days_01_error, 
        PROCESS_A_completedIn_2_hours_02_error,
        PROCESS_B_completedIn_04_running,
        PROCESS_C_completedIn_1_years_06_error
      ];

      const expectedForGreaterThanHours = [PROCESS_A_completedIn_24_days_01_error, PROCESS_B_completedIn_04_running, PROCESS_C_completedIn_1_years_06_error];

      const expectedForGreaterThanDays = [PROCESS_B_completedIn_04_running,PROCESS_C_completedIn_1_years_06_error];

      const expectedForLessThanSeconds = [PROCESS_C_completedIn_50_milliseconds_05_finished];

      const expectedForLessThanMinutes = [PROCESS_B_completedIn_3_seconds_07_finished, PROCESS_C_completedIn_50_milliseconds_05_finished];

      const expectedForLessThanHours = [PROCESS_A_completedIn_10_minutes_03_finished, 
        PROCESS_B_completedIn_3_seconds_07_finished, 
        PROCESS_C_completedIn_50_milliseconds_05_finished
      ];

      const expectedForLessThanDays = [PROCESS_A_completedIn_2_hours_02_error,
        PROCESS_A_completedIn_10_minutes_03_finished, 
        PROCESS_B_completedIn_3_seconds_07_finished, 
        PROCESS_C_completedIn_50_milliseconds_05_finished
      ];

      assert.deepStrictEqual(mapIds(resultForGreaterThanSeconds), mapIds(expectedForGreaterThanSeconds));
      assert.deepStrictEqual(mapIds(resultForGreaterThanMinutes), mapIds(expectedForGreaterThanMinutes));
      assert.deepStrictEqual(mapIds(resultForGreaterThanHours), mapIds(expectedForGreaterThanHours));
      assert.deepStrictEqual(mapIds(resultForGreaterThanDays), mapIds(expectedForGreaterThanDays));

      assert.deepStrictEqual(mapIds(resultForLessThanSeconds), mapIds(expectedForLessThanSeconds));
      assert.deepStrictEqual(mapIds(resultForLessThanMinutes), mapIds(expectedForLessThanMinutes));
      assert.deepStrictEqual(mapIds(resultForLessThanHours), mapIds(expectedForLessThanHours));
      assert.deepStrictEqual(mapIds(resultForLessThanDays), mapIds(expectedForLessThanDays));

    });
  });
});
