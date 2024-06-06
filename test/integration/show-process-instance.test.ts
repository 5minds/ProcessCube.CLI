import 'mocha';
import * as assert from 'assert';
import { execAsJson, execAsText, loginAsRoot } from '../exec_as';

describe('show-process-instance', () => {
  it('should show-process-instance with JSON output', async () => {
    await loginAsRoot(async () => {
      execAsJson('deploy-files fixtures/Wartung.StringUmdrehen.bpmn');

      const correlationId = 'c' + Date.now();
      execAsJson(
        `start-process-model Wartung.StringUmdrehen StartEvent_1 \
          --correlation-id ${correlationId} \
          --wait`,
      );
      const resultStart = execAsJson(
        'list-process-instances --filter-by-process-model-id Wartung.StringUmdrehen --limit 1',
      );
      const processInstanceId = resultStart?.result[0]?.processInstanceId;
      assert.notEqual(processInstanceId, null);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const resultById = execAsJson(`show-process-instance ${processInstanceId}`, /"xml": "\.\.\."/);
      assert.strictEqual(resultById?.result[0]?.state, 'finished', 'state was supposed to be `finished`');

      const resultByCorrelation = execAsJson(
        `show-process-instance \
          --correlation ${correlationId} \
          -F`,
        /"xml": "[^.]+/,
      );
      assert.strictEqual(resultByCorrelation?.result[0]?.state, 'finished', 'state was supposed to be `finished`');
    });
  });

  it('should show-process-instance with help output', async () => {
    execAsText('show --help', /GENERAL OPTIONS/);
  });
});
