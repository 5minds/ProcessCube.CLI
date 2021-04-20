import { CLI, Inputs } from '../../cli';
import { StdinPipeReader } from '../../cli/piped_data';
import { stopProcessInstance } from './stop-process-instance';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'stop-process-instance',
      alias: 'stop',
      description: 'Stop instances with the given process instance IDs',
      synopsis: 'Stops instances with the given process instance IDs on the connected engine.',
      examples: require('./examples.md'),
      arguments: [
        {
          name: 'processInstanceIds',
          description: 'IDs of process instances to stop',
          type: 'array'
        }
      ]
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  const stdinPipeReader = await StdinPipeReader.create();
  let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || inputs.arguments.processInstanceIds;

  await stopProcessInstance(processInstanceIds, inputs.options.output);
}
