import { CLI, Inputs } from '../../contracts/cli_types';
import { installExtension } from './installExtension';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'install-extension',
      alias: 'install',
      description: 'Install an extension',
      examples: require('./examples.md'),
      arguments: [
        {
          name: 'urlOrFilename',
          description: 'URL or filename of an extension ZIP',
          mandatory: true
        }
      ],
      options: [
        {
          name: 'type',
          description: 'Type of the extension',
          type: 'string',
          choices: ['cli', 'engine', 'portal', 'studio']
        },
        {
          name: 'yes',
          alias: 'y',
          description: 'Overwrite existing extensions',
          type: 'boolean',
          default: false
        }
      ]
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  await installExtension(inputs.argv.urlOrFilename, inputs.argv.type, inputs.argv.yes, inputs.argv.output);
}
