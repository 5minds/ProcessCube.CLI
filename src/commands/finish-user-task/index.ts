import { readFileSync } from 'fs';

import * as JSON5 from 'json5';

import { CLI, Inputs } from '../../cli';
import { logWarning } from '../../cli/logging';
import { StdinPipeReader } from '../../cli/piped_data';
import { finishUserTask } from './finish-user-task';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'finish-user-task',
      alias: 'finish',
      description: 'Finish a suspended instance of a User Task',
      synopsis: 'Finishes a suspended instance of a User Task.',
      examples: require('./examples.md'),
      arguments: [
        {
          name: 'flowNodeInstanceId',
          description: 'ID of user task to finish'
        }
      ],
      options: [
        {
          name: 'result',
          description: 'Set result values for the finished user task from <json> string',
          type: 'string'
        },
        {
          name: 'result-from-file',
          description: 'Read result values as JSON from <file>',
          type: 'string'
        }
      ],
      optionGroups: []
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  const stdinPipeReader = await StdinPipeReader.create();
  const flowNodeInstanceId = stdinPipeReader.getPipedFlowNodeInstanceIds()?.[0] || inputs.arguments.flowNodeInstanceId;

  if (stdinPipeReader.getPipedFlowNodeInstanceIds()?.length > 1) {
    logWarning('Only using first piped flowNodeInstanceId from stdin to finish user task.');
  }

  let resultValues: any;

  if (inputs.options.resultFromFile != null) {
    const contents = readFileSync(inputs.options.resultFromFile);
    resultValues = JSON5.parse(contents.toString());
  }
  if (inputs.options.result != null) {
    resultValues = JSON5.parse(inputs.options.result);
  }

  await finishUserTask(flowNodeInstanceId, resultValues, inputs.options.output);
}
