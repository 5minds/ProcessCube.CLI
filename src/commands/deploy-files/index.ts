import { CLI, Inputs } from '../../cli';
import { deployFiles } from './deploy-files';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'deploy-files',
      alias: 'deploy',
      description: 'Deploy BPMN files to the engine',
      synopsis: 'Deploys BPMN files to the connected engine.',
      examples: require('./examples.md'),
      arguments: [
        {
          name: 'filenames',
          type: 'array',
          description: 'Files to deploy'
        }
      ],
      options: []
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  if (inputs.argv.filenames?.length === 0) {
    // program.showHelp();
    return;
  }

  deployFiles(inputs.argv.filenames, inputs.argv.output);
}
