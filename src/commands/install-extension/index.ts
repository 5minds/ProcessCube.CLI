import { logError } from '../../cli/logging';
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
          description: 'NPM package name or URL/filename of an extension ZIP',
          mandatory: true,
        },
      ],
      options: [
        {
          name: 'type',
          description: 'Type of the extension',
          type: 'string',
          choices: ['cli', 'engine', 'portal', 'studio'],
        },
        {
          name: 'yes',
          alias: 'y',
          description: 'Overwrite existing extensions',
          type: 'boolean',
          default: false,
        },
        {
          name: 'extensions-dir',
          description: 'Overwrite default extensions dir. Cannot be used with insiders, stable or dev',
          type: 'string',
        },
        {
          name: 'insiders',
          description: 'Install extension for studio-insiders. Cannot be used with extensions-dir',
          type: 'boolean',
          default: false,
        },
        {
          name: 'stable',
          description: 'Install extension for studio. Cannot be used with extension-dir',
          type: 'boolean',
          default: false,
        },
        {
          name: 'dev',
          description: 'Install extension for studio-dev. Cannot be used with extensions-dir',
          type: 'boolean',
          default: false,
        },
      ],
    },
    runCommand,
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  const { dev, stable, insiders, extensionsDir } = inputs.argv;

  if (extensionsDir && (insiders || stable || dev)) {
    logError("The option '--extensions-dir' cannot be used with '--insiders', '--stable' or '--dev'");
    process.exit(1);
  }

  await installExtension(
    inputs.argv.urlOrFilename,
    inputs.argv.type,
    inputs.argv.yes,
    extensionsDir,
    insiders,
    stable,
    dev,
    inputs.argv.output,
  );
}
