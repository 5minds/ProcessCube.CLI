import chalk from 'chalk';

import { removeAtlasSession, loadAtlasSession, ANONYMOUS_IDENTITY_SERVER_URL } from '../../session/atlas_session';

import { startServerToLogoutAndWaitForSessionEnd } from './express_server';

export async function logout(format: string): Promise<void> {
  const oldSession = loadAtlasSession();
  if (oldSession == null) {
    console.log(chalk.yellow('No session found.'));
    return;
  }

  removeAtlasSession();
  if (oldSession.identityServerUrl !== ANONYMOUS_IDENTITY_SERVER_URL) {
    await startServerToLogoutAndWaitForSessionEnd(oldSession.identityServerUrl, oldSession.idToken);
  }

  console.log(chalk.green('You are now logged out.'));
  process.exit(0);
}
