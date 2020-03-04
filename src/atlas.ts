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
import { logWarning, formatHelpText, heading } from './cli/logging';
import { readFileSync } from 'fs';

export const OUTPUT_FORMAT_JSON = 'json';
export const OUTPUT_FORMAT_TEXT = 'text';

const VERSION = require('../package.json').version;

program
  .version(VERSION)

  .option('help', {
    alias: 'h',
    description: 'Show help',
    type: 'boolean',
    default: false
  })
  .option('output', {
    alias: 'o',
    description: 'Set output',
    type: 'string',
    default: OUTPUT_FORMAT_TEXT
  })

  .command(
    ['session-status', 'st'],
    'Show status of the current session',
    (yargs) => {
      return yargs.epilog(
        formatHelpText(`
          EXAMPLES

              $ atlas status
        `)
      );
    },
    (argv: any) => {
      printSessionStatus(argv.output);
    }
  )

  .command(
    'login [engine_url]',
    'Log in to the given engine',
    (yargs) => {
      return yargs
        .positional('engine_url', {
          description: 'URL of engine to connect to',
          type: 'string'
        })

        .option('root', {
          description: 'Try to use anonymous root login',
          type: 'boolean'
        })

        .epilog(
          formatHelpText(`
            EXAMPLES

                $ atlas login http://localhost:56000

            Engines meant for development are often configured to allow anonymous root access (this is, of course, not recommended for production use!).

                $ atlas login http://localhost:56000 --root
          `)
        );
    },
    async (argv: any) => {
      await login(argv.engine_url, argv.root, argv.output);
    }
  )

  .command(
    'logout',
    'Log out from the current session',
    (yargs) => {
      return yargs.epilog(
        formatHelpText(`
          EXAMPLES

              $ atlas logout
        `)
      );
    },
    async (argv: any) => {
      await logout(argv.output);
    }
  )

  .command(
    ['deploy-files [filenames...]', 'deploy [filenames...]'],
    'Deploy BPMN files to the engine',
    (yargs) => {
      return yargs
        .positional('filenames', {
          description: 'Files to deploy',
          demandOption: true
        })

        .epilog(
          formatHelpText(`
            EXAMPLES

                $ atlas deploy registration_email_coupons.bpmn

            The commands takes multiple arguments and supports globs:

                $ atlas deploy registration_email_coupons.bpmn registration_fraud_detection.bpmn

                $ atlas deploy *.bpmn
          `)
        );
    },
    (argv: any) => {
      if (argv.filenames?.length === 0) {
        program.showHelp();
        return;
      }

      deployFiles(argv.filenames, argv.output);
    }
  )

  .command(
    ['remove-process-models [process_model_ids...]', 'remove [process_model_ids...]'],
    'Remove deployed process models from the engine',
    (yargs) => {
      return yargs
        .positional('process_model_ids', {
          description: 'Ids of process models to remove'
        })

        .option('yes', {
          alias: 'y',
          description: 'Do not prompt for confirmation',
          type: 'boolean'
        })

        .epilog(
          formatHelpText(`
            EXAMPLES

                $ atlas remove Registration.EmailCoupons

            If you don't want to be prompted for confirmation, use \`--yes\`:

                $ atlas remove Registration.EmailCoupons --yes
          `)
        );
    },
    (argv: any) => {
      if (argv.process_model_ids?.length === 0) {
        program.showHelp();
        return;
      }

      removeProcessModels(argv.process_model_ids, argv.yes, argv.output);
    }
  )

  .command(
    ['start-process-model <process_model_id> <start_event_id>', 'start <process_model_id> <start_event_id>'],
    'Start an instance of a deployed process model',
    (yargs) => {
      return yargs
        .positional('process_model_id', {
          description: 'ID of process model to start',
          type: 'string',
          demandOption: true
        })
        .positional('start_event_id', {
          description: 'ID of StartEvent to trigger',
          type: 'string',
          demandOption: true
        })

        .option('wait', {
          description: 'Wait for the started process instance to finish execution and report the result',
          type: 'boolean'
        })
        .option('correlation-id', {
          description: 'Set a predefined correlation id for the process instance',
          type: 'string'
        })
        .option('input-values', {
          description: 'Set input values for the process instance from <json> string',
          type: 'string'
        })
        .option('input-values-from-stdin', {
          description: 'Read input values as JSON from STDIN',
          type: 'boolean'
        })
        .option('input-values-from-file', {
          description: 'Read input values as JSON from <file>',
          type: 'string'
        })

        .epilog(
          formatHelpText(`
            EXAMPLES

                $ atlas start-process-model Registration.EmailCoupons StartEvent_1

                $ atlas start Registration.EmailCoupons StartEvent_1

                $ atlas start Registration.EmailCoupons StartEvent_1 --correlation-id "my-correlation-id-1234"

                $ atlas start Registration.EmailCoupons StartEvent_1 --wait

                $ atlas start Registration.EmailCoupons StartEvent_1 --input-values '{"answer": 42, "email": "jobs@5minds.de"}'

                $ atlas start Registration.EmailCoupons StartEvent_1 --input-values-from-file input.json

              $ cat input.json | atlas start Registration.EmailCoupons StartEvent_1s
          `)
        );
    },
    async (argv: any) => {
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
        argv.process_model_id,
        argv.start_event_id,
        argv.correlationId,
        inputValues,
        argv.wait,
        argv.output
      );
    }
  )

  .command(
    ['stop-process-instance [process_instance_ids...]', 'stop [process_instance_ids...]'],
    'Stop instances with the given process instance IDs',
    (yargs) => {
      return yargs
        .positional('process_instance_ids', {
          description: 'IDs of process instances to stop'
        })

        .epilog(
          formatHelpText(`
            EXAMPLES

                $ atlas stop-process-instance 56a89c11-ee0d-4539-b4cb-84a0339262fd

                $ atlas stop 56a89c11-ee0d-4539-b4cb-84a0339262fd
          `)
        );
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || argv.process_instance_ids;

      await stopProcessInstance(processInstanceIds, argv.output);
    }
  )

  .command(
    ['show-process-instance [process_instance_ids...]', 'show'],
    'Show detailed information about individual process instances or correlations',
    (yargs) => {
      return yargs
        .positional('process_instance_ids', {
          description: 'IDs of process instances to show'
        })

        .option('correlation', {
          alias: 'c',
          description: 'All given <process_instance_ids> are interpreted as correlation ids',
          type: 'boolean',
          default: false
        })

        .epilog(
          formatHelpText(`
            EXAMPLES

                $ atlas show-process-instance 56a89c11-ee0d-4539-b4cb-84a0339262fd

                $ atlas show 56a89c11-ee0d-4539-b4cb-84a0339262fd

                $ atlas show --correlation e552acfe-8446-42c0-a76b-5cd65bf110ac
          `)
        );
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || argv.process_instance_ids;

      await showProcessInstance(processInstanceIds, argv.correlation, argv.output);
    }
  )

  .command(
    'retry [process_instance_ids...]',
    'Restart failed process instances with the given process instance IDs',
    (yargs) => {
      return yargs.positional('process_instance_ids', {
        description: 'IDs of process instances to restart'
      });
    },
    (argv) => {
      logWarning('TODO: the engine has to implement this feature');
    }
  )

  .command(
    ['list-process-models', 'lsp'],
    'List, sort and filter process models by ID',
    (yargs) => {
      return yargs
        .option('filter-by-id', {
          description: 'Filter process models by <pattern> (supports regular expressions)',
          type: 'array',
          default: []
        })
        .option('reject-by-id', {
          description: 'Reject process models by <pattern> (supports regular expressions)',
          type: 'array',
          default: []
        })

        .group(['filter-by-id', 'reject-by-id'], heading('FILTERING OPTIONS'))

        .epilog(
          formatHelpText(`
            EXAMPLES

                $ atlas list-process-models

                $ atlas list-process-models --filter-by-id "Registration"

                $ atlas list-process-models --reject-by-id "Internal"

            Filtering/rejecting also supports regular expressions:

                $ atlas list-process-models --filter-by-id "^Registration.+$"
          `)
        );
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      const pipedProcessModelIds =
        stdinPipeReader.getPipedProcessModelIds() || stdinPipeReader.getPipedProcessModelIdsInProcessInstances();

      listProcessModels(pipedProcessModelIds, argv.filterById, argv.rejectById, argv.output);
    }
  )

  .command(
    ['list-process-instances', 'lsi'],
    'List, sort and filter process instances by date, state, process model and/or correlation',
    (yargs) => {
      return yargs
        .option('created-after', {
          description: 'Only include process instances created after <datetime>',
          type: 'string'
        })
        .option('created-before', {
          description: 'Only include process instances created before <datetime>',
          type: 'string'
        })
        .option('filter-by-correlation-id', {
          description: 'Filter process instances by <correlation_id>',
          type: 'array',
          default: []
        })
        .option('filter-by-process-model-id', {
          description: 'Filter process instances by <pattern> (supports regular expressions)',
          type: 'array',
          default: []
        })
        .option('reject-by-process-model-id', {
          description: 'Reject process instances by <pattern> (supports regular expressions)',
          type: 'array',
          default: []
        })
        .option('filter-by-state', {
          description: 'Filter process instances by <state> (running, finished, error)',
          type: 'array',
          default: []
        })
        .option('reject-by-state', {
          description: 'Reject process instances by <state> (running, finished, error)',
          type: 'array',
          default: []
        })
        .option('sort-by-created-at', {
          description: 'Sort process instances by their created at timestamp in <direction> (asc, desc)',
          type: 'string',
          choices: ['', 'asc', 'desc']
        })
        .option('sort-by-process-model-id', {
          description: 'Sort process instances by their process model id in <direction> (asc, desc)',
          type: 'string',
          choices: ['', 'asc', 'desc']
        })
        .option('sort-by-state', {
          description: 'Sort process instances by their state in <direction> (asc, desc)',
          type: 'string',
          choices: ['', 'asc', 'desc']
        })
        .option('limit', {
          description: 'List a maximum of <limit> process instances',
          type: 'number'
        })
        .group(
          [
            'created-after',
            'created-before',
            'filter-by-correlation-id',
            'filter-by-process-model-id',
            'filter-by-state',
            'reject-by-process-model-id',
            'reject-by-state'
          ],
          heading('FILTERING OPTIONS')
        )
        .group(['sort-by-created-at', 'sort-by-process-model-id', 'sort-by-state', 'limit'], heading('SORTING OPTIONS'))

        .epilog(
          formatHelpText(`
            EXAMPLES

                $ atlas list-process-instances

            Filtering by date:

                $ atlas list-process-instances --created-after "2020-01-01" --created-before "2020-01-31"

            Filtering by process model ID:

                $ atlas list-process-instances --filter-by-process-model-id "Registration"

            Filtering by state (error, running, finished):

                $ atlas list-process-instances --filter-by-state error

            Filtering by process model ID also supports regular expressions:

                $ atlas list-process-instances --filter-by-process-model-id "^Registration.+$"

            Filter options compound, meaning that they allow to look for more than one pattern:

                $ atlas list-process-instances --filter-by-state error --filter-by-state running

            ... i.e. using the same filter multiple times results in an OR query:

                $ atlas list-process-instances --filter-by-process-model-id "Registration" --filter-by-process-model-id "Email"

            ... piping the result into another execution of list-process-instances leads to an AND query:

                $ atlas list-process-instances --filter-by-process-model-id "Registration" --output json | atlas list-process-instances --filter-by-process-model-id "Email"

            Combinations of all switches are possible:

                $ atlas list-process-instances --created-after "2020-01-01" --created-before "2020-01-31" \\
                                                --filter-by-process-model-id "^Registration.+$" \\
                                                --reject-by-process-model-id "Internal" \\
                                                --filter-by-state error \\
                                                --filter-by-state running \\
                                                --sort-by-process-model-id asc \\
                                                --sort-by-state desc \\
                                                --sort-by-created-at asc

            The above lists all process instances from January 2020, which were started from a process model whose name contains the prefix "Registration.", but does not contain the word "Internal", and which are either still running or resulted in an error.
            The results are sorted by process model in ascending alphabetical order, within each model section, the process instances are grouped by state in the order "running, error" and for each state, process instances are listed oldest to newest.
          `)
        );
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      const pipedProcessInstanceIds = stdinPipeReader.getPipedProcessInstanceIds();
      const pipedProcessModelIds = stdinPipeReader.getPipedProcessModelIds();

      const sortByCreatedAt = argv.sortByCreatedAt === '' ? 'asc' : argv.sortByCreatedAt;
      const sortByProcessModelId = argv.sortByProcessModelId === '' ? 'asc' : argv.sortByProcessModelId;
      const sortByState = argv.sortByState === '' ? 'asc' : argv.sortByState;

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

  .locale('en')
  .updateStrings({
    'Commands:': heading('COMMANDS'),
    'Options:': heading('GENERAL OPTIONS')
  })
  .wrap(null)
  .strict()
  .recommendCommands().argv;
