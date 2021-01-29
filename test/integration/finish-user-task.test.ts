import * as assert from 'assert';
import { threadId } from 'worker_threads';
import { execAsDefault, execAsJson, execAsText } from './exec_as';

describe('atlas', () => {
  it('should work with JSON output', async () => {
    execAsText('login http://localhost:56000 --root');

    execAsJson('session-status');

    execAsJson('deploy-files fixtures/Generate_Email_Adress.bpmn');

    const result = execAsJson('start-process-model Generate_Email_Adress StartEvent_1mox3jl --input-values \'{"seconds": 1}\'');
    const processInstanceId = result?.result[0]?.processInstanceId;
    assert.notEqual(processInstanceId, null);

    execAsJson('list-user-tasks');

    const flowNodeInstanceId = result?.result[0].flowNodeInstanceId;
    assert.notEqual(flowNodeInstanceId, null);

    execAsJson(`finish-user-task ${flowNodeInstanceId}`);

    execAsJson('list-user-tasks');
  
    execAsText('logout');

    const session = execAsJson('session-status');
    assert.equal(session.accessToken, null);

    assert.ok(true);
  });

  it('should work with text output', async () => {
    execAsText('login http://localhost:56000 --root');

    execAsText('session-status');

    execAsText('deploy-files fixtures/Generate_Email_Adress.bpmn');

    const result = execAsJson('start-process-model Generate_Email_Adress StartEvent_1mox3jl --input-values \'{"seconds": 1}\'');
    const processInstanceId = result?.result[0]?.processInstanceId;
    assert.notEqual(processInstanceId, null);

    execAsText('list-user-tasks');

    const flowNodeInstanceId = result?.result[0].flowNodeInstanceId;
    assert.notEqual(flowNodeInstanceId, null);

    execAsText(`finish-user-task ${flowNodeInstanceId}`);

    execAsText('list-user-tasks');

    execAsText('logout');

    execAsText('session-status');

    assert.ok(true);
  });

  it('should work with help output', async () => {
    execAsText('--help');

    execAsText('login http://localhost:56000 --root --help');

    execAsText('session-status --help');

    execAsText('deploy-files fixtures/Generate_Email_Adress.bpmn --help');

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
