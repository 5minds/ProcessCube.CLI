import * as assert from 'assert';
import { execAsJson, execAsText } from '../exec_as';

describe('atlas', () => {
  it('should work with JSON output', async () => {
    execAsText('login http://localhost:10560 --root');

    execAsJson('session-status');

    execAsJson('deploy-files fixtures/wait-demo.bpmn');

    const result = execAsJson('start-process-model wait_demo StartEvent_1 --start-token \'{"seconds": 1}\'');
    const processInstanceId = result?.result[0]?.processInstanceId;
    assert.notEqual(processInstanceId, null);

    execAsJson('list-process-instances');

    execAsJson('list-process-instances --all-fields');

    execAsJson(`stop-process-instance ${processInstanceId}`);

    execAsJson(`show-process-instance ${processInstanceId}`);

    const processModelResult = execAsJson('list-process-models');
    assert.ok(processModelResult.result.length > 0, 'There should be process models.');

    execAsJson('list-process-models --all-fields');

    execAsJson('remove wait_demo --yes');

    const processModelResultAfterRemove = execAsJson('list-process-models');
    assert.strictEqual(processModelResultAfterRemove.result.length, processModelResult.result.length - 1);

    execAsText('logout');

    const session = execAsJson('session-status');
    assert.equal(session.accessToken, null);

    assert.ok(true);
  });

  it('should work with text output', async () => {
    execAsText('login http://localhost:10560 --root');

    execAsText('session-status');

    execAsText('deploy-files fixtures/wait-demo.bpmn');

    const result = execAsJson('start-process-model wait_demo StartEvent_1 --start-token \'{"seconds": 1}\'');
    const processInstanceId = result?.result[0]?.processInstanceId;
    assert.notEqual(processInstanceId, null);

    execAsText('list-process-instances');

    execAsText('list-process-instances --all-fields');

    execAsText(`stop-process-instance ${processInstanceId}`);

    execAsText(`show-process-instance ${processInstanceId}`);

    execAsText('list-process-models');

    execAsText('list-process-models --all-fields');

    execAsText('remove wait_demo --yes');

    execAsText('list-process-models');

    execAsText('logout');

    execAsText('session-status');

    assert.ok(true);
  });

  it('should work with help output', async () => {
    execAsText('--help');

    execAsText('login http://localhost:10560 --root --help');

    execAsText('session-status --help');

    execAsText('deploy-files fixtures/wait-demo.bpmn --help');

    execAsText('start-process-model --help');

    execAsText('list-process-instances --help');

    execAsText(`stop-process-instance --help`);

    execAsText(`show-process-instance --help`);

    execAsText('list-process-models --help');

    execAsText('remove wait_demo --yes --help');

    execAsText('list-process-models --help');

    execAsText('logout --help');

    execAsText('session-status --help');

    assert.ok(true);
  });

  it('should fail and show help output if no or invalid command was given', async () => {
    try {
      execAsText('');
    } catch (error) {
      assert.ok(error.message.includes(execAsText('--help')));
    }

    try {
      execAsText('nonexistingcommand');
    } catch (error) {
      assert.ok(error.message.includes(execAsText('--help')));
    }
  });
});
