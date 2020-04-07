#!/usr/bin/env node

import * as JSON5 from 'json5';
import 'reflect-metadata';

import program = require('yargs');

import { login } from './commands/login/login';
import { logout } from './commands/logout/logout';
import { printSessionStatus } from './commands/session-status/session-status';
import { listProcessModels } from './commands/list-process-models/list-process-models';
import { startProcessInstance } from './commands/start-process-model/start-process-model';
import { listProcessInstances } from './commands/list-process-instances/list-process-instances';
import { StdinPipeReader } from './cli/piped_data';
import { stopProcessInstance } from './commands/stop-process-instance/stop-process-instance';
import { showProcessInstance } from './commands/show-process-instance/show-process-instance';
import { deployFiles } from './commands/deploy-files/deploy-files';
import { removeProcessModels } from './commands/remove-process-models/remove-process-models';
import { formatHelpText, heading } from './cli/logging';
import { readFileSync } from 'fs';
import { retryProcessInstance } from './commands/retry-process-instance/retry-process-instance';

import epilogSnippetAtlas from './snippets/atlas.epilog';
import epilogSnippetDeployFiles from './snippets/deploy-files.epilog';
import epilogSnippetListProcessInstances from './snippets/list-process-instances.epilog';
import epilogSnippetListProcessModels from './snippets/list-process-models.epilog';
import epilogSnippetLogin from './snippets/login.epilog';
import epilogSnippetLogout from './snippets/logout.epilog';
import epilogSnippetRemoveProcessModels from './snippets/remove-process-models.epilog';
import epilogSnippetRetryProcessInstance from './snippets/retry-process-instance.epilog';
import epilogSnippetShowProcessInstance from './snippets/show-process-instance.epilog';
import epilogSnippetStartProcessModel from './snippets/start-process-model.epilog';
import epilogSnippetStopProcessInstance from './snippets/stop-process-instance.epilog';
import epilogSnippetSessionStatus from './snippets/session-status.epilog';

export const OUTPUT_FORMAT_JSON = 'json';
export const OUTPUT_FORMAT_TEXT = 'text';

const VERSION = require('../package.json').version;

const usageString = (commandName: string, synopsis: string): string => {
  return heading('USAGE') + `\n  $0 ${commandName} [options]\n\n` + heading('SYNOPSIS') + `\n  ${synopsis}`;
};

program
  .version(VERSION)
  .scriptName('atlas')

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
    default: OUTPUT_FORMAT_TEXT,
    choices: [OUTPUT_FORMAT_TEXT, OUTPUT_FORMAT_JSON]
  })

  .command(
    ['session-status', 'st'],
    'Show status of the current session',
    (yargs) => {
      return yargs
        .usage(usageString('session-status', 'Shows status of the current session.'))
        .epilog(formatHelpText(epilogSnippetSessionStatus));
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
        .usage(usageString('login [engine_url]', 'Starts or renews a session with the given engine.'))
        .positional('engine_url', {
          description: 'URL of engine to connect to',
          type: 'string'
        })
        .option('root', {
          description: 'Try to use anonymous root login',
          type: 'boolean'
        })
        .epilog(formatHelpText(epilogSnippetLogin));
    },
    async (argv: any) => {
      await login(argv.engine_url, argv.root, argv.output);
    }
  )

  .command(
    'logout',
    'Log out from the current session',
    (yargs) => {
      return yargs
        .usage(usageString('logout', 'Logs out from the current session.'))
        .epilog(formatHelpText(epilogSnippetLogout));
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
        .usage(usageString('deploy-files [filenames...]', 'Deploys BPMN files to the connected engine.'))
        .positional('filenames', {
          description: 'Files to deploy',
          demandOption: true
        })
        .epilog(formatHelpText(epilogSnippetDeployFiles));
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
        .usage(
          usageString(
            'remove-process-models [process_model_ids...]',
            'Removes deployed process models from the connected engine.'
          )
        )
        .positional('process_model_ids', {
          description: 'IDs of process models to remove'
        })
        .option('yes', {
          alias: 'y',
          description: 'Do not prompt for confirmation',
          type: 'boolean'
        })
        .epilog(formatHelpText(epilogSnippetRemoveProcessModels));
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
    ['start-process-model [process_model_id] [start_event_id]', 'start [process_model_id] [start_event_id]'],
    'Start an instance of a deployed process model',
    (yargs) => {
      return yargs
        .usage(
          usageString(
            'start-process-model [process_model_id] [start_event_id]',
            'Starts an instance of a deployed process model on the connected engine.'
          )
        )
        .positional('process_model_id', {
          description: 'ID of process model to start',
          type: 'string'
        })
        .positional('start_event_id', {
          description: 'ID of start event to trigger',
          type: 'string'
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
        .epilog(formatHelpText(epilogSnippetStartProcessModel));
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      const pipedProcessModelIds =
        stdinPipeReader.getPipedProcessModelIds() || stdinPipeReader.getPipedProcessModelIdsInDeployedFiles();

      let inputValues: any;

      if (argv.inputValuesFromStdin === true) {
        const stdinPipeReader = await StdinPipeReader.create();
        inputValues = stdinPipeReader.getPipedData();
      }
      if (argv.inputValuesFromFile != null) {
        const contents = readFileSync(argv.inputValuesFromFile);
        inputValues = JSON5.parse(contents.toString());
      }
      if (argv.inputValues != null) {
        inputValues = JSON5.parse(argv.inputValues);
      }

      await startProcessInstance(
        pipedProcessModelIds,
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
        .usage(
          usageString(
            'stop-process-instance [process_instance_ids...]',
            'Stops instances with the given process instance IDs on the connected engine.'
          )
        )
        .positional('process_instance_ids', {
          description: 'IDs of process instances to stop'
        })
        .epilog(formatHelpText(epilogSnippetStopProcessInstance));
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
        .usage(
          usageString(
            'show-process-instance [process_instance_ids...]',
            'Shows detailed information about individual process instances or correlations from the connected engine.'
          )
        )
        .positional('process_instance_ids', {
          description: 'IDs of process instances to show; if omitted, the latest process instance is shown'
        })
        .option('correlation', {
          alias: 'c',
          description: 'All given <process_instance_ids> are interpreted as correlation ids',
          type: 'boolean',
          default: false
        })
        .epilog(formatHelpText(epilogSnippetShowProcessInstance));
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || argv.process_instance_ids;

      await showProcessInstance(processInstanceIds, argv.correlation, argv.output);
    }
  )

  .command(
    ['retry-process-instance [process_instance_ids...]', 'retry'],
    'Restart failed process instances with the given process instance IDs',
    (yargs) => {
      return yargs
        .usage(
          usageString(
            'retry [process_instance_ids...]',
            'Restarts failed process instances with the given process instance IDs on the connected engine.'
          )
        )
        .positional('process_instance_ids', {
          description: 'IDs of process instances to restart'
        })
        .epilog(formatHelpText(epilogSnippetRetryProcessInstance));
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || argv.process_instance_ids;

      await retryProcessInstance(processInstanceIds, argv.output);
    }
  )

  .command(
    ['list-process-models', 'lsp'],
    'List, sort and filter process models by ID',
    (yargs) => {
      return yargs
        .usage(
          usageString('list-process-models', 'Lists, sorts and filters process models by ID from the connected engine.')
        )
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
        .option('all-fields', {
          alias: 'F',
          description: 'Show all fields',
          type: 'boolean',
          default: false
        })
        .strict()
        .group(['filter-by-id', 'reject-by-id'], heading('FILTERING OPTIONS'))
        .group(['all-fields', 'output'], heading('OUTPUT OPTIONS'))
        .epilog(formatHelpText(epilogSnippetListProcessModels));
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      const pipedProcessModelIds =
        stdinPipeReader.getPipedProcessModelIds() || stdinPipeReader.getPipedProcessModelIdsInProcessInstances();

      listProcessModels(pipedProcessModelIds, argv.filterById, argv.rejectById, argv.allFields, argv.output);
    }
  )

  .command(
    ['list-process-instances', 'lsi'],
    'List, sort and filter process instances by date, state, process model and/or correlation',
    (yargs) => {
      return yargs
        .usage(
          usageString(
            'list-process-instances',
            'Lists, sorts and filters process instances by date, state, process model and/or correlation from the connected engine.'
          )
        )
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
        .option('all-fields', {
          alias: 'F',
          description: 'Show all fields',
          type: 'boolean',
          default: false
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
        .group(['all-fields', 'output'], heading('OUTPUT OPTIONS'))
        .epilog(formatHelpText(epilogSnippetListProcessInstances));
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
        argv.allFields,
        argv.output
      );
    }
  )

  .showHelpOnFail(false)
  .usage(
    heading('USAGE') +
      '\n  $0 <command> [options]\n\n' +
      heading('SYNOPSIS') +
      '\n  Atlas CLI provides a rich interface to deploy and start process models as well as manage and inspect process instances and correlations for both ProcesEngine and AtlasEngine.'
  )
  .epilog(formatHelpText(epilogSnippetAtlas))
  .locale('en')
  .updateStrings({
    'Commands:': heading('COMMANDS'),
    'Positionals:': heading('ARGUMENTS'),
    'Options:': heading('GENERAL OPTIONS')
  })
  .wrap(null)
  .strict()
  .recommendCommands().argv;
