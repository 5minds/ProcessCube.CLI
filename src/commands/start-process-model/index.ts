import { readFileSync } from 'fs';
import * as JSON5 from 'json5';

import { CLI, Inputs } from '../../cli';
import { StdinPipeReader } from '../../cli/piped_data';
import { startProcessInstance } from './start-process-model';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'start-process-model',
      alias: 'start',
      description: 'Start an instance of a deployed process model',
      synopsis: 'Starts an instance of a deployed process model on the connected engine.',
      examples: require('./examples.md'),
      arguments: [
        {
          name: 'processModelId',
          description: 'ID of process model to start',
          type: 'string'
        },
        {
          name: 'startEventId',
          description: 'ID of start event to trigger',
          type: 'string'
        }
      ],
      options: [
        {
          name: 'wait',
          description: 'Wait for the started process instance to finish execution and report the result',
          type: 'boolean'
        },
        {
          name: 'correlation-id',
          description: 'Set a predefined correlation id for the process instance',
          type: 'string'
        },
        {
          name: 'input-values',
          description: 'Set input values for the process instance from <json> string',
          type: 'string'
        },
        {
          name: 'input-values-from-stdin',
          description: 'Read input values as JSON from STDIN',
          type: 'boolean'
        },
        {
          name: 'input-values-from-file',
          description: 'Read input values as JSON from <file>',
          type: 'string'
        }
      ]
    },
    runCommand
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  const stdinPipeReader = await StdinPipeReader.create();
  const pipedProcessModelIds =
    stdinPipeReader.getPipedProcessModelIds() || stdinPipeReader.getPipedProcessModelIdsInDeployedFiles();

  let inputValues: any;

  if (inputs.options.inputValuesFromStdin === true) {
    const stdinPipeReader = await StdinPipeReader.create();
    inputValues = stdinPipeReader.getPipedData();
  }
  if (inputs.options.inputValuesFromFile != null) {
    const contents = readFileSync(inputs.options.inputValuesFromFile);
    inputValues = JSON5.parse(contents.toString());
  }
  if (inputs.options.inputValues != null) {
    inputValues = JSON5.parse(inputs.options.inputValues);
  }

  await startProcessInstance(
    pipedProcessModelIds,
    inputs.arguments.processModelId,
    inputs.arguments.startEventId,
    inputs.options.correlationId,
    inputValues,
    inputs.options.wait,
    inputs.options.output
  );
}
