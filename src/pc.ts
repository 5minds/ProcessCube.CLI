#!/usr/bin/env node

import 'reflect-metadata';

import program = require('yargs');

import { formatHelpText, heading } from './cli/logging';

import epilogSnippetAtlas from './snippets/atlas.epilog.md';

import { CommandLineInterface } from './cli';
import { registerCommandInYargs } from './registerCommandInYargs';

import { DEPRECATED_initializePackagedCommandsViaYargs } from './loadCommandsLegacy';
import { loadPackagedExtensions } from './loadPackagedExtensions';
import { loadExtensions } from './loadExtensions';

export const OUTPUT_FORMAT_JSON = 'json';
export const OUTPUT_FORMAT_TEXT = 'text';

const VERSION = require('../package.json').version;

const defaultFormat = Boolean(process.stdout.isTTY) ? OUTPUT_FORMAT_TEXT : OUTPUT_FORMAT_JSON;

export const usageString = (commandName: string, synopsis: string): string => {
  return heading('USAGE') + `\n  $0 ${commandName} [options]\n\n` + heading('SYNOPSIS') + `\n  ${synopsis}`;
};

program
  .version(VERSION)
  .scriptName('pc')
  .option('output', {
    alias: 'o',
    description: 'Set output',
    type: 'string',
    default: defaultFormat,
    choices: [OUTPUT_FORMAT_TEXT, OUTPUT_FORMAT_JSON]
  })
  .option('help', {
    alias: 'h',
    description: 'Show help',
    type: 'boolean',
    default: false
  })
  .showHelpOnFail(true)
  .demandCommand(1, '')
  .usage(
    heading('USAGE') +
      '\n  $0 <command> [options]\n\n' +
      heading('SYNOPSIS') +
      '\n  ProcessCube CLI provides a rich interface to deploy and start process models as well as manage and inspect process instances and correlations for 5Minds Engine.'
  )
  .epilog(formatHelpText(epilogSnippetAtlas))
  .locale('en')
  .updateStrings({
    'Commands:': heading('COMMANDS'),
    'Positionals:': heading('ARGUMENTS'),
    'Options:': heading('GENERAL OPTIONS')
  })
  .wrap(null)
  .strict()
  .recommendCommands();

(async () => {
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
      default: OUTPUT_FORMAT_TEXT,
      choices: [OUTPUT_FORMAT_TEXT, OUTPUT_FORMAT_JSON]
    }
  ]);

  DEPRECATED_initializePackagedCommandsViaYargs(program);

  await loadPackagedExtensions(cli);

  await loadExtensions(cli);

  cli.postInitialize();

  cli.forEachCommand((command) => registerCommandInYargs(cli, command, program));

  program.argv;
})();
