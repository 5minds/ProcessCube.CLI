import chalk from 'chalk';

import { loadAtlasSession } from '../../session/atlas_session';

export async function printSessionStatus(format: string): Promise<void> {
  const session = loadAtlasSession();

  if (session == null) {
    console.log(chalk.yellow('No session found.'));
    return;
  }

  console.dir(session, { depth: null });
}
