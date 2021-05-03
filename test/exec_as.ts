import * as assert from 'assert';
import { execSync } from 'child_process';

import * as JSON5 from 'json5';

const ATLAS_EXECUTABLE = 'node ./dist/pc.js';

export function execAsJson(cmd: string, assertRegexMatches?: RegExp | string): any {
  console.log(cmd);
  const output = getShellOutput(`${ATLAS_EXECUTABLE} ${cmd} --output json`);
  console.log(`>>> ${output}`);

  if (assertRegexMatches != null) {
    if (typeof assertRegexMatches == 'string') {
      assert.ok(
        output.includes(assertRegexMatches) != null,
        `Did expect ${JSON.stringify(assertRegexMatches)} to be included in:\n\n${output}`
      );
    } else {
      assert.ok(output.match(assertRegexMatches) != null, `Did expect ${assertRegexMatches} to match:\n\n${output}`);
    }
  }

  try {
    return JSON5.parse(output);
  } catch (error) {
    console.error(error);
    assert.ok(false, `Could not parse output from \`${cmd}\` as json:\n\n${output}`);
  }
}

export function execAsJsonPipes(cmds: string[], assertRegexMatches?: RegExp | string): any {
  const cmd = cmds.map((cmd) => `${ATLAS_EXECUTABLE} ${cmd}`).join(' | ') + ' --output json';

  console.log(cmd);
  const output = getShellOutput(cmd);
  console.log(`>>> ${output}`);

  if (assertRegexMatches != null) {
    if (typeof assertRegexMatches == 'string') {
      assert.ok(
        output.includes(assertRegexMatches) != null,
        `Did expect ${JSON.stringify(assertRegexMatches)} to be included in:\n\n${output}`
      );
    } else {
      assert.ok(output.match(assertRegexMatches) != null, `Did expect ${assertRegexMatches} to match:\n\n${output}`);
    }
  }

  try {
    return JSON5.parse(output);
  } catch (error) {
    console.error(error);
    assert.ok(false, `Could not parse output from \`${cmd}\` as json:\n\n${output}`);
  }
}

export function execAsText(cmd: string, assertRegexMatches?: RegExp): any {
  const output = getShellOutput(`${ATLAS_EXECUTABLE} ${cmd} --output text`);

  if (assertRegexMatches != null) {
    assert.ok(output.match(assertRegexMatches) != null, `Did expect ${assertRegexMatches} to match:\n\n${output}`);
  }

  return output;
}

export function execAsDefault(cmd: string): any {
  return getShellOutput(`${ATLAS_EXECUTABLE} ${cmd}`);
}

function getShellOutput(cmd: string): string {
  const output = execSync(cmd, { encoding: 'utf-8' });

  return output;
}

export async function loginAsRoot(testCallbackFn: () => Promise<void>) {
  const engineUrl = process.env.ENGINE_URL || 'http://localhost:10560';

  execAsText(`login ${engineUrl} --root`);

  await testCallbackFn();

  execAsText('logout', /logged out/);
}

export function assertCorrelationIdInResult(result: any, correlationId: string): void {
  assert.ok(result.result.some((processInstance) => processInstance.correlationId === correlationId));
}
