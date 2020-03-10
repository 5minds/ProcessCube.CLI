import * as assert from 'assert';
import { exec } from 'child_process';

import * as JSON5 from 'json5';

const ATLAS_EXECUTABLE = 'node ./dist/atlas.js';

async function execAsJson(cmd: string): Promise<any> {
  console.log(cmd);
  const output = await sh(`${ATLAS_EXECUTABLE} ${cmd} --output json`);
  console.log(`>>> ${output}`);

  try {
    return JSON5.parse(output);
  } catch (error) {
    assert.ok(false, `Could not parse output from \`${cmd}\` as json:\n\n${output}`);
  }
}

async function execAsText(cmd: string): Promise<any> {
  const output = await sh(`${ATLAS_EXECUTABLE} ${cmd} --output text`);
}

async function sh(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error != null) {
        console.log('exec error: ' + error);
        return reject(error);
      }
      if (stderr != null && stderr !== '') {
        console.dir(stderr);
        return reject(stderr);
      }

      resolve(stdout);
    });
  });
}

describe('atlas', () => {
  describe('login', () => {
    it('should work', async () => {
      await execAsText('login http://localhost:8000 --root');

      await execAsJson('session-status');

      await execAsJson('deploy-files fixtures/wait-demo.bpmn');

      const result = await execAsJson('start-process-model wait_demo StartEvent_1 --input-values \'{"seconds": 1}\'');
      const processInstanceId = result?.result[0]?.processInstanceId;
      assert.notEqual(processInstanceId, null);

      await execAsJson(`stop-process-instance ${processInstanceId}`);

      await execAsJson(`show-process-instance ${processInstanceId}`);

      await execAsJson('list-process-instances');

      await execAsJson('list-process-models');

      await execAsJson('remove wait_demo --yes');

      await execAsJson('logout');

      await execAsJson('session-status');

      assert.ok(true);
    });
  });
});
