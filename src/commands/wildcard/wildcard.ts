import commander = require('commander');

import { getClosestMatch } from '../../cli/string_match_functions';
import { logError } from '../../cli/logging';

export async function performWildcard(program: commander.Command, givenCommandName: string): Promise<void> {
  const commandNames = program.commands
    .map((command) => command._name)
    .filter((commandName: string) => commandName != '*');
  const suggestedCommandName = getClosestMatch(givenCommandName, commandNames);

  logError(`The task "${givenCommandName}" could not be found. Did you mean "${suggestedCommandName}"?`);
  process.exit(1);
}
