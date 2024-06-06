import 'mocha';
import * as assert from 'assert';
import { assertCorrelationIdInResult, execAsJson, execAsJsonPipes, execAsText, loginAsRoot } from '../exec_as';

describe('list-process-instances', () => {
  it('should list-process-instances using --all-fields... with JSON output', async () => {
    await loginAsRoot(async () => {
      execAsJson('deploy-files fixtures/Wartung.*.bpmn');
      execAsJson(`start-process-model Wartung.StringUmdrehen StartEvent_1`);

      execAsJson('list-process-instances', /"xml": "\.\.\."/);
      execAsJson('list-process-instances --all-fields', /"xml": "[^.]/);
    });
  });

  it('should list-process-instances using --completed-in with JSON output', async () => {
    await loginAsRoot(async () => {
      execAsJson('deploy-files fixtures/Wartung.StringUmdrehen.bpmn fixtures/wait-demo.bpmn');
      const correlationId1 = 'b' + Date.now() + Math.random();
      execAsJson(
        `start-process-model wait_demo StartEvent_1 \
          --start-token '{"seconds": 2}' \
          --correlation-id ${correlationId1} \
          --wait`,
      );
      const correlationId2 = 'b' + Date.now() + Math.random();
      execAsJson(`start-process-model Wartung.StringUmdrehen StartEvent_1 --correlation-id ${correlationId2} --wait`);

      const result1 = execAsJson('list-process-instances --completed-in "> 2s"');
      const result2 = execAsJson('list-process-instances --completed-in "< 1s"');

      assertCorrelationIdInResult(result1, correlationId1);
      assertCorrelationIdInResult(result2, correlationId2);
    });
  });

  it('should list-process-instances using --created-... with JSON output', async () => {
    await loginAsRoot(async () => {
      execAsJson('deploy-files fixtures/Wartung.StringUmdrehen.bpmn fixtures/wait-demo.bpmn');

      const correlationId1 = 'b' + Date.now() + Math.random();
      execAsJson(
        `start-process-model wait_demo StartEvent_1 \
          --start-token '{"seconds": 2}' \
          --correlation-id ${correlationId1} \
          --wait`,
      );

      const dateString2 = new Date().toISOString();
      const correlationId2 = 'b' + Date.now() + Math.random();
      execAsJson(`start-process-model Wartung.StringUmdrehen StartEvent_1 --correlation-id ${correlationId2} --wait`);

      const dateString3 = new Date().toISOString();

      const result1 = execAsJson(`list-process-instances --created-before ${dateString2}`);
      const result2 = execAsJson(
        `list-process-instances --created-after ${dateString2} --created-before ${dateString3}`,
      );
      const result3 = execAsJson(`list-process-instances --created-after ${dateString3}`);

      assertCorrelationIdInResult(result1, correlationId1);
      assertCorrelationIdInResult(result2, correlationId2);
      assert.ok(result3.result.length === 0, 'List should have been empty');
    });
  });

  it('should list-process-instances using --completed-... with JSON output', async () => {
    await loginAsRoot(async () => {
      execAsJson('deploy-files fixtures/Wartung.StringUmdrehen.bpmn fixtures/wait-demo.bpmn');

      const dateString1 = new Date().toISOString();
      const correlationId1 = 'b' + Date.now() + Math.random();
      execAsJson(
        `start-process-model wait_demo StartEvent_1 \
          --start-token '{"seconds": 2}' \
          --correlation-id ${correlationId1} \
          --wait`,
      );

      const dateString2 = new Date().toISOString();
      const correlationId2 = 'b' + Date.now() + Math.random();
      execAsJson(`start-process-model Wartung.StringUmdrehen StartEvent_1 --correlation-id ${correlationId2} --wait`);

      const dateString3 = new Date().toISOString();

      const result1 = execAsJson(`list-process-instances --completed-before ${dateString2}`);
      const result2 = execAsJson(
        `list-process-instances --completed-after ${dateString1} --completed-before ${dateString3}`,
      );
      const result3 = execAsJson(`list-process-instances --completed-after ${dateString3}`);

      assertCorrelationIdInResult(result1, correlationId1);
      assertCorrelationIdInResult(result2, correlationId2);
      assert.ok(result3.result.length === 0, 'List should have been empty');
    });
  });

  it('should list-process-instances using --filter-... and --reject-... with JSON output', async () => {
    await loginAsRoot(async () => {
      execAsJson('deploy-files fixtures/Wartung.*.bpmn');

      execAsJson('list-process-instances', /"xml": "\.\.\."/);

      const correlationId = 'b' + Date.now();
      execAsJson(
        `start-process-model Wartung.StringUmdrehen StartEvent_1 \
          --start-token '{"string": "5Minds"}' \
          --correlation-id ${correlationId} \
          --wait`,
      );

      const result = execAsJsonPipes([
        'list-process-instances --reject-by-state error',
        'list-process-instances --filter-by-state finished',
        'list-process-instances --filter-by-process-model-id String',
        `list-process-instances --reject-by-process-model-id Maintenance --filter-by-correlation-id ${correlationId}`,
      ]);
      assert.equal(result?.result?.length, 1);
      assert.equal(result.result[0].processModelId, 'Wartung.StringUmdrehen');
    });
  });

  it('should list-process-instances with text output', async () => {
    await loginAsRoot(async () => {
      execAsText('deploy-files fixtures/Wartung.*.bpmn');
      execAsText(`start-process-model Wartung.StringUmdrehen StartEvent_1 --wait`);

      const result = execAsJson('list-process-instances');
      assert.ok(result?.result?.length > 0);
    });
  });

  it('should list-process-instances with help output', async () => {
    execAsText('list-process-instances --help', /GENERAL OPTIONS/);
  });
});
