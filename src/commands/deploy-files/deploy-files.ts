import chalk from 'chalk';
import * as glob from 'fast-glob';

import { logError, logJsonResult } from '../../cli/logging';
import { addJsonPipingHintToResultJson, createResultJson } from '../../cli/result_json';
import { ApiClient } from '../../client/api_client';
import { DeployedProcessModelInfo } from '../../contracts/api_client_types';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';
import { loadSession } from '../../session/session';

export async function deployFiles(globPatterns: string[], outputFormat: string): Promise<void> {
  const session = loadSession();
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

  let resultJson = createResultJson('deployed-files', results);
  resultJson = addJsonPipingHintToResultJson(resultJson);

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      logJsonResult(resultJson);
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
