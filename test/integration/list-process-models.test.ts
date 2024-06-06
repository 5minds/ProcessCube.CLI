import * as assert from 'assert';
import 'mocha';

import { execAsJson, execAsJsonPipes, execAsText, loginAsRoot } from '../exec_as';

describe('list-process-models', () => {
  it('should list-process-models with JSON output', async () => {
    await loginAsRoot(async () => {
      execAsJson('session-status');

      try {
        execAsJson('deploy-files fixtures/*.bpmn');
      } catch (err) {
        // one fixture (Elements.bpmn) causes a parsing error, which is by design to test parsing errors
      }

      execAsJson('list-process-models', /"xml": "\.\.\."/);

      execAsJson('list-process-models --all-fields', /"xml": "[^.]+/);

      const result = execAsJsonPipes([
        'list-process-models --filter-by-id Wartung --filter-by-id Maintenance',
        'list-process-models --filter-by-id String',
        'list-process-models --reject-by-id Maintenance',
      ]);
      assert.equal(result?.result?.length, 1);
      assert.equal(result.result[0].id, 'Wartung.StringUmdrehen');

      const result2 = execAsJsonPipes([
        'list-process-models --filter-by-id Wartung --filter-by-id Maintenance',
        'list-process-models --filter-by-id String',
        'list-process-models --filter-by-id "^(?!Maintenance).*$"',
      ]);
      assert.equal(result2?.result?.length, 1);
      assert.equal(result2.result[0].id, 'Wartung.StringUmdrehen');
    });
  });

  it('should list-process-models with text output', async () => {
    await loginAsRoot(async () => {
      execAsText('session-status');

      execAsText('deploy-files fixtures/Wartung.*.bpmn');

      const result = execAsJson('list-process-models');
      assert.ok(result?.result?.length > 0, 'There should be deployed process models');
    });
  });

  it('should list-process-models with help output', async () => {
    execAsText('list-process-models --help', /GENERAL OPTIONS/);
  });
});
