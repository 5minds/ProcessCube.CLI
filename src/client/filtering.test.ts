import * as assert from 'assert';

import { filterProcessInstancesByProcessModelId, filterProcessInstancesByState, filterProcessInstancesByEndTimeAfter,
         filterProcessInstancesByEndTimeBefore, filterProcessInstanceByExecutionTime} from './filtering';

import {
  PROCESS_A_createdAt_01_error,
  PROCESS_A_createdAt_02_error,
  PROCESS_A_createdAt_03_finished,
  PROCESS_B_createdAt_04_running,
  PROCESS_B_createdAt_07_finished,
  PROCESS_C_createdAt_05_finished,
  PROCESS_C_createdAt_06_error,
  ProcessInstanceA,
  ProcessInstanceB,
  ProcessInstanceC,
  getMockedProcessInstances,
  mapIds
} from '../commands/list-process-instances/test-mocks.test';

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

      const expected = [PROCESS_A_createdAt_01_error, PROCESS_A_createdAt_02_error, PROCESS_C_createdAt_06_error];
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

      const expected = [PROCESS_A_createdAt_01_error, PROCESS_A_createdAt_02_error, PROCESS_A_createdAt_03_finished];
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
      const result = filterProcessInstancesByEndTimeAfter(processInstances, '2020-01-01T08:56:22.060Z');

      const expected = [ProcessInstanceA, ProcessInstanceB];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });
  });

  describe('filterProcessInstancesByEndTimeBefore()', () => {
    it('should filter by createdAt before', () => {
      const processInstances = getMockedProcessInstances();
      const result = filterProcessInstancesByEndTimeBefore(processInstances, '2020-10-30T08:56:22.060Z');

      const expected = [ProcessInstanceA, ProcessInstanceB];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });
  });

  describe('filterProcessInstanceExecutionTime()', () => {
    it('should filter by execution time', () => {
      const processInstances = getMockedProcessInstances();
      const result = filterProcessInstanceByExecutionTime(processInstances, '> 5h');

      const expected = [ProcessInstanceC];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });
  });
});
