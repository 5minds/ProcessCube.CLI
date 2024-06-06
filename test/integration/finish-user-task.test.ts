import * as assert from 'assert';
import 'mocha';

import { execAsJson, loginAsRoot } from '../exec_as';

describe('list-user-tasks finish-user-task', () => {
  it('should list-user-tasks/finish-user-task with JSON output', async () => {
    await loginAsRoot(async () => {
      execAsJson('deploy-files fixtures/E-Mail-Adresse-Generieren.bpmn');

      execAsJson('start-process-model E-Mail-Adresse-Generieren StartEvent_1mox3jl --start-token \'{"seconds": 1}\'');

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const listUserTasksResult = execAsJson('list-user-tasks');
      assert.ok(listUserTasksResult.result.length > 0, 'Expected to get user tasks.');

      const state = listUserTasksResult?.result[0]?.state;
      assert.ok(state == 'suspended', 'Expected to be suspended');

      const flowNodeInstanceId = listUserTasksResult?.result[0]?.flowNodeInstanceId;
      execAsJson(`finish-user-task ${flowNodeInstanceId}`);

      const listUserTasksAfterFinished = execAsJson('list-user-tasks');

      const stateAfterFinishedUserTask = listUserTasksAfterFinished?.result[0]?.state;

      assert.ok(stateAfterFinishedUserTask == 'finished', 'Expected to be finished');
    });
  });
});
