import * as assert from 'assert';
import { execAsDefault, execAsJson, execAsText } from './exec_as';

describe('atlas', () => {
  it('should work with JSON output', async () => {
    execAsText('login http://localhost:8000 --root');

    execAsJson('session-status');

    execAsJson('deploy-files fixtures/E-Mail-Adresse-Generieren.bpmn');

    const result = execAsJson('start-process-model E-Mail-Adresse-Generieren StartEvent_1mox3jl --input-values \'{"seconds": 1}\'');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const listUserTasksResult = execAsJson('list-user-tasks');
    assert.ok(listUserTasksResult.result.length > 0, 'There should be user tasks.');

    const state = listUserTasksResult?.result[0]?.state;

    if (state == 'suspended'){
      const flowNodeInstanceId = listUserTasksResult?.result[0]?.flowNodeInstanceId;
      execAsJson(`finish-user-task ${flowNodeInstanceId}`);
    };

    const resultState = listUserTasksResult?.[0]?.state;

    const listUserTasksAfterFinished = execAsJson('list-user-tasks');
    assert.strictEqual(listUserTasksAfterFinished.result.length, listUserTasksResult.result.length);
  
    execAsText('logout');

    const session = execAsJson('session-status');
    assert.equal(session.accessToken, null);

    assert.ok(true);
  });

  it('should work with text output', async () => {
    execAsText('login http://localhost:8000 --root');

    execAsText('session-status');

    execAsText('deploy-files fixtures/E-Mail-Adresse-Generieren.bpmn');

    execAsText('start-process-model E-Mail-Adresse-Generieren StartEvent_1mox3jl --input-values \'{"seconds": 1}\'');
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const listUserTasksResult = execAsText('list-user-tasks');
    const state = listUserTasksResult?.result?.state;

    if (state == 'suspended'){
      const flowNodeInstanceId = listUserTasksResult?.result[0]?.flowNodeInstanceId;
      execAsText(`finish-user-task ${flowNodeInstanceId}`);
    };

    execAsText('list-user-tasks');

    execAsText('logout');

    execAsText('session-status');

    assert.ok(true);
  });

  it('should work with help output', async () => {
    execAsText('--help');

    execAsText('login http://localhost:8000 --root --help');

    execAsText('session-status --help');

    execAsText('deploy-files fixtures/E-Mail-Adresse-Generieren.bpmn --help');

    execAsText('start-process-model --help');

    execAsText('list-user-tasks --help');

    execAsText('finish-user-task --help');

    execAsText('list-user-tasks --help');

    execAsText('logout --help');

    execAsText('session-status --help');

    assert.ok(true);
  });

  it('should fail and show help output if no or invalid command was given', async () => {
    try {
      execAsDefault('');
    } catch(error) {
      assert.ok(error.message.includes(execAsDefault('--help')));
    }

    try {
      execAsDefault('nonexistingcommand');
    } catch(error) {
      assert.ok(error.message.includes(execAsDefault('--help')));
    }
  });
});
