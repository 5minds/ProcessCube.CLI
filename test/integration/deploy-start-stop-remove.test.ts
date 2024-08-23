import * as assert from 'assert';
import 'mocha';

import { execAsJson, execAsJsonPipes, execAsText, loginAsRoot } from '../exec_as';

describe('deploy start/stop/remove', () => {
  it('should deploy/start/stop/remove with JSON output', async () => {
    await loginAsRoot(async () => {
      execAsJson('session-status');

      execAsJson('deploy-files fixtures/wait-demo.bpmn');

      const result = execAsJson('start-process-model wait_demo StartEvent_1 --start-token \'{"seconds": 1}\'');
      const processInstanceId = result?.result[0]?.processInstanceId;
      assert.notEqual(processInstanceId, null);

      execAsJson('list-process-instances');

      execAsJson('list-process-instances --all-fields');

      execAsJson(`stop-process-instance ${processInstanceId}`);

      execAsJson(`show-process-instance ${processInstanceId}`);

      const processModelResult = execAsJson('list-process-models', /"xml": "\.\.\."/);
      assert.ok(processModelResult.result.length > 0, 'There should be process models.');

      execAsJson('list-process-models --all-fields', /"xml": "[^.]+/);

      execAsJson('remove wait_demo --yes');

      const processModelResultAfterRemove = execAsJson('list-process-models');
      assert.strictEqual(processModelResultAfterRemove.result.length, processModelResult.result.length - 1);
    });
  });

  it('should deploy/start/stop/remove with text output', async () => {
    await loginAsRoot(async () => {
      execAsText('deploy-files fixtures/wait-demo.bpmn');

      execAsText('start-process-model wait_demo StartEvent_1 --start-token \'{"seconds": 1}\'');

      execAsText('list-process-instances');

      execAsText('list-process-instances --all-fields');

      execAsText('list-process-models');

      execAsText('list-process-models --all-fields');

      execAsText('remove wait_demo --yes');

      execAsText('list-process-models');
    });
  });

  it('should deploy/start/stop/remove when piping results', async () => {
    await loginAsRoot(async () => {
      const correlationId = 'c' + Date.now();

      execAsJsonPipes(
        [
          'deploy-files fixtures/wait-demo.bpmn',
          `start-process-model wait_demo StartEvent_1 --start-token '{"seconds": 1}' --correlation-id ${correlationId}`,
          'list-process-instances --all-fields --limit 1',
          'show-process-instance',
        ],
        correlationId,
      );
    });
  });

  it('should deploy/start/stop/remove with help output', async () => {
    execAsText('--help', /GENERAL OPTIONS/);

    execAsText('deploy-files fixtures/wait-demo.bpmn --help', /GENERAL OPTIONS/);

    execAsText('start-process-model --help', /GENERAL OPTIONS/);

    execAsText(`stop-process-instance --help`, /GENERAL OPTIONS/);

    execAsText('remove wait_demo --yes --help', /GENERAL OPTIONS/);
  });
});
