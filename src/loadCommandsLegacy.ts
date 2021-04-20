import { StdinPipeReader } from './cli/piped_data';
import { stopProcessInstance } from './commands/stop-process-instance/stop-process-instance';
import { formatHelpText, heading, usageString } from './cli/logging';

import epilogSnippetStopProcessInstance from './snippets/stop-process-instance.epilog.md';

export function DEPRECATED_initializePackagedCommandsViaYargs(program) {
  program;
}
