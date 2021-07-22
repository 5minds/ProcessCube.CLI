import { CLI, Inputs } from '../../cli';
import { logWarning } from '../../cli/logging';
import { removeProcessModels } from './remove-process-models';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'remove-process-models',
      alias: 'remove',
      description: 'Remove deployed process models from the engine',
      synopsis: 'Removes deployed process models from the connected engine.',
      examples: require('./examples.md'),
      arguments: [
        {
          name: 'processModelIds',
          type: 'array',
          description: 'IDs of process models to remove'
        }
      ],
      options: [
        {
          name: 'yes',
          alias: 'y',
          description: 'Do not prompt for confirmation',
          type: 'boolean',
          default: false
        }
      ]
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  if (inputs.argv.processModelIds?.length === 0) {
    logWarning('No IDs given. Aborting.');
    return;
  }

  removeProcessModels(inputs.argv.processModelIds, inputs.argv.yes, inputs.argv.output);
}
