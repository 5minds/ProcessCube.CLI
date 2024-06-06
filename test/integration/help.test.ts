import * as assert from 'assert';
import 'mocha';

import { execAsText } from '../exec_as';

describe('atlas', () => {
  it('should help', async () => {
    execAsText('--help', /GENERAL OPTIONS/);

    execAsText('login --help', /GENERAL OPTIONS/);

    execAsText('session-status --help', /GENERAL OPTIONS/);

    execAsText('list-process-instances --help', /GENERAL OPTIONS/);

    execAsText(`stop-process-instance --help`, /GENERAL OPTIONS/);

    execAsText(`show-process-instance --help`, /GENERAL OPTIONS/);

    execAsText('list-process-models --help', /GENERAL OPTIONS/);

    execAsText('logout --help', /GENERAL OPTIONS/);

    execAsText('session-status --help', /GENERAL OPTIONS/);

    assert.ok(true);
  });

  it('should fail and show help output if no command was given', async () => {
    let hasThrown = true;
    try {
      execAsText('');
      hasThrown = false;
    } catch (error) {
      assert.ok(error.message.includes(execAsText('--help', /GENERAL OPTIONS/)));
    }
    assert.ok(hasThrown, 'Should have thrown an error');
  });

  it('should fail and show help output if invalid command was given', async () => {
    let hasThrown = true;
    try {
      execAsText('nonexistingcommand');
      hasThrown = false;
    } catch (error) {
      // TODO: this is wrong behaviour: the help text must NOT show when one enters an invalid command
      assert.ok(error.message.includes(execAsText('--help', /GENERAL OPTIONS/)));
    }
    assert.ok(hasThrown, 'Should have thrown an error');
  });
});
