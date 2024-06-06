import 'mocha';
import * as assert from 'assert';
import { execAsJson, execAsText, loginAsRoot } from '../exec_as';

describe('retry-process-instance', () => {
  it('should retry-process-instance with JSON output', async () => {
    await loginAsRoot(async () => {
      execAsJson('deploy-files fixtures/Maintenance.RetryProcessInstance.bpmn');

      execAsJson('start-process-model Maintenance.RetryProcessInstance StartEvent_1 --wait');
      const resultStart = execAsJson(
        'list-process-instances --filter-by-process-model-id Maintenance.RetryProcessInstance --limit 1',
      );
      const processInstanceId = resultStart?.result[0]?.processInstanceId;
      assert.notEqual(processInstanceId, null);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const resultRetry = execAsJson(`retry-process-instance ${processInstanceId}`);
      assert.ok(resultRetry?.result[0]?.success, 'success was supposed to be `true`');
    });
  });

  it('should retry-process-instance with help output', async () => {
    execAsText('retry --help', /GENERAL OPTIONS/);
  });
});
