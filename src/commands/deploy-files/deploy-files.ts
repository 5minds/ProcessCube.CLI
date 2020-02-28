import chalk from 'chalk';
import * as glob from 'glob';

import { ApiClient } from '../../client/api_client';
import { loadAtlasSession } from '../../session/atlas_session';
import { logError } from '../../cli/logging';

import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { createResultJson } from '../../cli/result_json';
import { DeployedProcessModelInfo } from '../../contracts/api_client_types';

export async function deployFiles(globPatterns: string[], outputFormat: string): Promise<void> {
  const session = loadAtlasSession();
  if (session == null) {
    logError('No session found. Aborting.');
    return;
  }

  const apiClient = new ApiClient(session);
  const files = resolveGlobsToFilenames(globPatterns);

  const results: DeployedProcessModelInfo[] = [];
  for (const filename of files) {
    const deployedProcessModelInfo = await apiClient.deployFile(filename);
    results.push(deployedProcessModelInfo);

    if (outputFormat === OUTPUT_FORMAT_TEXT) {
      logResultAsText(deployedProcessModelInfo);
    }
  }

  const anyFailure = results.some((result) => result.success === false);

  const resultJson = createResultJson('deployed-files', results);

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      console.log(JSON.stringify(resultJson, null, 2));
      break;
    case OUTPUT_FORMAT_TEXT:
      if (anyFailure) {
        console.log('');
        logError('some process models could not be deployed (see details above)');
      }
      break;
  }

  if (anyFailure) {
    process.exit(1);
  }
}

function resolveGlobsToFilenames(patterns: string[]): string[] {
  let results = [];
  for (const pattern of patterns) {
    const files = glob.sync(pattern);
    results = results.concat(files);
  }

  return results;
}

function logResultAsText(result: DeployedProcessModelInfo) {
  if (result.success === true) {
    console.log(result.filename, '->', result.processModelId, chalk.greenBright.bold('[deployed]'));
  } else {
    console.log(result.filename, '->', result.processModelId, chalk.redBright.bold('[failed]'));
    console.error(chalk.redBright(result.error.toString()));
  }
}
