import { CLI, Inputs } from '../../cli';
import { logout } from './logout';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'logout',
      description: 'Log out from the current session',
      synopsis: 'Logs out from the current session.',
      examples: require('./examples.md')
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  await logout(inputs.options.output);
}
