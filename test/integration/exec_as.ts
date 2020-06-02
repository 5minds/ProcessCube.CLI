import * as assert from 'assert';
import { execSync } from 'child_process';

import * as JSON5 from 'json5';

const ATLAS_EXECUTABLE = 'node ./dist/atlas.js';

export function execAsJson(cmd: string): any {
  console.log(cmd);
  const output = getShellOutput(`${ATLAS_EXECUTABLE} ${cmd} --output json`);
  console.log(`>>> ${output}`);

  try {
    return JSON5.parse(output);
  } catch (error) {
    console.error(error);
    assert.ok(false, `Could not parse output from \`${cmd}\` as json:\n\n${output}`);
  }
}

export function execAsText(cmd: string): any {
  return getShellOutput(`${ATLAS_EXECUTABLE} ${cmd} --output text`);
}

function getShellOutput(cmd: string): string {
  const output = execSync(cmd, { encoding: 'utf-8' });

  return output;
}
