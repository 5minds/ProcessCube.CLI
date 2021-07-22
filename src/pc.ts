#!/usr/bin/env node

import 'reflect-metadata';

import { CommandLineInterface } from './cli';
import { loadExtensions } from './loadExtensions';
import { loadPackagedExtensions } from './loadPackagedExtensions';
import { logError } from './cli/logging';
import { useYargsForCommandLineInterface } from './yargs';

export const OUTPUT_FORMAT_JSON = 'json';
export const OUTPUT_FORMAT_TEXT = 'text';

const defaultFormat = Boolean(process.stdout.isTTY) ? OUTPUT_FORMAT_TEXT : OUTPUT_FORMAT_JSON;

async function createCommandLineInterface(): Promise<CommandLineInterface> {
  const cli = new CommandLineInterface();

  cli.registerGeneralOptions([
    {
      name: 'help',
      alias: 'h',
      description: 'Show help',
      type: 'boolean',
      default: false
    },
    {
      name: 'output',
      alias: 'o',
      description: 'Set output',
      type: 'string',
      default: defaultFormat,
      choices: [OUTPUT_FORMAT_TEXT, OUTPUT_FORMAT_JSON]
    }
  ]);

  await loadPackagedExtensions(cli);

  await loadExtensions(cli);

  cli.postInitialize();

  return cli;
}

process.on('unhandledRejection', (err) => {
  logError(err.toString());
  process.exit(2);
});

(async () => {
  const cli = await createCommandLineInterface();

  useYargsForCommandLineInterface(cli);
})();
