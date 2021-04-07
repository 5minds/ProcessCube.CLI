#!/usr/bin/env node

import * as JSON5 from 'json5';
import 'reflect-metadata';

import program = require('yargs');

import { login } from './commands/login/login';
import { logout } from './commands/logout/logout';
import { printSessionStatus } from './commands/session-status/session-status';
import { listUserTasks } from './commands/list-user-tasks/list-user-tasks';
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
import { finishUserTask } from './commands/finish-user-task/finish-user-task';

import epilogSnippetAtlas from './snippets/atlas.epilog.md';
import epilogSnippetDeployFiles from './snippets/deploy-files.epilog.md';
import epilogSnippetListProcessInstances from './snippets/list-process-instances.epilog.md';
import epilogSnippetListUserTasks from './snippets/list-user-tasks.epilog.md';
import epilogSnippetListProcessModels from './snippets/list-process-models.epilog.md';
import epilogSnippetLogin from './snippets/login.epilog.md';
import epilogSnippetLogout from './snippets/logout.epilog.md';
import epilogSnippetRemoveProcessModels from './snippets/remove-process-models.epilog.md';
import epilogSnippetRetryProcessInstance from './snippets/retry-process-instance.epilog.md';
import epilogSnippetShowProcessInstance from './snippets/show-process-instance.epilog.md';
import epilogSnippetStartProcessModel from './snippets/start-process-model.epilog.md';
import epilogSnippetStopProcessInstance from './snippets/stop-process-instance.epilog.md';
import epilogSnippetSessionStatus from './snippets/session-status.epilog.md';
import epilogSnippetFinishUserTask from './snippets/finish-user-task.epilog.md';

export const OUTPUT_FORMAT_JSON = 'json';
export const OUTPUT_FORMAT_TEXT = 'text';

const VERSION = require('../package.json').version;

const defaultFormat = Boolean(process.stdout.isTTY) ? OUTPUT_FORMAT_TEXT : OUTPUT_FORMAT_JSON;

const usageString = (commandName: string, synopsis: string): string => {
  return heading('USAGE') + `\n  $0 ${commandName} [options]\n\n` + heading('SYNOPSIS') + `\n  ${synopsis}`;
};

program
  .version(VERSION)
  .scriptName('pc')

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
    default: defaultFormat,
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
    'login [engineUrl]',
    'Log in to the given engine',
    (yargs) => {
      return yargs
        .usage(usageString('login [engineUrl]', 'Starts or renews a session with the given engine.'))
        .positional('engineUrl', {
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
      await login(argv.engineUrl, argv.root, argv.output);
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
    ['remove-process-models [processModelIds...]', 'remove [processModelIds...]'],
    'Remove deployed process models from the engine',
    (yargs) => {
      return yargs
        .usage(
          usageString(
            'remove-process-models [processModelIds...]',
            'Removes deployed process models from the connected engine.'
          )
        )
        .positional('processModelIds', {
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
      if (argv.processModelIds?.length === 0) {
        program.showHelp();
        return;
      }

      removeProcessModels(argv.processModelIds, argv.yes, argv.output);
    }
  )

  .command(
    ['start-process-model [processModelId] [startEventId]', 'start [processModelId] [startEventId]'],
    'Start an instance of a deployed process model',
    (yargs) => {
      return yargs
        .usage(
          usageString(
            'start-process-model [processModelId] [startEventId]',
            'Starts an instance of a deployed process model on the connected engine.'
          )
        )
        .positional('processModelId', {
          description: 'ID of process model to start',
          type: 'string'
        })
        .positional('startEventId', {
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
    ['stop-process-instance [processInstanceIds...]', 'stop [processInstanceIds...]'],
    'Stop instances with the given process instance IDs',
    (yargs) => {
      return yargs
        .usage(
          usageString(
            'stop-process-instance [processInstanceIds...]',
            'Stops instances with the given process instance IDs on the connected engine.'
          )
        )
        .positional('processInstanceIds', {
          description: 'IDs of process instances to stop'
        })
        .epilog(formatHelpText(epilogSnippetStopProcessInstance));
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || argv.processInstanceIds;

      await stopProcessInstance(processInstanceIds, argv.output);
    }
  )

  .command(
    ['show-process-instance [processInstanceIds...]', 'show'],
    'Show detailed information about individual process instances or correlations',
    (yargs) => {
      return yargs
        .usage(
          usageString(
            'show-process-instance [processInstanceIds...]',
            'Shows detailed information about individual process instances or correlations from the connected engine.'
          )
        )
        .positional('processInstanceIds', {
          description: 'IDs of process instances to show; if omitted, the latest process instance is shown'
        })
        .option('correlation', {
          alias: 'c',
          description: 'All given <processInstanceIds> are interpreted as correlation ids',
          type: 'boolean',
          default: false
        })
        .option('all-fields', {
          alias: 'F',
          description: 'Show all fields',
          type: 'boolean',
          default: false
        })
        .epilog(formatHelpText(epilogSnippetShowProcessInstance));
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || argv.processInstanceIds;

      await showProcessInstance(processInstanceIds, argv.correlation, argv.allFields, argv.output);
    }
  )

  .command(
    ['retry-process-instance [processInstanceIds...]', 'retry'],
    'Restart failed process instances with the given process instance IDs',
    (yargs) => {
      return yargs
        .usage(
          usageString(
            'retry [processInstanceIds...]',
            'Restarts failed process instances with the given process instance IDs on the connected engine.'
          )
        )
        .positional('processInstanceIds', {
          description: 'IDs of process instances to restart'
        })
        .epilog(formatHelpText(epilogSnippetRetryProcessInstance));
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || argv.processInstanceIds;

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
        .option('completed-after', {
          description: 'Only include process instances completed after <datetime>',
          type: 'string'
        })
        .option('completed-before', {
          description: 'Only include process instances completed before <datetime>',
          type: 'string'
        })
        .option('completed-in', {
          description: 'Only include process instances completed in <datetime>',
          type: 'string'
        })
        .option('filter-by-correlation-id', {
          description: 'Filter process instances by <correlationId>',
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
            'completed-after',
            'completed-before',
            'completed-in',
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
        argv.completedAfter,
        argv.completedBefore,
        argv.completedIn,
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

  .command(
    ['list-user-tasks', 'lut'],
    'List, sort and filter user tasks by state and/or process model',
    (yargs) => {
      return yargs
        .usage(
          usageString(
            'list-user-tasks',
            'Lists, sorts and filters user tasks by state and/or process model from the connected engine.'
          )
        )
        .option('filter-by-correlation-id', {
          description: 'Filter user tasks by <correlationId>',
          type: 'array',
          default: []
        })
        .option('filter-by-process-model-id', {
          description: 'Filter user tasks by <pattern> (supports regular expressions)',
          type: 'array',
          default: []
        })
        .option('reject-by-process-model-id', {
          description: 'Reject user tasks by <pattern> (supports regular expressions)',
          type: 'array',
          default: []
        })
        .option('filter-by-state', {
          description: 'Filter user tasks by <state> (running, finished, error)',
          type: 'array',
          default: []
        })
        .option('filter-by-flow-node-instance-id', {
          description: 'Filter user tasks by <flowNodeInstanceId>',
          type: 'array',
          default: []
        })
        .option('reject-by-state', {
          description: 'Reject user tasks by <state> (running, finished, error)',
          type: 'array',
          default: []
        })
        .option('sort-by-process-model-id', {
          description: 'Sort user tasks by their process model id in <direction> (asc, desc)',
          type: 'string',
          choices: ['', 'asc', 'desc']
        })
        .option('sort-by-state', {
          description: 'Sort user tasks by their state in <direction> (asc, desc)',
          type: 'string',
          choices: ['', 'asc', 'desc']
        })
        .option('limit', {
          description: 'List a maximum of <limit> user tasks',
          type: 'number'
        })
        .group(
          [
            'filter-by-correlation-id',
            'filter-by-process-model-id',
            'filter-by-state',
            'reject-by-process-model-id',
            'reject-by-state'
          ],
          heading('FILTERING OPTIONS')
        )
        .group(['sort-by-process-model-id', 'sort-by-state', 'limit'], heading('SORTING OPTIONS'))
        .group(['all-fields', 'output'], heading('OUTPUT OPTIONS'))
        .epilog(formatHelpText(epilogSnippetListUserTasks));
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      const pipedProcessInstanceIds = stdinPipeReader.getPipedProcessInstanceIds();
      const pipedProcessModelIds = stdinPipeReader.getPipedProcessModelIds();
      const sortByProcessModelId = argv.sortByProcessModelId === '' ? 'asc' : argv.sortByProcessModelId;
      const sortByState = argv.sortByState === '' ? 'asc' : argv.sortByState;

      listUserTasks(
        pipedProcessInstanceIds,
        pipedProcessModelIds,
        argv.filterByFlowNodeInstanceId,
        argv.filterByCorrelationId,
        argv.filterByProcessModelId,
        argv.rejectByProcessModelId,
        argv.filterByState,
        argv.rejectByState,
        sortByProcessModelId,
        sortByState,
        argv.limit,
        argv.output
      );
    }
  )

  .command(
    ['finish-user-task [flowNodeInstanceId]', 'finish'],
    'Finish a given user task',
    (yargs) => {
      return yargs
        .usage(usageString('finish-user-task [flowNodeInstanceId]', 'Finishes a given user task.'))
        .positional('flowNodeInstanceId', {
          description: 'ID of user task to finish'
        })
        .option('result', {
          description: 'Set result values for the finished user task from <json> string',
          type: 'string'
        })
        .option('result-from-file', {
          description: 'Read result values as JSON from <file>',
          type: 'string'
        })
        .epilog(formatHelpText(epilogSnippetFinishUserTask));
    },
    async (argv: any) => {
      const stdinPipeReader = await StdinPipeReader.create();
      const flowNodeInstanceId = stdinPipeReader.getPipedFlowNodeInstanceIds()?.[0] || argv.flowNodeInstanceId;

      if (stdinPipeReader.getPipedFlowNodeInstanceIds()?.length > 1) {
        console.log('Warning: Only using first piped flowNodeInstanceId from stdin to finish user task.');
      }
      let resultValues: any;

      if (argv.resultFromFile != null) {
        const contents = readFileSync(argv.resultFromFile);
        resultValues = JSON5.parse(contents.toString());
      }
      if (argv.result != null) {
        resultValues = JSON5.parse(argv.result);
      }

      await finishUserTask(flowNodeInstanceId, resultValues, argv.output);
    }
  )

  .showHelpOnFail(true)
  .demandCommand(1, '')
  .usage(
    heading('USAGE') +
      '\n  $0 <command> [options]\n\n' +
      heading('SYNOPSIS') +
      '\n  ProcessCube CLI provides a rich interface to deploy and start process models as well as manage and inspect process instances and correlations for 5Minds Engine.'
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
