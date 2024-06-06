import { readFileSync } from 'fs';
import * as JSON5 from 'json5';

import { CLI, Inputs } from '../../cli';
import { LegacyStdinPipeReader } from '../../cli/LegacyStdinPipeReader';
import { logWarning } from '../../cli/logging';
import { finishUserTask } from './finish-user-task';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'finish-user-task',
      alias: 'finish',
      description: 'Finish a suspended instance of a User Task',
      descriptionLong: 'Finishes a suspended instance of a User Task.',
      examples: require('./examples.md'),
      arguments: [
        {
          name: 'flowNodeInstanceId',
          description: 'ID of the User Task instance to finish',
        },
      ],
      options: [
        {
          name: 'result',
          description: 'Set result values for the finished User Task from a <json> string',
          type: 'string',
        },
        {
          name: 'result-from-file',
          description: 'Read result values for the finished User Task as JSON from a <file>',
          type: 'string',
        },
      ],
      optionGroups: [],
    },
    runCommand,
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  const stdinPipeReader = await LegacyStdinPipeReader.create(inputs.stdin);
  const flowNodeInstanceId = stdinPipeReader.getPipedFlowNodeInstanceIds()?.[0] || inputs.argv.flowNodeInstanceId;

  if (stdinPipeReader.getPipedFlowNodeInstanceIds()?.length > 1) {
    logWarning('Only using first piped flowNodeInstanceId from stdin to finish user task.');
  }

  let resultValues: any;

  if (inputs.argv.resultFromFile != null) {
    const contents = readFileSync(inputs.argv.resultFromFile);
    resultValues = JSON5.parse(contents.toString());
  }
  if (inputs.argv.result != null) {
    resultValues = JSON5.parse(inputs.argv.result);
  }

  await finishUserTask(flowNodeInstanceId, resultValues, inputs.argv.output);
}
