import { AtlasEngineClient } from '@atlas-engine/atlas_engine_client';
import { IIdentity } from '@atlas-engine/iam.contracts';
import { AtlasSession, loadAtlasSession } from './session/atlas_session';
import { StdinPipeReader } from './StdinPipeReader';

export type Command = {
  name: string;
  alias?: string;
  description?: string;
  descriptionLong?: string;
  usage?: string;
  examples?: string;

  arguments?: CommandArgument[];
  options?: CommandOption[];
  optionGroups?: CommandOptionGroup[];
};

export type CommandArgument = {
  name: string;
  type?: string;
  description?: string;
  mandatory?: boolean;
  default?: any;
};

export type CommandOption = {
  name: string;
  alias?: string;
  type?: string;
  description?: string;
  default?: any;
  choices?: any[];
  deprecated?: boolean;
};

type CommandOptionGroup = {
  heading: string;
  options: string[];
};

type CommandWithCallbacks = Command & {
  executeCallbackFn: Function;
  validationCallbackFn: Function;
};

export type Stdin = {
  getJson(): Promise<any | null>;
  getText(): Promise<string | null>;
  isPipe(): boolean;
};

export type Inputs = {
  argv: { [name: string]: any };
  stdin: Stdin;
};

// eslint-disable-next-line
export interface CLI {
  executeCommand(commandName: string, inputs: Inputs): any;

  registerCommand(
    command: Command,
    executeCallbackFn: (inputs: Inputs) => Promise<void>,
    validationCallbackFn?: (inputs: Inputs) => Promise<boolean>
  ): void;

  getIdentityFromSession(): IIdentity | null;

  getEngineClient(givenEngineUrl?: string, identity?: IIdentity): AtlasEngineClient;
}

export class CommandLineInterface implements CLI {
  public stdin: StdinPipeReader;

  private commands: { [name: string]: CommandWithCallbacks } = {};
  private generalCommandOptions: CommandOption[] = [];

  constructor() {
    this.stdin = new StdinPipeReader();
  }

  executeCommand(commandName: string, inputs: Inputs): any {
    const command = this.commands[commandName];
    if (command == null) {
      throw new Error(`Command not found: ${commandName}`);
    }

    return command.executeCallbackFn(inputs, this);
  }

  registerCommand(
    commandOptions: Command,
    executeCallbackFn: (inputs: Inputs) => Promise<void>,
    validationCallbackFn?: (inputs: Inputs) => Promise<boolean>
  ): void {
    const options = commandOptions.options ?? [];
    const args = commandOptions.arguments ?? [];
    const usage =
      commandOptions.usage ??
      (
        commandOptions.name +
        ' ' +
        args
          .map((arg) => {
            const suffix = arg.type === 'array' ? '...' : '';

            return arg.mandatory ? `<${arg.name}${suffix}>` : `[${arg.name}${suffix}]`;
          })
          .join(' ') +
        (options.length > 0 ? ' [options]' : '')
      ).trim();

    const command = {
      name: commandOptions.name,
      alias: commandOptions.alias,
      description: commandOptions.description,
      descriptionLong: commandOptions.descriptionLong,
      usage: usage,
      examples: commandOptions.examples,
      arguments: args,
      options,
      optionGroups: commandOptions.optionGroups,
      executeCallbackFn,
      validationCallbackFn
    };

    this.commands[command.name] = command;
  }

  registerGeneralOptions(commandOptions: CommandOption[]): void {
    this.generalCommandOptions = commandOptions;
  }

  forEachCommand(callbackFn: (command: Command) => void): void {
    for (const command of Object.values(this.commands)) {
      callbackFn(command);
    }
  }

  postInitialize(): void {
    this.forEachCommand((command) => {
      command.options = [...command.options, ...this.generalCommandOptions];

      if (command.optionGroups != null) {
        const generalOptionNames = this.generalCommandOptions.map((option) => option.name);

        command.optionGroups = [...command.optionGroups, { heading: 'GENERAL OPTIONS', options: generalOptionNames }];
      }
    });
  }

  getIdentityFromSession(): IIdentity | null {
    const session = this.getSession();
    if (session == null) {
      return null;
    }

    return {
      userId: session.idToken,
      token: session.accessToken
    };
  }

  getEngineClient(givenEngineUrl?: string, identity?: IIdentity): AtlasEngineClient {
    let engineUrl = givenEngineUrl;
    if (engineUrl == null) {
      const session = this.getSession();

      engineUrl = session?.engineUrl;

      if (engineUrl == null) {
        throw new Error('Could not create EngineClient: No `engineUrl` given and no session found.');
      }
    }

    return new AtlasEngineClient(engineUrl, identity || this.getIdentityFromSession());
  }

  getSession(): AtlasSession | null {
    return loadAtlasSession();
  }
}
