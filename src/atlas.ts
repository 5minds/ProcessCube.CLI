#!/usr/bin/env node

import program = require('commander');

import { login } from './commands/login/login';
import { logout } from './commands/logout/logout';
import { printSessionStatus } from './commands/status/status';
import { listProcessModels } from './commands/list-process-models/list-process-models';
import { startProcessInstance } from './commands/start-process-instance/start-process-instance';
import { loadAtlasSession } from './session/atlas_session';
import { listProcessInstances } from './commands/list-process-instances/list-process-instances';
import { getPipedDataIfAny } from './cli/piped_data';
import { stopProcessInstance } from './commands/stop-process-instance/stop-process-instance';
import { showProcessInstance } from './commands/show-process-instance/show-process-instance';

export const OUTPUT_FORMAT_JSON = 'json';
export const OUTPUT_FORMAT_TEXT = 'text';

const VERSION = require('../package.json').version;

program.version(VERSION).option('--format <format>', 'set format', OUTPUT_FORMAT_JSON);

program
  .command('status')
  .alias('st')
  .description('prints status of the current session')
  .action(async (options) => {
    printSessionStatus(options.parent.format);
  });

program
  .command('login [engine_url]')
  .description('log in to the given engine')
  .option('--anonymous', 'Try to use anonymous login', () => true, false)
  .on('--help', function() {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ deploy login http://localhost:56000');
  })
  .action(async (engineUrl, options) => {
    await login(engineUrl, options.anonymous, options.parent.format);
  });

program
  .command('logout')
  .description('log out from the current session')
  .action(async (options) => {
    await logout(options.parent.format);
  });

program
  .command('deploy <FILENAME1> [FILENAMES...]')
  .description('deploy process models to the engine')
  .action(async (options) => {
    console.log('TODO: implement me');
  });

program
  .command('remove <PROCESS_MODEL_ID1> [PROCESS_MODEL_IDS...]')
  .alias('rm')
  .description('remove deployed process models from the engine')
  .action(async (options) => {
    console.log('TODO: implement me');
  });

program
  .command('start-process-instance <PROCESS_MODEL_ID1> <START_EVENT_ID1> [PROCESS_MODEL_AND_START_EVENT_IDS...]')
  .alias('start')
  .description('starts an instance of the deployed process models')
  .action(async (processModelId: string, startEventId: string, moreProcessModelAndStartEventIds: string[], options) => {
    await startProcessInstance(
      processModelId,
      startEventId,
      moreProcessModelAndStartEventIds,
      options,
      options.parent.format
    );
  });

program
  .command('stop-process-instance [PROCESS_INSTANCE_IDS...]')
  .alias('stop')
  .description('stops instances with the given process instance ids')
  .action(async (processInstanceIds: string[], options) => {
    await stopProcessInstance(processInstanceIds, options, options.parent.format);
  });

program
  .command('show-process-instance [PROCESS_INSTANCE_IDS...]')
  .alias('show')
  .description('shows instances with the given process instance ids')
  .action(async (processInstanceIds: string[], options) => {
    await showProcessInstance(processInstanceIds, options, options.parent.format);
  });

program
  .command('retry <PROCESS_INSTANCE_ID1> [PROCESS_INSTANCE_IDS...]')
  .description('restarts failed instances with the given process instance ids')
  .action(async (options) => {
    console.log('TODO: implement me');
  });

program
  .command('list-process-models')
  .alias('lsp')
  .description('list process models')
  .option(
    '--filter-by-id <PATTERN>',
    'Filter process models by PATTERN',
    (value, previous) => previous.concat([value]),
    []
  )
  .action(async (options) => {
    listProcessModels(options, options.parent.format);
  });

program
  .command('list-process-instances')
  .alias('lsi')
  .description('list process instances')
  .option(
    '--filter-by-process-model-id <PROCESS_MODEL_ID>',
    'Filter process instances by PROCESS_MODEL_ID',
    (value, previous) => previous.concat([value]),
    []
  )
  .option('--filter-created-after <DATETIME>', 'Only include process instances created after <DATETIME>')
  .option('--filter-created-before <DATETIME>', 'Only include process instances created before <DATETIME>')
  .option(
    '--filter-by-state <STATE>',
    'Filter process instances by STATE (running, finished, error)',
    (value, previous) => previous.concat([value]),
    []
  )
  .action(async (options) => {
    const pipedData = await getPipedDataIfAny();
    console.log('lsi: pipedData', pipedData);

    listProcessInstances(options.filterByProcessModelId, options.filterByState, options.parent.format);
  });

program
  .command('list-correlations')
  .alias('lsc')
  .description('list correlations')
  .action(async (options) => {
    console.log('TODO: implement me');
  });

async function main() {
  await program.parseAsync(process.argv);
}
main();
