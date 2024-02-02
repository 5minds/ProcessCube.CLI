import { readFileSync } from 'fs';
import * as JSON5 from 'json5';

import { CLI, Inputs } from '../../contracts/cli_types';
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
          type: 'string',
        },
        {
          name: 'startEventId',
          description: 'ID of start event to trigger',
          type: 'string',
        },
      ],
      options: [
        {
          name: 'wait',
          description: 'Wait for the started process instance to finish execution and report the result',
          type: 'boolean',
        },
        {
          name: 'correlation-id',
          description: 'Set a predefined correlation id for the process instance',
          type: 'string',
        },
        {
          name: 'input-values',
          description: 'Set input values for the process instance from a <json> string',
          type: 'string',
          deprecated: true,
        },
        {
          name: 'input-values-from-stdin',
          description: 'Read input values as JSON from STDIN',
          type: 'boolean',
          deprecated: true,
        },
        {
          name: 'input-values-from-file',
          description: 'Read input values as JSON from <file>',
          type: 'string',
          deprecated: true,
        },
        {
          name: 'start-token',
          description: 'Set start token for the process instance from a <json> string',
          type: 'string',
        },
        {
          name: 'start-token-from-stdin',
          description: 'Read start token as JSON from STDIN',
          type: 'boolean',
        },
        {
          name: 'start-token-from-file',
          description: 'Read start token as JSON from <file>',
          type: 'string',
        },
      ],
    },
    runCommand,
  );
}

async function runCommand(inputs: Inputs): Promise<void> {
  const stdinPipeReader = await LegacyStdinPipeReader.create(inputs.stdin);
  const pipedProcessModelIds =
    stdinPipeReader.getPipedProcessModelIds() || stdinPipeReader.getPipedProcessModelIdsInDeployedFiles();

  let startToken: any;

  if (inputs.argv.inputValuesFromStdin === true) {
    startToken = await inputs.stdin.getJson();
  }
  if (inputs.argv.inputValuesFromFile != null) {
    const contents = readFileSync(inputs.argv.inputValuesFromFile);
    startToken = JSON5.parse(contents.toString());
  }
  if (inputs.argv.inputValues != null) {
    startToken = JSON5.parse(inputs.argv.inputValues);
  }

  if (inputs.argv.startTokenFromStdin === true) {
    startToken = await inputs.stdin.getJson();
  }
  if (inputs.argv.startTokenFromFile != null) {
    const contents = readFileSync(inputs.argv.startTokenFromFile);
    startToken = JSON5.parse(contents.toString());
  }
  if (inputs.argv.startToken != null) {
    startToken = JSON5.parse(inputs.argv.startToken);
  }

  await startProcessInstance(
    pipedProcessModelIds,
    inputs.argv.processModelId,
    inputs.argv.startEventId,
    inputs.argv.correlationId,
    startToken,
    inputs.argv.wait,
    inputs.argv.output,
  );
}
