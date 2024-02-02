import { CLI, Inputs } from '../../contracts/cli_types';
import { logout } from './logout';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'logout',
      description: 'Log out from the current session',
      descriptionLong: 'Logs out from the current session.',
      examples: require('./examples.md'),
    },
    runCommand,
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  await logout(inputs.argv.output);
}
