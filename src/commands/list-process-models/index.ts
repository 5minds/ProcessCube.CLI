import { CLI, Inputs } from '../../cli';
import { StdinPipeReader } from '../../cli/piped_data';
import { listProcessModels } from './list-process-models';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'list-process-models',
      alias: 'lsp',
      description: 'List, sort and filter process models by ID',
      synopsis: 'Lists, sorts and filters process models by ID from the connected engine.',
      examples: require('./examples.md'),
      options: [
        {
          name: 'filter-by-id',
          description: 'Filter process models by <pattern> (supports regular expressions)',
          type: 'array',
          default: []
        },
        {
          name: 'reject-by-id',
          description: 'Reject process models by <pattern> (supports regular expressions)',
          type: 'array',
          default: []
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
          options: ['filter-by-id', 'reject-by-id']
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

async function runCommand(inputs: Inputs): Promise<void> {
  const stdinPipeReader = await StdinPipeReader.create();
  const pipedProcessModelIds =
    stdinPipeReader.getPipedProcessModelIds() || stdinPipeReader.getPipedProcessModelIdsInProcessInstances();

  listProcessModels(
    pipedProcessModelIds,
    inputs.options.filterById,
    inputs.options.rejectById,
    inputs.options.allFields,
    inputs.options.output
  );
}
