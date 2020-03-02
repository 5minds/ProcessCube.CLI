#!/usr/bin/env node

import program = require('yargs');

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
import { readFileSync } from 'fs';

export const OUTPUT_FORMAT_JSON = 'json';
export const OUTPUT_FORMAT_TEXT = 'text';

const VERSION = require('../package.json').version;

program
  .version(VERSION)

  .option('help', {
    alias: 'h',
    type: 'boolean',
    description: 'Show help'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'set output',
    default: OUTPUT_FORMAT_TEXT
  })

  .command(
    ['status', 'st'],
    'prints status of the current session',
    (yargs) => {},
    (argv: any) => {
      if (argv.help) {
        logHelp(`
      Examples:

        $ atlas status
      `);

        return;
      }

      printSessionStatus(argv.output);
    }
  )

  .command(
    'login [engine_url]',
    'log in to the given engine',
    (yargs) => {
      yargs.positional('engine_url', {
        describe: 'url of engine to connect to',
        default: 'http://localhost:8000'
      });

      yargs.option('root', {
        description: 'Try to use anonymous root login',
        type: 'boolean'
      });
    },
    async (argv: any) => {
      if (argv.help) {
        logHelp(`
      Examples:

        $ atlas login http://localhost:56000

        $ atlas login http://localhost:56000 --root
      `);

        return;
      }

      await login(argv.engine_url, argv.root, argv.output);
    }
  )

  .command(
    'logout',
    'log out from the current session',
    (yargs) => {},
    async (argv: any) => {
      if (argv.help) {
        logHelp(`
      Examples:

        $ atlas logout
      `);

        return;
      }

      await logout(argv.output);
    }
  )

  .command(
    ['deploy-files [FILENAMES...]', 'deploy [FILENAMES...]'],
    'deploy process models to the engine',
    (yargs) => {
      yargs.positional('filenmes', {
        describe: 'files to deploy'
      });
    },
    (argv: any) => {
      if (argv.help) {
        logHelp(`
      Examples:

        $ atlas deploy registration_email_coupons.bpmn

      The commands takes multiple arguments and supports globs:

        $ atlas deploy registration_email_coupons.bpmn registration_fraud_detection.bpmn

        $ atlas deploy *.bpmn
      `);

        return;
      }

      deployFiles(argv.filenames, argv.output);
    }
  )

  .command(
    'remove [PROCESS_MODEL_IDS...]',
    'remove deployed process models from the engine',
    (yargs) => {
      yargs.option('yes', {
        alias: 'y',
        type: 'boolean',
        description: 'do not prompt for confirmation'
      });
    },
    (argv: any) => {
      if (argv.help) {
        logHelp(`
      Examples:

        $ atlas remove Registration.EmailCoupons

        If you don't want to be prompted for confirmation, use \`--yes\`:

        $ atlas remove Registration.EmailCoupons --yes
      `);

        return;
      }

      removeProcessModels(argv.processModelIds, argv.yes, argv.output);
    }
  )

  .command(
    ['start-process-model <PROCESS_MODEL_ID1> <START_EVENT_ID1>', 'start <PROCESS_MODEL_ID1> <START_EVENT_ID1>'],
    'starts an instance of the deployed process models',
    (yargs) => {
      yargs
        .option('wait', {
          description: 'wait for the started process instance to finish execution and report the result',
          type: 'boolean'
        })
        .option('correlation-id', {
          description: 'set a predefined correlation id for the process instance',
          type: 'string'
        })
        .option('input-values', {
          description: 'set input values for the process instance',
          type: 'string'
        })
        .option('input-values-from-stdin', {
          description: 'read input values as JSON from STDIN',
          type: 'boolean'
        })
        .option('input-values-from-file', {
          description: 'read input values as JSON from FILE',
          type: 'string'
        });
    },
    async (argv: any) => {
      if (argv.help) {
        logHelp(`
      Examples:

        $ atlas start-process-model Registration.EmailCoupons StartEvent_1

        $ atlas start Registration.EmailCoupons StartEvent_1

        $ atlas start Registration.EmailCoupons StartEvent_1 --correlation-id "my-correlation-id-1234"

        $ atlas start Registration.EmailCoupons StartEvent_1 --wait

        $ atlas start Registration.EmailCoupons StartEvent_1 --input-values '{"answer": 42, "email": "jobs@5minds.de"}'

        $ atlas start Registration.EmailCoupons StartEvent_1 --input-values-from-file input.json

        $ cat input.json | atlas start Registration.EmailCoupons StartEvent_1

      `);

        return;
      }

      let inputValues: any;

      if (argv.inputValuesFromStdin === true) {
        const stdinPipeReader = await StdinPipeReader.create();
        inputValues = stdinPipeReader.getPipedData();
      }
      if (argv.inputValuesFromFile != null) {
        const contents = readFileSync(argv.inputValuesFromFile);
        inputValues = JSON.parse(contents.toString());
      }
      if (argv.inputValues != null) {
        inputValues = JSON.parse(argv.inputValues);
      }

      await startProcessInstance(
        argv.processModelId,
        argv.startEventId,
        argv.correlationId,
        inputValues,
        argv.wait,
        argv.output
      );
    }
  )

  .command(
    ['stop-process-instance [PROCESS_INSTANCE_IDS...]', 'stop [PROCESS_INSTANCE_IDS...]'],
    'stops instances with the given process instance ids',
    (yargs) => {},
    async (argv: any) => {
      if (argv.help) {
        logHelp(`
      Examples:

        $ atlas stop-process-instance 56a89c11-ee0d-4539-b4cb-84a0339262fd

        $ atlas stop 56a89c11-ee0d-4539-b4cb-84a0339262fd
      `);

        return;
      }

      const stdinPipeReader = await StdinPipeReader.create();
      let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || argv.process_instance_ids;

      await stopProcessInstance(processInstanceIds, argv.output);
    }
  )

  .command(
    ['show-process-instance [PROCESS_INSTANCE_IDS...]', 'show'],
    'shows instances with the given process instance ids',
    (yargs) => {
      yargs.option('correlation', {
        alias: 'c',
        description: 'all given ids are interpreted as correlation ids',
        type: 'string'
      });
    },
    async (argv: any) => {
      if (argv.help) {
        logHelp(`
      Examples:

        $ atlas show-process-instance 56a89c11-ee0d-4539-b4cb-84a0339262fd

        $ atlas show 56a89c11-ee0d-4539-b4cb-84a0339262fd

        $ atlas show --correlation e552acfe-8446-42c0-a76b-5cd65bf110ac
      `);

        return;
      }

      const stdinPipeReader = await StdinPipeReader.create();
      let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || argv.processInstanceIds;

      await showProcessInstance(processInstanceIds, argv.correlation, argv.output);
    }
  )

  .command(
    'retry [PROCESS_INSTANCE_IDS...]',
    'restarts failed instances with the given process instance ids',
    (yargs) => {},
    (argv) => {
      logWarning('TODO: the engine has to implement this feature');
    }
  )

  .command(
    ['list-process-models', 'lsp'],
    'list process models',
    (yargs) => {
      yargs
        .option('--filter-by-id', {
          description: 'Filter process models by <PATTERN> (supports regular expressions)',
          type: 'string'
        })
        .option('--reject-by-id', {
          description: 'Reject process models by <PATTERN> (supports regular expressions)',
          type: 'string'
        });
    },
    async (argv: any) => {
      if (argv.help) {
        logHelp(`
      Examples:

        $ atlas list-process-models

        $ atlas list-process-models --filter-by-id "Registration"

        $ atlas list-process-models --reject-by-id "Internal"

      Filtering/rejecting also supports regular expressions:

        $ atlas list-process-models --filter-by-id "^Registration.+$"
      `);

        return;
      }

      const stdinPipeReader = await StdinPipeReader.create();
      const pipedProcessModelIds =
        stdinPipeReader.getPipedProcessModelIds() || stdinPipeReader.getPipedProcessModelIdsInProcessInstances();

      listProcessModels(pipedProcessModelIds, argv.filterById, argv.rejectById, argv.output);
    }
  )

  .command(
    ['list-process-instances', 'lsi'],
    'list process instances',
    (yargs) => {
      yargs
        .option('created-after', {
          description: 'Only include process instances created after <DATETIME>',
          type: 'string'
        })
        .option('created-before', {
          description: 'Only include process instances created before <DATETIME>',
          type: 'string'
        })
        .option('filter-by-correlation-id', {
          description: 'Filter process instances by <CORRELATION_ID>',
          type: 'array'
        })
        .option('filter-by-process-model-id', {
          description: 'Filter process instances by <PATTERN> (supports regular expressions)',
          type: 'string'
        })
        .option('reject-by-process-model-id', {
          description: 'Reject process instances by <PATTERN> (supports regular expressions)',
          type: 'string'
        })
        .option('filter-by-state', {
          description: 'Filter process instances by <STATE> (running, finished, error)',
          type: 'string'
        })
        .option('reject-by-state', {
          description: 'Reject process instances by <STATE> (running, finished, error)',
          type: 'string'
        })
        .option('sort-by-created-at', {
          description: 'Sort process instances by their created at timestamp in DIRECTION (asc, desc)',
          type: 'string'
        })
        .option('sort-by-process-model-id', {
          description: 'Sort process instances by their process model id in DIRECTION (asc, desc)',
          type: 'string'
        })
        .option('sort-by-state', {
          description: 'Sort process instances by their state in DIRECTION (asc, desc)',
          type: 'string'
        })
        .option('limit', {
          description: 'Lists a maximum of <LIMIT> process instances',
          type: 'number'
        });
    },
    async (argv: any) => {
      if (argv.help) {
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

        return;
      }

      const stdinPipeReader = await StdinPipeReader.create();
      const pipedProcessInstanceIds = stdinPipeReader.getPipedProcessInstanceIds();
      const pipedProcessModelIds = stdinPipeReader.getPipedProcessModelIds();

      const sortByCreatedAt = argv.sortByCreatedAt === true ? 'asc' : argv.sortByCreatedAt;
      const sortByProcessModelId = argv.sortByProcessModelId === true ? 'asc' : argv.sortByProcessModelId;
      const sortByState = argv.sortByState === true ? 'asc' : argv.sortByState;

      listProcessInstances(
        pipedProcessInstanceIds,
        pipedProcessModelIds,
        argv.createdAfter,
        argv.createdBefore,
        argv.filterByCorrelationId,
        argv.filterByProcessModelId,
        argv.rejectByProcessModelId,
        argv.filterByState,
        argv.rejectByState,
        sortByProcessModelId,
        sortByState,
        sortByCreatedAt,
        argv.limit,
        argv.output
      );
    }
  )

  .command(
    ['list-correlations', 'lsc'],
    'list correlations',
    (yargs) => {},
    (argv: any) => {
      logWarning('TODO: implement me');
    }
  )

  .recommendCommands().argv;
