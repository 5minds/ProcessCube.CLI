import chalk from 'chalk';
import dayjs from 'dayjs';

import { logJsonResult, logWarning } from '../../cli/logging';
import { addJsonPipingHintToResultJson } from '../../cli/result_json';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';
import { Session, loadSession } from '../../session/session';

export async function printSessionStatus(outputFormat: string): Promise<void> {
  const session = loadSession(true);
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
      logJsonResult(addJsonPipingHintToResultJson(sanitizeSensibleInformation(session)));
      break;
    case OUTPUT_FORMAT_TEXT:
      log(session);
      break;
  }
}

function sanitizeSensibleInformation(session: Session): Session {
  return {
    ...session,
    accessToken: `${session.accessToken.substr(0, 7)}...`,
    idToken: session.idToken ? `${session.idToken.substr(0, 7)}...` : undefined,
  };
}

function log(session: Session): void {
  console.log('Status:   ', chalk.greenBright('logged in'));
  console.log('Engine:   ', chalk.cyan(session.engineUrl), chalk.dim(`(Authority: ${session.identityServerUrl})`));
  console.log(
    'Expires:  ',
    `${dayjs(session.expiresAt).format('YYYY-MM-DD hh:mm:ss')}`,
    chalk.dim(`(${session.expiresIn?.inWords})`),
  );
}
