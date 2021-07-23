import chalk from 'chalk';
import fetch, { FetchError } from 'node-fetch';

import {
  ANONYMOUS_IDENTITY_SERVER_URL,
  AtlasSession,
  ROOT_ACCESS_TOKEN_IDENTITY_SERVER_URL,
  loadAtlasSession,
  saveAtlasSession
} from '../../session/atlas_session';

import { isUrlAvailable } from '../../client/is_url_available';
import { logError, logWarning } from '../../cli/logging';
import { startServerToLoginAndWaitForAccessTokenFromIdentityServer } from './express_server';

const ONE_YEAR_IN_MILLISECONDS = 365 * 86400 * 1000;
const ANONYMOUS_TOKEN_LIFETIME_IN_MILLISECONDS = 99 * ONE_YEAR_IN_MILLISECONDS;
const DEFAULT_IDENTITY_SERVER_URL = 'http://localhost:5000/';

export async function login(
  givenEngineUrl: string,
  tryAnonymousRootLogin: boolean,
  useRootAccessToken: string | null,
  outputFormat: string
): Promise<void> {
  let engineUrl = givenEngineUrl;

  if (engineUrl == null || engineUrl.trim() == '') {
    const oldSession = loadAtlasSession(true);
    if (oldSession == null) {
      logError('No session found. Aborting.');
      return;
    }

    engineUrl = oldSession.engineUrl;
    logWarning(chalk.yellowBright(`Using engine url from previous session: ${engineUrl}`));
  }

  engineUrl = engineUrl.replace(/\/$/, '');

  const engineUrlIsJustPort = engineUrl.match(/^:\d+$/) != null;
  if (engineUrlIsJustPort) {
    engineUrl = `localhost${engineUrl}`;
    logWarning(chalk.yellowBright(`No host specified, using host: ${engineUrl}`));
  }

  const engineUrlIsMissingSchemeSeparator = engineUrl.match(/:\/\//) == null;

  if (engineUrlIsMissingSchemeSeparator) {
    const engineUrlIsAvailableViaHttps = await isUrlAvailable(`https://${engineUrl}`);

    if (engineUrlIsAvailableViaHttps) {
      engineUrl = `https://${engineUrl}`;
      logWarning(chalk.yellowBright(`No protocol specified, using HTTPS url: ${engineUrl}`));
    } else {
      const engineUrlIsAvailableViaHttp = await isUrlAvailable(`http://${engineUrl}`);

      if (engineUrlIsAvailableViaHttp) {
        engineUrl = `http://${engineUrl}`;
        logWarning(chalk.yellowBright(`No protocol specified, using HTTP url: ${engineUrl}`));
      }
    }
  }

  const engineUrlIsAvailable = await isUrlAvailable(engineUrl);
  if (engineUrlIsAvailable === false) {
    logError(`Could not connect to engine: ${engineUrl}`);
    process.exit(1);
  }

  let newSession: AtlasSession;
  if (tryAnonymousRootLogin) {
    newSession = await loginViaAnonymousRootAccess(engineUrl);

    console.log('');
    console.log(chalk.yellow('Anonymous root login successful. No further steps required.'));
  } else if (useRootAccessToken != null) {
    newSession = await loginViaRootAccessToken(engineUrl, useRootAccessToken);

    console.log('');
    console.log(chalk.yellow('Login via root access token successful. No further steps required.'));
  } else {
    newSession = await loginViaIdentityServer(engineUrl);

    if (newSession == null) {
      logError(`Could not connect to engine: ${engineUrl}`);
      process.exit(1);
    }
  }
  saveAtlasSession(newSession);

  console.log('');
  console.log(chalk.green('You are now logged in.'));

  // TODO: this is currently required to kill the express server. we should shut it down gracefully!
  process.exit(0);
}

async function loginViaAnonymousRootAccess(engineUrl: string): Promise<AtlasSession> {
  const newSession: AtlasSession = {
    type: 'session',
    engineUrl: engineUrl,
    identityServerUrl: ANONYMOUS_IDENTITY_SERVER_URL,
    idToken: '',
    accessToken: 'ZHVtbXlfdG9rZW4=',
    expiresAt: Date.now() + ANONYMOUS_TOKEN_LIFETIME_IN_MILLISECONDS
  };

  return newSession;
}

async function loginViaRootAccessToken(engineUrl: string, token: string): Promise<AtlasSession> {
  const newSession: AtlasSession = {
    type: 'session',
    engineUrl: engineUrl,
    identityServerUrl: ROOT_ACCESS_TOKEN_IDENTITY_SERVER_URL,
    idToken: '',
    accessToken: token,
    expiresAt: Date.now() + ANONYMOUS_TOKEN_LIFETIME_IN_MILLISECONDS
  };

  return newSession;
}

async function loginViaIdentityServer(engineUrl: string): Promise<AtlasSession | null> {
  const identityServerUrl = await getIdentityServerUrlForEngine(engineUrl);
  if (identityServerUrl == null) {
    return null;
  }

  const identityServerIsAvailable = await isUrlAvailable(identityServerUrl);
  if (identityServerIsAvailable === false) {
    logError(`The engine returned this unreachable authority URL: ${identityServerUrl}`);
    console.warn('');
    if (identityServerUrl === DEFAULT_IDENTITY_SERVER_URL) {
      console.warn(
        chalk.redBright.bold(`If you're in a development setting, your engine might also allow anonymous root access:`)
      );
      console.warn('');
      console.warn(chalk.redBright.bold(`  $ pc login ${engineUrl} --root`));
      console.warn('');
      console.warn(
        chalk.redBright.bold(`If you're in a production setting, you should avoid enabling anonymous root access.`)
      );
    } else {
      console.warn(chalk.redBright.bold(`To be able to login, please ensure the authority is reachable.`));
    }

    process.exit(1);
  }

  const { accessToken, idToken, expiresAt } = await startServerToLoginAndWaitForAccessTokenFromIdentityServer(
    identityServerUrl
  );

  const newSession: AtlasSession = {
    type: 'session',
    engineUrl,
    identityServerUrl,
    accessToken,
    idToken,
    expiresAt
  };

  return newSession;
}

async function getIdentityServerUrlForEngine(engineUrl: string): Promise<string> {
  let result = null;

  try {
    const authorityResponse = await fetch(`${engineUrl}/process_engine/security/authority`);
    const authorityJson = await authorityResponse.json();
    const authority = authorityJson.authority;

    result = authority;
  } catch (error) {
    switch (error.constructor) {
      case FetchError:
        return null;
      default:
        console.error(error);
    }
  }

  return result;
}
