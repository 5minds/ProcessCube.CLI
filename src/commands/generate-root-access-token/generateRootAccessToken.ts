import chalk from 'chalk';

import { logJsonResult } from '../../cli/logging';
import { addJsonPipingHintToResultJson, createResultJson } from '../../cli/result_json';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';

export async function generateRootAccessToken(size: number, printRaw: boolean, outputFormat: string): Promise<void> {
  const safeSecret = makeUrlSafe(getSecret(size));
  const resultJson = createResultJson('generate-root-access-token', safeSecret);

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      logJsonResult(resultJson);
      break;
    case OUTPUT_FORMAT_TEXT:
      if (printRaw) {
        console.log(safeSecret);
      } else {
        logWithInstructions(safeSecret);
      }
      break;
  }
}

function logWithInstructions(safeSecret: string): void {
  const safeSecretColored = chalk.cyan(safeSecret);

  console.log(
    `
This is the generated token:

    ${safeSecretColored}

To use it for authorization, update your engine config like this:

    {
      "iam": {
        "rootAccessToken": "${safeSecretColored}",
      }
    }

... or start your engine by using the corresponding environment variable:

    iam__rootAccessToken="${safeSecretColored}" atlas-engine

By doing this, you ensure that only clients using this secret token can utilize the API.
`.trim()
  );
}

function getSecret(size: number) {
  return require('crypto')
    .randomBytes(size)
    .toString('base64')
    .slice(0, size);
}

function makeUrlSafe(str) {
  return str
    .replace(/\+/g, '.')
    .replace(/\//g, '-')
    .replace(/=/g, '_');
}
