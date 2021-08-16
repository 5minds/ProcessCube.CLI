import { CLI, Inputs } from '../../cli';
import { LegacyStdinPipeReader } from '../../cli/LegacyStdinPipeReader';
import { listProcessInstances } from './list-process-instances';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'list-process-instances',
      alias: 'lsi',
      description: 'List, sort and filter process instances by date, state, process model and/or correlation',
      descriptionLong:
        'Lists, sorts and filters process instances by date, state, process model and/or correlation from the connected engine.',
      examples: require('./examples.md'),
      options: [
        {
          name: 'created-after',
          description: 'Only include process instances created after <datetime>',
          type: 'string'
        },
        {
          name: 'created-before',
          description: 'Only include process instances created before <datetime>',
          type: 'string'
        },
        {
          name: 'completed-after',
          description: 'Only include process instances completed after <datetime>',
          type: 'string'
        },
        {
          name: 'completed-before',
          description: 'Only include process instances completed before <datetime>',
          type: 'string'
        },
        {
          name: 'completed-in',
          description: 'Only include process instances completed in <datetime>',
          type: 'string'
        },
        {
          name: 'filter-by-correlation-id',
          description: 'Filter process instances by <correlationId>',
          type: 'array',
          default: []
        },
        {
          name: 'filter-by-process-model-id',
          description: 'Filter process instances by <pattern> (supports regular expressions)',
          type: 'array',
          default: []
        },
        {
          name: 'reject-by-process-model-id',
          description: 'Reject process instances by <pattern> (supports regular expressions)',
          type: 'array',
          default: []
        },
        {
          name: 'filter-by-state',
          description: 'Filter process instances by <state> (running, finished, error)',
          type: 'array',
          default: []
        },
        {
          name: 'reject-by-state',
          description: 'Reject process instances by <state> (running, finished, error)',
          type: 'array',
          default: []
        },
        {
          name: 'sort-by-created-at',
          description: 'Sort process instances by their created at timestamp in <direction> (asc, desc)',
          type: 'string',
          choices: ['', 'asc', 'desc']
        },
        {
          name: 'sort-by-process-model-id',
          description: 'Sort process instances by their process model id in <direction> (asc, desc)',
          type: 'string',
          choices: ['', 'asc', 'desc']
        },
        {
          name: 'sort-by-state',
          description: 'Sort process instances by their state in <direction> (asc, desc)',
          type: 'string',
          choices: ['', 'asc', 'desc']
        },
        {
          name: 'limit',
          description: 'List a maximum of <limit> process instances',
          type: 'number'
        },
        {
          name: 'all-fields',
          alias: 'F',
          description: 'Show all fields',
          type: 'boolean',
          default: false
        }
      ],
      optionGroups: [
        {
          heading: 'FILTERING OPTIONS',
          options: [
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
          ]
        },
        {
          heading: 'SORTING OPTIONS',
          options: ['sort-by-created-at', 'sort-by-process-model-id', 'sort-by-state', 'limit']
        },
        {
          heading: 'OUTPUT OPTIONS',
          options: ['all-fields', 'output']
        }
      ]
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs) {
  const options = inputs.argv;
  const stdinPipeReader = await LegacyStdinPipeReader.create(inputs.stdin);
  const pipedProcessInstanceIds = stdinPipeReader.getPipedProcessInstanceIds();
  const pipedProcessModelIds = stdinPipeReader.getPipedProcessModelIds();

  listProcessInstances(
    pipedProcessInstanceIds,
    pipedProcessModelIds,
    options.createdAfter,
    options.createdBefore,
    options.completedAfter,
    options.completedBefore,
    options.completedIn,
    options.filterByCorrelationId,
    options.filterByProcessModelId,
    options.rejectByProcessModelId,
    options.filterByState,
    options.rejectByState,
    options.sortByProcessModelId ?? 'asc',
    options.sortByState ?? 'asc',
    options.sortByCreatedAt ?? 'asc',
    options.limit,
    options.allFields,
    options.output
  );
}
