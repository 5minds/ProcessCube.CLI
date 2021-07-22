import { readFileSync } from 'fs';
import * as JSON5 from 'json5';

import { CLI, Inputs } from '../../cli';
import { LegacyStdinPipeReader } from '../../cli/LegacyStdinPipeReader';
import { startProcessInstance } from './start-process-model';

export async function onLoad(cli: CLI): Promise<void> {
  cli.registerCommand(
    {
      name: 'start-process-model',
      alias: 'start',
      description: 'Start an instance of a deployed process model',
      descriptionLong: 'Starts an instance of a deployed process model on the connected engine.',
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
          description: 'Set input values for the process instance from a <json> string',
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
  const stdinPipeReader = await LegacyStdinPipeReader.create(inputs.stdin);
  const pipedProcessModelIds =
    stdinPipeReader.getPipedProcessModelIds() || stdinPipeReader.getPipedProcessModelIdsInDeployedFiles();

  let inputValues: any;

  if (inputs.argv.inputValuesFromStdin === true) {
    inputValues = await inputs.stdin.getJson();
  }
  if (inputs.argv.inputValuesFromFile != null) {
    const contents = readFileSync(inputs.argv.inputValuesFromFile);
    inputValues = JSON5.parse(contents.toString());
  }
  if (inputs.argv.inputValues != null) {
    inputValues = JSON5.parse(inputs.argv.inputValues);
  }

  await startProcessInstance(
    pipedProcessModelIds,
    inputs.argv.processModelId,
    inputs.argv.startEventId,
    inputs.argv.correlationId,
    inputValues,
    inputs.argv.wait,
    inputs.argv.output
  );
}
