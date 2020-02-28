#!/usr/bin/env node

import program = require('commander');

import { login } from './commands/login/login';
import { logout } from './commands/logout/logout';
import { printSessionStatus } from './commands/status/status';
import { listProcessModels } from './commands/list-process-models/list-process-models';
import { startProcessInstance } from './commands/start-process-model/start-process-model';
import { listProcessInstances } from './commands/list-process-instances/list-process-instances';
import { StdinPipeReader } from './cli/piped_data';
import { stopProcessInstance } from './commands/stop-process-instance/stop-process-instance';
import { showProcessInstance } from './commands/show-process-instance/show-process-instance';
import { deployFiles } from './commands/deploy-files/deploy-files';
import { removeProcessModels } from './commands/remove-process-models/remove-process-models';
import { logHelp, logWarning } from './cli/logging';
import { performWildcard } from './commands/wildcard/wildcard';

export const OUTPUT_FORMAT_JSON = 'json';
export const OUTPUT_FORMAT_TEXT = 'text';

const VERSION = require('../package.json').version;

program.version(VERSION).option('-o, --output <output>', 'set output', OUTPUT_FORMAT_TEXT);

program
  .command('status')
  .alias('st')
  .description('prints status of the current session')
  .on('--help', () => {
    logHelp(`
    Examples:

      $ atlas status
    `);
  })
  .action(async (options) => {
    printSessionStatus(options.parent.output);
  });

program
  .command('login [engine_url]')
  .description('log in to the given engine')
  .option('--root', 'Try to use anonymous root login', () => true, false)
  .on('--help', () => {
    logHelp(`
    Examples:

      $ atlas login http://localhost:56000

      $ atlas login http://localhost:56000 --root
    `);
  })
  .action(async (engineUrl, options) => {
    await login(engineUrl, options.root, options.parent.output);
  });

program
  .command('logout')
  .description('log out from the current session')
  .on('--help', () => {
    logHelp(`
    Examples:

      $ atlas logout
    `);
  })
  .action(async (options) => {
    await logout(options.parent.output);
  });

program
  .command('deploy-files [FILENAMES...]')
  .alias('deploy')
  .description('deploy process models to the engine')
  .on('--help', () => {
    logHelp(`
    Examples:

      $ atlas deploy registration_email_coupons.bpmn

    The commands takes multiple arguments and supports globs:

      $ atlas deploy registration_email_coupons.bpmn registration_fraud_detection.bpmn

      $ atlas deploy *.bpmn
    `);
  })
  .action(async (filenames: string[], options) => {
    deployFiles(filenames, options.parent.output);
  });

program
  .command('remove [PROCESS_MODEL_IDS...]')
  .description('remove deployed process models from the engine')
  .option('-y,--yes', 'do not prompt for confirmation')
  .on('--help', () => {
    logHelp(`
    Examples:

      $ atlas remove Registration.EmailCoupons

      If you don't want to be prompted for confirmation, use \`--yes\`:

      $ atlas remove Registration.EmailCoupons --yes
    `);
  })
  .action(async (processModelIds: string[], options) => {
    removeProcessModels(processModelIds, options.yes, options.parent.output);
  });

program
  .command('start-process-model <PROCESS_MODEL_ID1> <START_EVENT_ID1>')
  .alias('start')
  .description('starts an instance of the deployed process models')
  .option('--wait', 'wait for the resulting process instance to finish execution and report the result')
  .on('--help', () => {
    logHelp(`
    Examples:

      $ atlas start-process-model Registration.EmailCoupons StartEvent_1

      $ atlas start Registration.EmailCoupons StartEvent_1
    `);
  })
  .action(async (processModelId: string, startEventId: string, options) => {
    await startProcessInstance(processModelId, startEventId, options.wait, options.parent.output);
  });

program
  .command('stop-process-instance [PROCESS_INSTANCE_IDS...]')
  .alias('stop')
  .description('stops instances with the given process instance ids')
  .on('--help', () => {
    logHelp(`
    Examples:

      $ atlas stop-process-instance 56a89c11-ee0d-4539-b4cb-84a0339262fd

      $ atlas stop 56a89c11-ee0d-4539-b4cb-84a0339262fd
    `);
  })
  .action(async (givenProcessInstanceIds: string[], options) => {
    const stdinPipeReader = await StdinPipeReader.create();
    let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || givenProcessInstanceIds;

    await stopProcessInstance(processInstanceIds, options.parent.output);
  });

program
  .command('show-process-instance [PROCESS_INSTANCE_IDS...]')
  .alias('show')
  .description('shows instances with the given process instance ids')
  .option('-c,--correlation', 'all given ids are interpreted as correlation ids')
  .on('--help', () => {
    logHelp(`
    Examples:

      $ atlas show-process-instance 56a89c11-ee0d-4539-b4cb-84a0339262fd

      $ atlas show 56a89c11-ee0d-4539-b4cb-84a0339262fd

      $ atlas show --correlation e552acfe-8446-42c0-a76b-5cd65bf110ac
    `);
  })
  .action(async (givenProcessInstanceIds: string[], options) => {
    const stdinPipeReader = await StdinPipeReader.create();
    let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || givenProcessInstanceIds;

    await showProcessInstance(processInstanceIds, options.correlation, options.parent.output);
  });

program
  .command('retry [PROCESS_INSTANCE_IDS...]')
  .description('restarts failed instances with the given process instance ids')
  .action(async (options) => {
    logWarning('TODO: the engine has to implement this feature');
  });

program
  .command('list-process-models')
  .alias('lsp')
  .description('list process models')
  .option(
    '--filter-by-id <PATTERN>',
    'Filter process models by <PATTERN> (supports regular expressions)',
    (value, previous) => previous.concat([value]),
    []
  )
  .option(
    '--reject-by-id <PATTERN>',
    'Reject process models by <PATTERN> (supports regular expressions)',
    (value, previous) => previous.concat([value]),
    []
  )
  .on('--help', () => {
    logHelp(`
    Examples:

      $ atlas list-process-models

      $ atlas list-process-models --filter-by-id "Registration"

      $ atlas list-process-models --reject-by-id "Internal"

    Filtering/rejecting also supports regular expressions:

      $ atlas list-process-models --filter-by-id "^Registration.+$"
    `);
  })
  .action(async (options) => {
    const stdinPipeReader = await StdinPipeReader.create();
    const pipedProcessModelIds =
      stdinPipeReader.getPipedProcessModelIds() || stdinPipeReader.getPipedProcessModelIdsInProcessInstances();

    listProcessModels(pipedProcessModelIds, options.filterById, options.rejectById, options.parent.output);
  });

program
  .command('list-process-instances')
  .alias('lsi')
  .description('list process instances')
  .option('--created-after <DATETIME>', 'Only include process instances created after <DATETIME>')
  .option('--created-before <DATETIME>', 'Only include process instances created before <DATETIME>')
  .option(
    '--filter-by-correlation-id <CORRELATION_ID>',
    'Filter process instances by <CORRELATION_ID>',
    (value, previous) => previous.concat([value]),
    []
  )
  .option(
    '--filter-by-process-model-id <PATTERN>',
    'Filter process instances by <PATTERN> (supports regular expressions)',
    (value, previous) => previous.concat([value]),
    []
  )
  .option(
    '--reject-by-process-model-id <PATTERN>',
    'Reject process instances by <PATTERN> (supports regular expressions)',
    (value, previous) => previous.concat([value]),
    []
  )
  .option(
    '--filter-by-state <STATE>',
    'Filter process instances by <STATE> (running, finished, error)',
    (value, previous) => previous.concat([value]),
    []
  )
  .option(
    '--reject-by-state <STATE>',
    'Reject process instances by <STATE> (running, finished, error)',
    (value, previous) => previous.concat([value]),
    []
  )
  .option(
    '--sort-by-created-at [DIRECTION]',
    'Sort process instances by their created at timestamp in DIRECTION (asc, desc)'
  )
  .option(
    '--sort-by-process-model-id [DIRECTION]',
    'Sort process instances by their process model id in DIRECTION (asc, desc)'
  )
  .option('--sort-by-state [DIRECTION]', 'Sort process instances by their state in DIRECTION (asc, desc)')
  .option('--limit <LIMIT>', 'Lists a maximum of <LIMIT> process instances')
  .on('--help', () => {
    logHelp(`
    Examples:

      $ atlas list-process-instances

      $ atlas list-process-instances --created-after "2020-01-01" --created-before "2020-01-31"
      $ atlas list-process-instances --filter-by-process-model-id "Registration"
      $ atlas list-process-instances --filter-by-state error

    Filtering by process model id also supports regular expressions:

      $ atlas list-process-instances --filter-by-process-model-id "^Registration.+$"

    Filter options compound, meaning that they allow to look for more than one pattern:

      $ atlas list-process-instances --filter-by-state error --filter-by-state running

    ... using the same filter multiple times results in an OR query:

      $ atlas list-process-instances --filter-by-process-model-id "Registration" --filter-by-process-model-id "Email"

    ... piping the result into another execution of list-process-instances leads to an AND query:

      $ atlas list-process-instances --filter-by-process-model-id "Registration" --output json | atlas list-process-instances --filter-by-process-model-id "Email"

    Combinations of all switches are possible:

      $ atlas list-process-instances --created-after "2020-01-01" --created-before "2020-01-31" \\
                                  --filter-by-process-model-id "^Registration.+$" \\
                                  --reject-by-process-model-id "Internal" \\
                                  --filter-by-state error \\
                                  --filter-by-state running \\
                                  --sort-by-process-model-id ASC \\
                                  --sort-by-state DESC \\
                                  --sort-by-created-at ASC

    The above lists all process instances from January 2020, which were started from a process model
    whose name contains the prefix "Registration.", but does not contain the word "Internal", and either
    resulted in an error or are still running.
    The results are sorted by process model in ascending alphabetical order, within each model section,
    the process instances are grouped by state in the order "running, error" and for each state,
    process instances are listed oldest to newest.
    `);
  })
  .action(async (options) => {
    const stdinPipeReader = await StdinPipeReader.create();
    const pipedProcessInstanceIds = stdinPipeReader.getPipedProcessInstanceIds();
    const pipedProcessModelIds = stdinPipeReader.getPipedProcessModelIds();

    const sortByCreatedAt = options.sortByCreatedAt === true ? 'asc' : options.sortByCreatedAt;
    const sortByProcessModelId = options.sortByProcessModelId === true ? 'asc' : options.sortByProcessModelId;
    const sortByState = options.sortByState === true ? 'asc' : options.sortByState;

    listProcessInstances(
      pipedProcessInstanceIds,
      pipedProcessModelIds,
      options.createdAfter,
      options.createdBefore,
      options.filterByCorrelationId,
      options.filterByProcessModelId,
      options.rejectByProcessModelId,
      options.filterByState,
      options.rejectByState,
      sortByProcessModelId,
      sortByState,
      sortByCreatedAt,
      options.limit,
      options.parent.output
    );
  });

program
  .command('list-correlations')
  .alias('lsc')
  .description('list correlations')
  .action(async (options) => {
    logWarning('TODO: implement me');
  });

program.command('*').action((parentCommand, givenCommandName, arg3) => {
  performWildcard(program, givenCommandName);
});

async function main() {
  await program.parseAsync(process.argv);
}
main();
