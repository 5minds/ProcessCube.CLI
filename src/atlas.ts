#!/usr/bin/env node

import program = require('commander');

import { login } from './commands/login/login';
import { logout } from './commands/logout/logout';
import { printSessionStatus } from './commands/status/status';

export const OUTPUT_FORMAT_JSON = 'json';
export const OUTPUT_FORMAT_TEXT = 'text';

const VERSION = require('../package.json').version;

program.version(VERSION).option('--format <format>', 'set format', OUTPUT_FORMAT_JSON);

program
  .command('status')
  .alias('st')
  .description('print info about current session')
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
  .action((options) => {
    logout(options.parent.format);
  });

program
  .command('deploy <FILENAME1> [FILENAMES...]')
  .description('deploy process models to the engine')
  .action((options) => {
    console.log('TODO: implement me');
  });

program
  .command('remove <PROCESS_MODEL_ID1> [PROCESS_MODEL_IDS...]')
  .alias('rm')
  .description('remove deployed process models from the engine')
  .action((options) => {
    console.log('TODO: implement me');
  });

program
  .command('start <PROCESS_MODEL_ID1> <START_EVENT_ID1> [PROCESS_MODEL_AND_START_EVENT_IDS...]')
  .description('starts an instance of the deployed process models')
  .action((options) => {
    console.log('TODO: implement me');
  });

program
  .command('start <PROCESS_INSTANCE_ID1> [PROCESS_INSTANCE_IDS...]')
  .description('stops instances with the given process instance ids')
  .action((options) => {
    console.log('TODO: implement me');
  });

program
  .command('retry <PROCESS_INSTANCE_ID1> [PROCESS_INSTANCE_IDS...]')
  .description('restarts failed instances with the given process instance ids')
  .action((options) => {
    console.log('TODO: implement me');
  });

program
  .command('list-process-models')
  .alias('lsp')
  .description('list process models')
  .action(async (options) => {
    console.log('TODO: implement me');
  });

program
  .command('list-process-instances')
  .alias('lsi')
  .description('list process instances')
  .action(async (options) => {
    console.log('TODO: implement me');
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
