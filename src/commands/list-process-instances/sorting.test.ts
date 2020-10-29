import * as assert from 'assert';

import { sortProcessInstances } from './sorting';

import {
  getMockedProcessInstances,
  PROCESS_A_createdAt_01_error,
  PROCESS_A_createdAt_02_error,
  PROCESS_A_createdAt_03_finished,
  PROCESS_B_createdAt_04_running,
  PROCESS_C_createdAt_05_finished,
  PROCESS_C_createdAt_06_error,
  PROCESS_B_createdAt_07_finished,
  mapIds
} from './test-mocks.test';

describe('sorting', () => {
  describe('sortProcessInstances()', () => {
    it('should sort by createdAt DESC', () => {
      const result = sortProcessInstances(getMockedProcessInstances(), null, null, null);

      const expected = [
        PROCESS_B_createdAt_07_finished,
        PROCESS_C_createdAt_06_error,
        PROCESS_C_createdAt_05_finished,
        PROCESS_B_createdAt_04_running,
        PROCESS_A_createdAt_03_finished,
        PROCESS_A_createdAt_02_error,
        PROCESS_A_createdAt_01_error,
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should sort by createdAt ASC', () => {
      const result = sortProcessInstances(getMockedProcessInstances(), null, null, 'asc');

      const expected = [
        PROCESS_A_createdAt_01_error,
        PROCESS_A_createdAt_02_error,
        PROCESS_A_createdAt_03_finished,
        PROCESS_B_createdAt_04_running,
        PROCESS_C_createdAt_05_finished,
        PROCESS_C_createdAt_06_error,
        PROCESS_B_createdAt_07_finished
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should sort by createdAt ASC, state ASC', () => {
      const result = sortProcessInstances(getMockedProcessInstances(), null, 'asc', 'asc');

      const expected = [
        PROCESS_A_createdAt_01_error,
        PROCESS_A_createdAt_02_error,
        PROCESS_C_createdAt_06_error,
        PROCESS_A_createdAt_03_finished,
        PROCESS_C_createdAt_05_finished,
        PROCESS_B_createdAt_07_finished,
        PROCESS_B_createdAt_04_running
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should sort by ,rocessModelId DESC, state ASC, createdAt ASC', () => {
      const result = sortProcessInstances(getMockedProcessInstances(), 'desc', 'asc', 'asc');

      const expected = [
        PROCESS_C_createdAt_06_error,
        PROCESS_C_createdAt_05_finished,
        PROCESS_B_createdAt_07_finished,
        PROCESS_B_createdAt_04_running,
        PROCESS_A_createdAt_01_error,
        PROCESS_A_createdAt_02_error,
        PROCESS_A_createdAt_03_finished
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should sort by processModelId ASC, state ASC, createdAt ASC', () => {
      const result = sortProcessInstances(getMockedProcessInstances(), 'asc', 'asc', 'asc');

      const expected = [
        PROCESS_A_createdAt_01_error,
        PROCESS_A_createdAt_02_error,
        PROCESS_A_createdAt_03_finished,
        PROCESS_B_createdAt_07_finished,
        PROCESS_B_createdAt_04_running,
        PROCESS_C_createdAt_06_error,
        PROCESS_C_createdAt_05_finished
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should sort by processModelId ASC, state DESC, createdAt ASC', () => {
      const result = sortProcessInstances(getMockedProcessInstances(), 'asc', 'desc', 'asc');

      const expected = [
        PROCESS_A_createdAt_03_finished,
        PROCESS_A_createdAt_01_error,
        PROCESS_A_createdAt_02_error,
        PROCESS_B_createdAt_04_running,
        PROCESS_B_createdAt_07_finished,
        PROCESS_C_createdAt_05_finished,
        PROCESS_C_createdAt_06_error
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should sort by processModelId DESC, state -, createdAt ASC', () => {
      const result = sortProcessInstances(getMockedProcessInstances(), 'desc', null, 'asc');

      const expected = [
        PROCESS_C_createdAt_05_finished,
        PROCESS_C_createdAt_06_error,
        PROCESS_B_createdAt_04_running,
        PROCESS_B_createdAt_07_finished,
        PROCESS_A_createdAt_01_error,
        PROCESS_A_createdAt_02_error,
        PROCESS_A_createdAt_03_finished
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should sort by processModelId ASC, state -, createdAt DESC', () => {
      const result = sortProcessInstances(getMockedProcessInstances(), 'asc', null, 'desc');

      const expected = [
        PROCESS_A_createdAt_03_finished,
        PROCESS_A_createdAt_02_error,
        PROCESS_A_createdAt_01_error,
        PROCESS_B_createdAt_07_finished,
        PROCESS_B_createdAt_04_running,
        PROCESS_C_createdAt_06_error,
        PROCESS_C_createdAt_05_finished
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });
  });
});
