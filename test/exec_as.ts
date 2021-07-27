import * as assert from 'assert';
import { execSync } from 'child_process';

import * as JSON5 from 'json5';

const ATLAS_EXECUTABLE = 'node ./dist/pc.js';

export function execAsJson(
  cmd: string,
  assertRegexMatches: RegExp | string | null = null,
  checkOutputForErrors: boolean = true
): any {
  logCommand(cmd);
  const output = getShellOutput(`${ATLAS_EXECUTABLE} ${cmd} --output json`);
  logCommandOutput(output);

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

  let parsedOutput;
  try {
    parsedOutput = JSON5.parse(output);
  } catch (error) {
    console.error(error);
    assert.ok(false, `Could not parse output from \`${cmd}\` as json:\n\n${output}`);
  }

  if (checkOutputForErrors === true && Array.isArray(parsedOutput?.result)) {
    const resultContainsError = parsedOutput?.result?.some((resultItem) => {
      const isNotAnErroredProcessInstance = resultItem.state != 'error';
      const containsError = resultItem.error != null;

      return isNotAnErroredProcessInstance && containsError;
    });

    if (resultContainsError) {
      // TODO: this issue has to be solved before we can use this "error checker" without false positives
      //        https://github.com/atlas-engine/AtlasEngine/issues/617
      //
      // assert.ok(false, `A result from \`${cmd}\` indicated an error:\n\n${output}`);
    }
  }

  return parsedOutput;
}

export function execAsJsonPipes(cmds: string[], assertRegexMatches?: RegExp | string): any {
  const cmd = cmds.map((cmd) => `${ATLAS_EXECUTABLE} ${cmd}`).join(' | ') + ' --output json';

  logCommand(cmd);
  const output = getShellOutput(cmd);
  logCommandOutput(output);

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
  logCommand(cmd);
  const output = getShellOutput(`${ATLAS_EXECUTABLE} ${cmd} --output text`);
  logCommandOutput(output);

  if (assertRegexMatches != null) {
    assert.ok(output.match(assertRegexMatches) != null, `Did expect ${assertRegexMatches} to match:\n\n${output}`);
  }

  return output;
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
  assert.ok(
    result.result.some((processInstance) => processInstance.correlationId === correlationId),
    `Correlation ID \`${correlationId}\` not found in ${JSON.stringify(result.result, null, 2)}`
  );
}

const LOG_PREFIX = '      | ';
function logCommand(cmd: string): void {
  console.log('');
  console.log(`${LOG_PREFIX}$ ${cmd}`);
}

function logCommandOutput(output: string): void {
  console.log(LOG_PREFIX + output.split('\n').join('\n' + LOG_PREFIX));
}
