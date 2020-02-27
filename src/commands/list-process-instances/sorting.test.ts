import * as assert from 'assert';

import {
  sortProcessInstancesByProcessModelId,
  sortProcessInstancesByCreatedAt,
  sortProcessInstancesByState
} from './sorting';

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
  describe('sortProcessInstancesByCreatedAt()', () => {
    it('should sort by createdAt ASC', () => {
      const result = sortProcessInstancesByCreatedAt(getMockedProcessInstances(), 'asc');

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

    it('should sort by createdAt DESC', () => {
      const result = sortProcessInstancesByCreatedAt(getMockedProcessInstances(), 'desc');

      const expected = [
        PROCESS_B_createdAt_07_finished,
        PROCESS_C_createdAt_06_error,
        PROCESS_C_createdAt_05_finished,
        PROCESS_B_createdAt_04_running,
        PROCESS_A_createdAt_03_finished,
        PROCESS_A_createdAt_02_error,
        PROCESS_A_createdAt_01_error
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });
  });

  describe('sortProcessInstancesByProcessModelId()', () => {
    it('should sort by processModelId ASC', () => {
      const result = sortProcessInstancesByProcessModelId(getMockedProcessInstances(), 'asc');

      const expected = [
        PROCESS_A_createdAt_01_error,
        PROCESS_A_createdAt_03_finished,
        PROCESS_A_createdAt_02_error,
        PROCESS_B_createdAt_04_running,
        PROCESS_B_createdAt_07_finished,
        PROCESS_C_createdAt_06_error,
        PROCESS_C_createdAt_05_finished
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should sort by processModelId DESC', () => {
      const result = sortProcessInstancesByProcessModelId(getMockedProcessInstances(), 'desc');
      const expected = [
        PROCESS_C_createdAt_06_error,
        PROCESS_C_createdAt_05_finished,
        PROCESS_B_createdAt_04_running,
        PROCESS_B_createdAt_07_finished,
        PROCESS_A_createdAt_01_error,
        PROCESS_A_createdAt_03_finished,
        PROCESS_A_createdAt_02_error
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });
  });

  describe('sortProcessInstancesByState()', () => {
    it('should sort by state ASC', () => {
      const result = sortProcessInstancesByState(getMockedProcessInstances(), 'asc');

      const expected = [
        PROCESS_A_createdAt_01_error,
        PROCESS_C_createdAt_06_error,
        PROCESS_A_createdAt_02_error,
        PROCESS_A_createdAt_03_finished,
        PROCESS_B_createdAt_07_finished,
        PROCESS_C_createdAt_05_finished,
        PROCESS_B_createdAt_04_running
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });

    it('should sort by state DESC', () => {
      const result = sortProcessInstancesByState(getMockedProcessInstances(), 'desc');
      const expected = [
        PROCESS_B_createdAt_04_running,
        PROCESS_A_createdAt_03_finished,
        PROCESS_B_createdAt_07_finished,
        PROCESS_C_createdAt_05_finished,
        PROCESS_A_createdAt_01_error,
        PROCESS_C_createdAt_06_error,
        PROCESS_A_createdAt_02_error
      ];

      assert.deepStrictEqual(mapIds(result), mapIds(expected));
    });
  });
});
