import { CLI, Inputs } from '../../contracts/cli_types';
import { LegacyStdinPipeReader } from '../../cli/LegacyStdinPipeReader';
import { listUserTasks } from './list-user-tasks';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'list-user-tasks',
      alias: 'lsu',
      description: 'List, sort and filter user tasks',
      descriptionLong: 'Lists, sorts and filters user tasks by state and/or process model from the connected engine.',
      examples: require('./examples.md'),
      options: [
        {
          name: 'filter-by-correlation-id',
          description: 'Filter user tasks by <correlationId>',
          type: 'array',
          default: [],
        },
        {
          name: 'filter-by-process-model-id',
          description: 'Filter user tasks by <pattern> (supports regular expressions)',
          type: 'array',
          default: [],
        },
        {
          name: 'reject-by-process-model-id',
          description: 'Reject user tasks by <pattern> (supports regular expressions)',
          type: 'array',
          default: [],
        },
        {
          name: 'filter-by-state',
          description: 'Filter user tasks by <state> (running, finished, error)',
          type: 'array',
          default: [],
        },
        {
          name: 'filter-by-flow-node-instance-id',
          description: 'Filter user tasks by <flowNodeInstanceId>',
          type: 'array',
          default: [],
        },
        {
          name: 'reject-by-state',
          description: 'Reject user tasks by <state> (running, finished, error)',
          type: 'array',
          default: [],
        },
        {
          name: 'sort-by-process-model-id',
          description: 'Sort user tasks by their process model id in <direction> (asc, desc)',
          type: 'string',
          choices: ['', 'asc', 'desc'],
        },
        {
          name: 'sort-by-state',
          description: 'Sort user tasks by their state in <direction> (asc, desc)',
          type: 'string',
          choices: ['', 'asc', 'desc'],
        },
        {
          name: 'limit',
          description: 'List a maximum of <limit> user tasks',
          type: 'number',
        },
      ],
      optionGroups: [
        {
          heading: 'FILTERING OPTIONS',
          options: [
            'filter-by-correlation-id',
            'filter-by-process-model-id',
            'filter-by-state',
            'reject-by-process-model-id',
            'reject-by-state',
            'limit',
          ],
        },
        {
          heading: 'SORTING OPTIONS',
          options: ['sort-by-process-model-id', 'sort-by-state'],
        },
        {
          heading: 'OUTPUT OPTIONS',
          options: ['output'],
        },
      ],
    },
    runCommand,
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  const stdinPipeReader = await LegacyStdinPipeReader.create(inputs.stdin);
  const pipedProcessInstanceIds = stdinPipeReader.getPipedProcessInstanceIds();
  const pipedProcessModelIds = stdinPipeReader.getPipedProcessModelIds();

  const sortByProcessModelId = inputs.argv.sortByProcessModelId === '' ? 'asc' : inputs.argv.sortByProcessModelId;
  const sortByState = inputs.argv.sortByState === '' ? 'asc' : inputs.argv.sortByState;

  listUserTasks(
    pipedProcessInstanceIds,
    pipedProcessModelIds,
    inputs.argv.filterByFlowNodeInstanceId,
    inputs.argv.filterByCorrelationId,
    inputs.argv.filterByProcessModelId,
    inputs.argv.rejectByProcessModelId,
    inputs.argv.filterByState,
    inputs.argv.rejectByState,
    sortByProcessModelId,
    sortByState,
    inputs.argv.limit,
    inputs.argv.output,
  );
}
