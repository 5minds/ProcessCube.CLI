import * as assert from 'assert';

import { filterProcessInstancesByProcessModelId, filterProcessInstancesByState} from './filtering';

import {
  getMockedUserTasks,
  mapIds
} from '../commands/list-user-tasks/test-mocks.test';

describe('filtering user tasks', () => {
  describe('filterUserTasksByState()', () => {
    it('should filter by state with wide pattern', () => {
      const userTasks = getMockedUserTasks();
      const result = filterProcessInstancesByState(userTasks, ['error', 'running', 'finished']);

      const expected = userTasks;

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
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
  });
});
