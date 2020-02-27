import chalk from 'chalk';
import fetch from 'node-fetch';

import {
  AtlasSession,
  saveAtlasSession,
  loadAtlasSession,
  ANONYMOUS_IDENTITY_SERVER_URL
} from '../../session/atlas_session';

import { startServerToLoginAndWaitForAccessTokenFromIdentityServer } from './express_server';

const ONE_YEAR_IN_MILLISECONDS = 365 * 86400 * 1000;
const ANONYMOUS_TOKEN_LIFETIME_IN_MILLISECONDS = 99 * ONE_YEAR_IN_MILLISECONDS;

export async function login(givenEngineUrl: string, useAnonymousLogin: boolean, format: string): Promise<void> {
  let engineUrl = givenEngineUrl;

  if (engineUrl == null || engineUrl.trim() == '') {
    const oldSession = loadAtlasSession();
    if (oldSession == null) {
      console.log(chalk.red('No session found. Aborting.'));
      return;
    }

    engineUrl = oldSession.engineUrl;
    console.warn(chalk.yellowBright(`Using engine url from previous session: ${engineUrl}`));
  }

  let newSession: AtlasSession;
  if (useAnonymousLogin) {
    newSession = await loginViaAnonymousAccess(engineUrl);
  } else {
    newSession = await loginViaIdentityServer(engineUrl);
  }
  saveAtlasSession(newSession);

  console.log('');
  console.log(chalk.green('You are now logged in.'));

  // we're making a hard exit here so we do not wait for the express server to shut down
  process.exit(0);
}

async function loginViaAnonymousAccess(engineUrl: string): Promise<AtlasSession> {
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

async function loginViaIdentityServer(engineUrl: string): Promise<AtlasSession> {
  const identityServerUrl = await getIdentityServerUrlForEngine(engineUrl);

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
    // const versionResponse = await fetch(`${engineUrl}/process_engine`);
    // const versionJson = await versionResponse.json();
    // const version = versionJson.version;
    const authorityResponse = await fetch(`${engineUrl}/process_engine/security/authority`);
    const authorityJson = await authorityResponse.json();
    const authority = authorityJson.authority;

    result = authority;
  } catch (error) {
    console.error(error);
  }

  return result;
}
