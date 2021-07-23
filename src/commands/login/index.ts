import { CLI, Inputs } from '../../cli';
import { login } from './login';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'login',
      description: 'Log in to the given engine',
      descriptionLong: 'Starts or renews a session with the given engine.',
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
        },
        {
          name: 'root-access-token',
          description: 'Use root access token for login',
          type: 'string'
        }
      ]
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  await login(inputs.argv.engineUrl, inputs.argv.root, inputs.argv.rootAccessToken, inputs.argv.output);
}
