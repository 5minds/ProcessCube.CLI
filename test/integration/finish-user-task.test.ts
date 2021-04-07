import * as assert from 'assert';
import { execAsJson, execAsText } from './exec_as';

describe('atlas', () => {
  it('should work with JSON output', async () => {
    execAsText('login http://localhost:10560 --root');

    execAsJson('session-status');

    execAsJson('deploy-files fixtures/E-Mail-Adresse-Generieren.bpmn');

    execAsJson('start-process-model E-Mail-Adresse-Generieren StartEvent_1mox3jl --input-values \'{"seconds": 1}\'');

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

    execAsText('logout');

    const session = execAsJson('session-status');
    assert.equal(session.accessToken, null);
  });
});
