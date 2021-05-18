import { CLI, Inputs } from '../../cli';
import { LegacyStdinPipeReader } from '../../cli/LegacyStdinPipeReader';
import { showProcessInstance } from './show-process-instance';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'show-process-instance',
      alias: 'show',
      description: 'Show detailed information about individual process instances or correlations',
      synopsis:
        'Shows detailed information about individual process instances or correlations from the connected engine.',
      examples: require('./examples.md'),
      arguments: [
        {
          name: 'processInstanceIds',
          description: 'IDs of process instances to show; if omitted, the latest process instance is shown',
          type: 'array'
        }
      ],
      options: [
        {
          name: 'correlation',
          alias: 'c',
          description: 'All given <processInstanceIds> are interpreted as correlation ids',
          type: 'boolean',
          default: false
        },
        {
          name: 'all-fields',
          alias: 'F',
          description: 'Show all fields',
          type: 'boolean',
          default: false
        }
      ]
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  const stdinPipeReader = await LegacyStdinPipeReader.create(inputs.stdin);
  let processInstanceIds = stdinPipeReader.getPipedProcessInstanceIds() || inputs.argv.processInstanceIds;

  await showProcessInstance(processInstanceIds, inputs.argv.correlation, inputs.argv.allFields, inputs.argv.output);
}
