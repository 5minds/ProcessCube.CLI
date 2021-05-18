import { CLI, Inputs } from '../../cli';
import { LegacyStdinPipeReader } from '../../cli/LegacyStdinPipeReader';
import { retryProcessInstance } from './retry-process-instance';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'retry-process-instance',
      alias: 'retry',
      description: 'Restart failed process instances with the given process instance IDs',
      synopsis: 'Restarts failed process instances with the given process instance IDs on the connected engine.',
      examples: require('./examples.md'),
      arguments: [
        {
          name: 'processInstanceIds',
          description: 'IDs of process instances to restart',
          type: 'array'
        }
      ]
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  const stdinPipeReader = await LegacyStdinPipeReader.create(inputs.stdin);
  const processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || inputs.argv.processInstanceIds;

  if (processInstanceIds == null || processInstanceIds.length === 0) {
    // TODO: add validation errors
    return;
  }

  await retryProcessInstance(processInstanceIds, inputs.argv.output);
}
