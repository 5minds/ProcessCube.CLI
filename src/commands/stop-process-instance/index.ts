import { CLI, Inputs } from '../../cli';
import { LegacyStdinPipeReader } from '../../cli/LegacyStdinPipeReader';
import { stopProcessInstance } from './stop-process-instance';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'stop-process-instance',
      alias: 'stop',
      description: 'Stop the process instances with the given process instance IDs',
      descriptionLong: 'Stops the process instances with the given process instance IDs on the connected engine.',
      examples: require('./examples.md'),
      arguments: [
        {
          name: 'processInstanceIds',
          description: 'IDs of process instances to stop',
          type: 'array',
        },
      ],
    },
    runCommand,
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  const stdinPipeReader = await LegacyStdinPipeReader.create(inputs.stdin);
  let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || inputs.argv.processInstanceIds;

  await stopProcessInstance(processInstanceIds, inputs.argv.output);
}
