import { CLI, Inputs } from '../../cli';
import { login } from './login';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'login',
      description: 'Log in to the given engine',
      synopsis: 'Starts or renews a session with the given engine.',
      examples: require('./examples.md'),
      arguments: [
        {
          name: 'engineUrl',
          description: 'URL of engine to connect to',
          mandatory: true
        }
      ],
      options: [
        {
          name: 'root',
          description: 'Try to use anonymous root login',
          type: 'boolean'
        }
      ]
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  await login(inputs.argv.engineUrl, inputs.argv.root, inputs.argv.output);
}
