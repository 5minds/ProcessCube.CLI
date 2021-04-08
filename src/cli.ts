export type Command = {
  name: string;
  alias?: string;
  description?: string;
  usage?: string;
  synopsis?: string;
  examples?: string;

  arguments?: CommandArgument[];
  options?: CommandOption[];
  optionGroups?: CommandOptionGroup[];
};

type CommandArgument = {
  name: string;
  type?: string;
  description?: string;
  mandatory?: boolean;
  default?: any;
};

type CommandOption = {
  name: string;
  alias?: string;
  type?: string;
  description?: string;
  default?: any;
  choices?: any[];
};

type CommandOptionGroup = {
  heading: string;
  options: string[];
};

type CommandWithCallbacks = Command & {
  executeCallbackFn: Function;
  validationCallbackFn: Function;
};

// eslint-disable-next-line
export interface CLI {
  executeCommand(commandName: string, argv): void;
  registerCommand(commandOptions: Command, executeCallbackFn: Function, validationCallbackFn?: Function): void;
}

export class CommandLineInterface implements CLI {
  private commands: { [name: string]: CommandWithCallbacks } = {};

  executeCommand(commandName: string, inputs): void {
    const command = this.commands[commandName];
    if (command == null) {
      throw new Error(`Command not found: ${commandName}`);
    }

    command.executeCallbackFn(inputs, this);
  }

  registerCommand(commandOptions: Command, executeCallbackFn: Function, validationCallbackFn?: Function): void {
    const options = commandOptions.options ?? [];
    const args = commandOptions.arguments ?? [];
    const usage =
      commandOptions.usage ?? (commandOptions.name + ' ' + args.map((arg) => `[${arg.name}]`).join(' ')).trim();

    const command = {
      name: commandOptions.name,
      alias: commandOptions.alias,
      description: commandOptions.description,
      usage: usage,
      synopsis: commandOptions.synopsis,
      arguments: args,
      options,
      executeCallbackFn,
      validationCallbackFn
    };

    this.commands[command.name] = command;
  }

  forEachCommand(callbackFn: (command: Command) => void): void {
    for (const command of Object.values(this.commands)) {
      callbackFn(command);
    }
  }
}
