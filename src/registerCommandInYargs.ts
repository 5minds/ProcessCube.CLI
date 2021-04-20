import { CLI, Command } from './cli';
import { formatHelpText, heading, usageString } from './cli/logging';

export function initializeCLI(cli: CLI, program) {}

export function registerCommandInYargs(cli: CLI, command: Command, program) {
  const aliases = command.alias ? [command.alias] : [];

  program.command(
    [command.usage, ...aliases],
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
      let inputs = {
        arguments: {},
        options: {}
      };

      command.arguments.forEach((arg) => {
        var camelCased = arg.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

        inputs.arguments[camelCased] = argv[arg.name];
      });

      command.options.forEach((option) => {
        var camelCased = option.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

        inputs.options[camelCased] = argv[option.name];
      });

      cli.executeCommand(command.name, inputs);
    }
  );
}
