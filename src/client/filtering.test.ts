import * as assert from 'assert';

import {
  PROCESS_A_completedIn_2_hours_02_error,
  PROCESS_A_completedIn_10_minutes_03_finished,
  PROCESS_A_completedIn_24_days_01_error,
  PROCESS_B_completedIn_04_running,
  PROCESS_B_completedIn_3_seconds_07_finished,
  PROCESS_C_completedIn_1_years_06_error,
  PROCESS_C_completedIn_50_milliseconds_05_finished,
  getMockedProcessInstances,
  mapIds,
} from './completedIn-test-mocks.test';
import {
  filterProcessInstancesByEndTimeAfter,
  filterProcessInstancesByEndTimeBefore,
  filterProcessInstancesByExecutionTime,
  filterProcessInstancesByProcessModelId,
  filterProcessInstancesByState,
} from './filtering';

describe('filtering process instances', () => {
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

      const expected = [
        PROCESS_A_completedIn_24_days_01_error,
        PROCESS_A_completedIn_2_hours_02_error,
        PROCESS_C_completedIn_1_years_06_error,
      ];
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

      const expected = [
        PROCESS_A_completedIn_24_days_01_error,
        PROCESS_A_completedIn_2_hours_02_error,
        PROCESS_A_completedIn_10_minutes_03_finished,
      ];
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

      const expected = [
        PROCESS_A_completedIn_24_days_01_error,
        PROCESS_C_completedIn_50_milliseconds_05_finished,
        PROCESS_C_completedIn_1_years_06_error,
      ];

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
    it('should filter by execution time > 3s', () => {
      const processInstances = getMockedProcessInstances();

      const resultForGreaterThanSeconds = filterProcessInstancesByExecutionTime(processInstances, '> 3s');

      const expectedForGreaterThanSeconds = [
        PROCESS_A_completedIn_24_days_01_error,
        PROCESS_A_completedIn_2_hours_02_error,
        PROCESS_A_completedIn_10_minutes_03_finished,
        PROCESS_B_completedIn_04_running,
        PROCESS_C_completedIn_1_years_06_error,
      ];
      assert.deepStrictEqual(mapIds(resultForGreaterThanSeconds), mapIds(expectedForGreaterThanSeconds));
    });

    it('should filter by execution time > 10m', () => {
      const processInstances = getMockedProcessInstances();

      const resultForGreaterThanMinutes = filterProcessInstancesByExecutionTime(processInstances, '> 10m');

      const expectedForGreaterThanMinutes = [
        PROCESS_A_completedIn_24_days_01_error,
        PROCESS_A_completedIn_2_hours_02_error,
        PROCESS_B_completedIn_04_running,
        PROCESS_C_completedIn_1_years_06_error,
      ];
      assert.deepStrictEqual(mapIds(resultForGreaterThanMinutes), mapIds(expectedForGreaterThanMinutes));
    });

    it('should filter by execution time > 2h', () => {
      const processInstances = getMockedProcessInstances();

      const resultForGreaterThanHours = filterProcessInstancesByExecutionTime(processInstances, '> 2h');

      const expectedForGreaterThanHours = [
        PROCESS_A_completedIn_24_days_01_error,
        PROCESS_B_completedIn_04_running,
        PROCESS_C_completedIn_1_years_06_error,
      ];

      assert.deepStrictEqual(mapIds(resultForGreaterThanHours), mapIds(expectedForGreaterThanHours));
    });

    it('should filter by execution time > 24d', () => {
      const processInstances = getMockedProcessInstances();

      const resultForGreaterThanDays = filterProcessInstancesByExecutionTime(processInstances, '> 24d');

      const expectedForGreaterThanDays = [PROCESS_B_completedIn_04_running, PROCESS_C_completedIn_1_years_06_error];

      assert.deepStrictEqual(mapIds(resultForGreaterThanDays), mapIds(expectedForGreaterThanDays));
    });

    it('should filter by execution time < 3s', () => {
      const processInstances = getMockedProcessInstances();

      const resultForLessThanSeconds = filterProcessInstancesByExecutionTime(processInstances, '< 3s');

      const expectedForLessThanSeconds = [PROCESS_C_completedIn_50_milliseconds_05_finished];

      assert.deepStrictEqual(mapIds(resultForLessThanSeconds), mapIds(expectedForLessThanSeconds));
    });

    it('should filter by execution time < 10m', () => {
      const processInstances = getMockedProcessInstances();

      const resultForLessThanMinutes = filterProcessInstancesByExecutionTime(processInstances, '< 10m');

      const expectedForLessThanMinutes = [
        PROCESS_B_completedIn_3_seconds_07_finished,
        PROCESS_C_completedIn_50_milliseconds_05_finished,
      ];

      assert.deepStrictEqual(mapIds(resultForLessThanMinutes), mapIds(expectedForLessThanMinutes));
    });

    it('should filter by execution time < 2h', () => {
      const processInstances = getMockedProcessInstances();

      const resultForLessThanHours = filterProcessInstancesByExecutionTime(processInstances, '< 2h');

      const expectedForLessThanHours = [
        PROCESS_A_completedIn_10_minutes_03_finished,
        PROCESS_B_completedIn_3_seconds_07_finished,
        PROCESS_C_completedIn_50_milliseconds_05_finished,
      ];

      assert.deepStrictEqual(mapIds(resultForLessThanHours), mapIds(expectedForLessThanHours));
    });

    it('should filter by execution time < 24d', () => {
      const processInstances = getMockedProcessInstances();

      const resultForLessThanDays = filterProcessInstancesByExecutionTime(processInstances, '< 24d');

      const expectedForLessThanDays = [
        PROCESS_A_completedIn_2_hours_02_error,
        PROCESS_A_completedIn_10_minutes_03_finished,
        PROCESS_B_completedIn_3_seconds_07_finished,
        PROCESS_C_completedIn_50_milliseconds_05_finished,
      ];

      assert.deepStrictEqual(mapIds(resultForLessThanDays), mapIds(expectedForLessThanDays));
    });
  });
});
