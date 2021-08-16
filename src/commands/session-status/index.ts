import { CLI, Inputs } from '../../cli';
import { printSessionStatus } from './session-status';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'session-status',
      alias: 'st',
      description: 'Show status of the current session',
      descriptionLong: 'Shows status of the current session.',
      examples: require('./examples.md')
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  printSessionStatus(inputs.argv.output);
}
