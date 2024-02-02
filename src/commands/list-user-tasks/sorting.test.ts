import 'mocha';
import * as assert from 'assert';

import { sortUserTasks } from './sorting';

import {
  getMockedUserTasks,
  PROCESS_A_userTask_01_error,
  PROCESS_A_userTask_02_error,
  PROCESS_A_userTask_03_finished,
  PROCESS_B_userTask_04_running,
  PROCESS_C_userTask_05_finished,
  PROCESS_C_userTask_06_error,
  PROCESS_B_userTask_07_finished,
  mapIds,
} from './test-mocks.test';

describe('sorting user tasks', () => {
  describe('sortUserTasks()', () => {
    it('should sort by processModelId DESC, state ASC', () => {
      const result = sortUserTasks(getMockedUserTasks(), 'desc', 'asc');

      const expected = [
        PROCESS_C_userTask_06_error,
        PROCESS_C_userTask_05_finished,
        PROCESS_B_userTask_07_finished,
        PROCESS_B_userTask_04_running,
        PROCESS_A_userTask_01_error,
        PROCESS_A_userTask_02_error,
        PROCESS_A_userTask_03_finished,
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should sort by processModelId DESC, state DESC', () => {
      const result = sortUserTasks(getMockedUserTasks(), 'desc', 'desc');

      const expected = [
        PROCESS_C_userTask_05_finished,
        PROCESS_C_userTask_06_error,
        PROCESS_B_userTask_04_running,
        PROCESS_B_userTask_07_finished,
        PROCESS_A_userTask_03_finished,
        PROCESS_A_userTask_01_error,
        PROCESS_A_userTask_02_error,
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should sort by processModelId ASC, state ASC', () => {
      const result = sortUserTasks(getMockedUserTasks(), 'asc', 'asc');

      const expected = [
        PROCESS_A_userTask_01_error,
        PROCESS_A_userTask_02_error,
        PROCESS_A_userTask_03_finished,
        PROCESS_B_userTask_07_finished,
        PROCESS_B_userTask_04_running,
        PROCESS_C_userTask_06_error,
        PROCESS_C_userTask_05_finished,
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should sort by processModelId ASC, state DESC', () => {
      const result = sortUserTasks(getMockedUserTasks(), 'asc', 'desc');

      const expected = [
        PROCESS_A_userTask_03_finished,
        PROCESS_A_userTask_01_error,
        PROCESS_A_userTask_02_error,
        PROCESS_B_userTask_04_running,
        PROCESS_B_userTask_07_finished,
        PROCESS_C_userTask_05_finished,
        PROCESS_C_userTask_06_error,
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });
  });
});
