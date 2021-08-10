import chalk from 'chalk';

import { ANONYMOUS_IDENTITY_SERVER_URL, loadSession, removeSession } from '../../session/session';

import { startServerToLogoutAndWaitForSessionEnd } from './express_server';
import { logError } from '../../cli/logging';

export async function logout(outputFormat: string): Promise<void> {
  const oldSession = loadSession();
  if (oldSession == null) {
    logError('No session found. Aborting.');
    return;
  }

  removeSession();
  if (oldSession.identityServerUrl === ANONYMOUS_IDENTITY_SERVER_URL) {
    console.log('');
    console.log(chalk.yellow('You were logged out from anonymous root login. No further steps required.'));
  } else {
    const success = await startServerToLogoutAndWaitForSessionEnd(oldSession.identityServerUrl, oldSession.idToken);

    if (success === false) {
      logError(`Could not log out from ${oldSession.identityServerUrl}`);
      process.exit(1);
    }

    console.log('');
    console.log(chalk.green('You are now logged out.'));
  }

  // TODO: this is currently required to kill the express server. we should shut it down gracefully!
  process.exit(0);
}
