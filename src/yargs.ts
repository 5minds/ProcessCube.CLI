import { Command, Inputs } from './contracts/cli_types';
import { CommandLineInterface } from './cli';
import { formatHelpText, heading, usageString } from './cli/logging';
import epilogSnippetAtlas from './snippets/atlas.epilog.md';

const SCRIPT_NAME = 'pc';
const VERSION = require('../package.json').version;

export async function useYargsForCommandLineInterface(cli: CommandLineInterface): Promise<void> {
  const program = require('yargs');

  program
    .version(VERSION)
    .scriptName(SCRIPT_NAME)
    .showHelpOnFail(true)
    .demandCommand(1, '')
    .usage(
      heading('USAGE') +
        '\n  $0 <command> [options]\n\n' +
        heading('SYNOPSIS') +
        '\n  ProcessCube CLI provides a rich interface to deploy and start process models as well as manage and inspect process instances and correlations for 5Minds Engine.',
    )
    .epilog(formatHelpText(epilogSnippetAtlas))
    .locale('en')
    .updateStrings({
      'Commands:': heading('COMMANDS'),
      'Positionals:': heading('ARGUMENTS'),
      'Options:': heading('GENERAL OPTIONS'),
    })
    .wrap(null)
    .strict()
    .recommendCommands();

  cli.forEachCommand((command) => registerCommandInYargs(cli, command, program));

  program.argv;
}

export function registerCommandInYargs(cli: CommandLineInterface, command: Command, program) {
  const aliases = command.alias ? [command.alias] : [];
  const argumentsAndOptionsInYargsFormat = command.arguments
    .map((arg) => {
      const suffix = arg.type === 'array' ? '...' : '';

      return arg.mandatory ? `<${arg.name}${suffix}>` : `[${arg.name}${suffix}]`;
    })
    .join(' ');

  program.command(
    [`${command.name} ${argumentsAndOptionsInYargsFormat}`.trim(), ...aliases],
    command.description,
    (yargs) => {
      yargs.usage(usageString(command.usage, command.descriptionLong));

      command.arguments.forEach((arg) => {
        const defaultArgDefault = arg.type === 'array' ? [] : undefined;

        yargs.positional(arg.name, {
          description: arg.description,
          type: arg.type,
          default: arg.default ?? defaultArgDefault,
        });
      });

      command.options.forEach((option) => {
        yargs.option(option.name, {
          alias: option.alias,
          description: option.description,
          type: option.type,
          default: option.default,
          choices: option.choices,
          hidden: option.deprecated === true,
        });
      });

      if (command.optionGroups) {
        command.optionGroups.forEach((optionGroup) => {
          yargs.group(optionGroup.options, heading(optionGroup.heading));
        });
      }

      if (command.examples) {
        yargs.epilog(formatHelpText(command.examples));
      }

      return yargs;
    },
    async (argv: any) => {
      const inputs = await convertYargsArgvToInputs(command, argv, cli);

      cli.executeCommand(command.name, inputs);
    },
  );
}

function convertYargsArgvToInputs(command: Command, argv: any, cli: CommandLineInterface): Inputs {
  return {
    argv: getParsedFromYargsArgv(command, argv),
    stdin: cli.stdin,
  };
}

function getParsedFromYargsArgv(command: Command, argv: any): { [name: string]: any } {
  const parsed: { [name: string]: any } = {};

  command.arguments.forEach((arg) => {
    var camelCased = dasherizedToCamelCased(arg.name);

    parsed[camelCased] = argv[arg.name];
  });

  command.options.forEach((option) => {
    var camelCased = dasherizedToCamelCased(option.name);

    parsed[camelCased] = argv[option.name];
  });

  return parsed;
}

function dasherizedToCamelCased(name: string): string {
  return name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
