import { CLI, Inputs } from '../../cli';
import { generateRootAccessToken } from './generateRootAccessToken';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'generate-root-access-token',
      alias: 'token',
      description: 'Generate a random root access token',
      descriptionLong: "Generates a random root access token for the engine's config.",
      options: [
        {
          name: 'size',
          alias: 's',
          description: 'Generate a secret token of the given size in bytes',
          type: 'number',
          default: 128,
        },
        {
          name: 'raw',
          alias: 'r',
          description: 'Print the secret token without usage instructions',
          type: 'boolean',
        },
      ],
    },
    async (inputs: Inputs): Promise<void> => {
      generateRootAccessToken(inputs.argv.size, inputs.argv.raw, inputs.argv.output);
    },
  );
}
