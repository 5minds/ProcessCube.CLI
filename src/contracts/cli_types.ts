import { EngineClient, Identity } from '@5minds/processcube_engine_client';

import { Session as SessionFromInternalModule } from '../session/session';

export type Session = SessionFromInternalModule;

export interface CLI {
  executeCommand(commandName: string, inputs: Inputs): any;

  registerCommand(
    command: Command,
    executeCallbackFn: (inputs: Inputs) => Promise<void>,
    validationCallbackFn?: (inputs: Inputs) => Promise<boolean>,
  ): void;

  loadSession(): Session | null;
  saveSession(session: Session): void;
  removeSession(): void;

  getIdentityFromSession(): Identity | null;

  getEngineClient(givenEngineUrl?: string, identity?: Identity): EngineClient;
}

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

export type Stdin = {
  getJson(): Promise<any | null>;
  getText(): Promise<string | null>;
  isPipe(): boolean;
};

export type Inputs = {
  argv: { [name: string]: any };
  stdin: Stdin;
};
