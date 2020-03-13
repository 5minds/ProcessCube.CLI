import chalk from 'chalk';
import * as moment from 'moment';

import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { logWarning } from '../../cli/logging';

import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';

export async function printSessionStatus(outputFormat: string): Promise<void> {
  const session = loadAtlasSession(true);
  if (session == null) {
    switch (outputFormat) {
      case OUTPUT_FORMAT_JSON:
        console.log(JSON.stringify({}, null, 2));
        break;
      case OUTPUT_FORMAT_TEXT:
        logWarning('No session found.');
        break;
    }
    return;
  }

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      console.log(JSON.stringify(sanitizeSensibleInformation(session), null, 2));
      break;
    case OUTPUT_FORMAT_TEXT:
      log(session);
      break;
  }
}

function sanitizeSensibleInformation(session: AtlasSession): AtlasSession {
  return {
    ...session,
    accessToken: `${session.accessToken.substr(0, 7)}...`,
    idToken: `${session.idToken.substr(0, 7)}...`
  };
}

function log(session: AtlasSession): void {
  console.log('Status:   ', chalk.greenBright('logged in'));
  console.log('Engine:   ', chalk.cyan(session.engineUrl), chalk.dim(`(Authority: ${session.identityServerUrl})`));
  console.log(
    'Expires:  ',
    `${moment(session.expiresAt).format('YYYY-MM-DD hh:mm:ss')}`,
    chalk.dim(`(${session.expiresIn?.inWords})`)
  );
}
