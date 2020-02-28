import chalk from 'chalk';

import { removeAtlasSession, loadAtlasSession, ANONYMOUS_IDENTITY_SERVER_URL } from '../../session/atlas_session';

import { startServerToLogoutAndWaitForSessionEnd } from './express_server';
import { logError } from '../../cli/logging';

export async function logout(outputFormat: string): Promise<void> {
  const oldSession = loadAtlasSession();
  if (oldSession == null) {
    logError('No session found. Aborting.');
    return;
  }

  removeAtlasSession();
  if (oldSession.identityServerUrl === ANONYMOUS_IDENTITY_SERVER_URL) {
    console.log('');
    console.log(chalk.yellow('You were logged out from anonymous root login. No further steps required.'));
  } else {
    await startServerToLogoutAndWaitForSessionEnd(oldSession.identityServerUrl, oldSession.idToken);
    console.log('');
    console.log(chalk.green('You are now logged out.'));
  }

  // TODO: this is currently required to kill the express server. we should shut it down gracefully!
  process.exit(0);
}
