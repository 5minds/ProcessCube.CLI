import { CLI, Command, CommandLineInterface, Inputs } from './cli';
import { formatHelpText, heading, usageString } from './cli/logging';
import epilogSnippetAtlas from './snippets/atlas.epilog.md';

const VERSION = require('../package.json').version;

export async function useYargsForCommandLineInterface(cli: CommandLineInterface): Promise<void> {
  const program = require('yargs');

  program
    .version(VERSION)
    .scriptName('pc')
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

  cli.forEachCommand((command) => registerCommandInYargs(cli, command, program));

  program.argv;
}

export function registerCommandInYargs(cli: CLI, command: Command, program) {
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
      yargs.usage(usageString(command.usage, command.synopsis));

      command.arguments.forEach((arg) => {
        const defaultArgDefault = arg.type === 'array' ? [] : undefined;

        yargs.positional(arg.name, {
          description: arg.description,
          type: arg.type,
          default: arg.default ?? defaultArgDefault
        });
      });

      command.options.forEach((option) => {
        yargs.option(option.name, {
          alias: option.alias,
          description: option.description,
          type: option.type,
          default: option.default,
          choices: option.choices
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
      const inputs = convertYargsArgvToInputs(command, argv);

      cli.executeCommand(command.name, inputs);
    }
  );
}

function convertYargsArgvToInputs(command: Command, argv: any): Inputs {
  let inputs: Inputs = {
    arguments: {},
    options: {}
  };

  command.arguments.forEach((arg) => {
    var camelCased = dasherizedToCamelCased(arg.name);

    inputs.arguments[camelCased] = argv[arg.name];
  });

  command.options.forEach((option) => {
    var camelCased = dasherizedToCamelCased(option.name);

    inputs.options[camelCased] = argv[option.name];
  });

  return inputs;
}

function dasherizedToCamelCased(name: string): string {
  return name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
