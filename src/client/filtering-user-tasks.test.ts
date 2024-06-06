import * as assert from 'assert';

import {
  PROCESS_A_userTask_01_error,
  PROCESS_A_userTask_02_error,
  PROCESS_A_userTask_03_finished,
  PROCESS_C_userTask_06_error,
  getMockedUserTasks,
  mapIds,
} from '../commands/list-user-tasks/test-mocks.test';
import {
  filterProcessInstancesByProcessModelId,
  filterProcessInstancesByState,
  filterUserTasksByFlowNodeInstanceId,
} from './filtering';

describe('filtering user tasks', () => {
  describe('filterUserTasksByState()', () => {
    it('should filter by state with wide pattern', () => {
      const userTasks = getMockedUserTasks();
      const result = filterProcessInstancesByState(userTasks, ['error', 'running', 'finished']);

      const expected = userTasks;

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should filter by state with specific pattern: error', () => {
      const userTasks = getMockedUserTasks();
      const result = filterProcessInstancesByState(userTasks, ['error']);

      const expected = [PROCESS_A_userTask_01_error, PROCESS_A_userTask_02_error, PROCESS_C_userTask_06_error];
      const expectedIds = mapIds(expected);

      for (const resultId of mapIds(result)) {
        assert.ok(expectedIds.includes(resultId), `'${resultId}' should not appear in result`);
      }

      assert.deepStrictEqual(result.length, expected.length);
    });
  });

  describe('filterUserTasksByProcessModelId()', () => {
    it('should filter by processModelId with wide pattern: Process_', () => {
      const userTasks = getMockedUserTasks();
      const result = filterProcessInstancesByProcessModelId(userTasks, ['Process_']);

      const expected = userTasks;

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should filter by processModelId with wide regex pattern: Process_', () => {
      const userTasks = getMockedUserTasks();
      const result = filterProcessInstancesByProcessModelId(userTasks, ['^Process_\\w$']);

      const expected = userTasks;

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should filter by processModelId with specific pattern: Process_A', () => {
      const processInstances = getMockedUserTasks();
      const result = filterProcessInstancesByProcessModelId(processInstances, ['Process_A']);

      const expected = [PROCESS_A_userTask_01_error, PROCESS_A_userTask_02_error, PROCESS_A_userTask_03_finished];
      const expectedIds = mapIds(expected);

      for (const resultId of mapIds(result)) {
        assert.ok(expectedIds.includes(resultId), `'${resultId}' should not appear in result`);
      }

      assert.deepStrictEqual(result.length, expected.length);
    });
  });

  describe('filterUserTasksByFlowNodeInstanceId()', () => {
    it('should filter by flowNodeInstanceId with wide pattern: Process_', () => {
      const userTasks = getMockedUserTasks();
      const result = filterUserTasksByFlowNodeInstanceId(userTasks, ['Process_']);

      const expected = userTasks;

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should filter by flowNodeInstanceId with wide regex pattern: Process_', () => {
      const userTasks = getMockedUserTasks();
      const result = filterUserTasksByFlowNodeInstanceId(userTasks, ['^Process_\\w$']);

      const expected = userTasks;

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should filter by flowNodeInstanceId with specific pattern: Process_A', () => {
      const processInstances = getMockedUserTasks();
      const result = filterUserTasksByFlowNodeInstanceId(processInstances, ['Process_A']);

      const expected = [PROCESS_A_userTask_01_error, PROCESS_A_userTask_02_error, PROCESS_A_userTask_03_finished];
      const expectedIds = mapIds(expected);

      for (const resultId of mapIds(result)) {
        assert.ok(expectedIds.includes(resultId), `'${resultId}' should not appear in result`);
      }

      assert.deepStrictEqual(result.length, expected.length);
    });
  });
});
