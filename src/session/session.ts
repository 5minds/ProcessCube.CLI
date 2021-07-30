const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

import { dirname } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

import * as JSON5 from 'json5';

import { getSessionStorageFilename } from './atlas_path_functions';

export type Session = {
  type: 'session' | 'implicit' | 'm2m' | 'root' | 'root-access-token' | string;
  engineUrl: string;
  identityServerUrl: string;
  accessToken: string;
  idToken: string;
  expiresAt: number;
  expiresIn?: ExpireInfo;
};

type ExpireInfo = {
  seconds: number;
  inWords: string;
};

export const ANONYMOUS_IDENTITY_SERVER_URL = '<anonymous>';
export const ROOT_ACCESS_TOKEN_IDENTITY_SERVER_URL = '<root_access_token>';

export function loadSession(returnInvalidSession: boolean = false): Session | null {
  const filename = getSessionStorageFilename();

  if (!existsSync(filename)) {
    return null;
  }
  const contents = readFileSync(filename, 'utf-8');

  if (contents.trim() === '') {
    return null;
  }

  try {
    const rawSession = JSON5.parse(contents);

    const session: Session = { ...rawSession, expiresIn: getExpiresIn(rawSession) };
    if (isValidSession(session) || returnInvalidSession) {
      return session;
    }
  } catch (e) {
    console.error(`Error while loading ${filename}`, e);
  }

  return null;
}

export function saveSession(session: Session): void {
  const dump = JSON5.parse(JSON.stringify(session));
  delete dump.expiresIn;

  const filename = getSessionStorageFilename();

  if (!existsSync(filename)) {
    mkdirSync(dirname(filename), { recursive: true });
  }
  writeFileSync(filename, JSON.stringify(session, null, 2), 'utf-8');
}

export function removeSession(): void {
  const filename = getSessionStorageFilename();

  if (!existsSync(filename)) {
    mkdirSync(dirname(filename), { recursive: true });
  }
  writeFileSync(filename, '', 'utf-8');
}

function getExpiresIn(session: Session): ExpireInfo {
  if (session?.expiresAt == null) {
    throw new Error('Should not be null: session?.expiresAt');
  }

  const distanceInMilliseconds = session.expiresAt - Date.now();
  const seconds = Math.floor(distanceInMilliseconds / 1000);

  return {
    seconds: seconds,
    inWords: dayjs(session.expiresAt).fromNow()
  };
}

function isValidSession(session: Session | null): boolean {
  return session?.expiresIn?.seconds > 0;
}
