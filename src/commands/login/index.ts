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
        },
        {
          name: 'm2m-client-id',
          description: 'Use this client id for Machine to Machine (M2M) authorization',
          type: 'string'
        },
        {
          name: 'm2m-client-secret',
          description: 'Use this client secret for Machine to Machine (M2M) authorization',
          type: 'string'
        },
        {
          name: 'm2m-scope',
          description: 'Request this scope for Machine to Machine (M2M) authorization',
          type: 'string'
        },
        {
          name: 'client-id',
          description: 'Use this client id for Web flow authorization',
          type: 'string'
        },
        {
          name: 'response-type',
          description: 'Use this response type for Web flow authorization',
          type: 'string'
        },
        {
          name: 'scope',
          description: 'Request this scope for Web flow authorization',
          type: 'string'
        }
      ]
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  await login(
    inputs.argv.engineUrl,
    inputs.argv.m2mClientId,
    inputs.argv.m2mClientSecret,
    inputs.argv.m2mScope,
    inputs.argv.clientId,
    inputs.argv.responseType?.split(',')?.join(' '),
    inputs.argv.scope?.split(',')?.join(' '),
    inputs.argv.root,
    inputs.argv.rootAccessToken,
    inputs.argv.output
  );
}
