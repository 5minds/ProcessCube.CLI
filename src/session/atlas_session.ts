const moment = require('moment');

import { dirname } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

import { getSessionStorageFilename } from './atlas_path_functions';

export type AtlasSession = {
  type: 'session';
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

export function loadAtlasSession(): AtlasSession | null {
  const filename = getSessionStorageFilename();

  if (!existsSync(filename)) {
    return null;
  }
  const contents = readFileSync(filename, 'utf-8');

  if (contents.trim() === '') {
    return null;
  }

  try {
    const rawSession = JSON.parse(contents);

    return { ...rawSession, expiresIn: getExpiresIn(rawSession) };
  } catch (e) {
    console.error(`Error while loading ${filename}`, e);
    return null;
  }
}

export function saveAtlasSession(session: AtlasSession): void {
  const dump = JSON.parse(JSON.stringify(session));
  delete dump.expiresIn;

  const filename = getSessionStorageFilename();

  if (!existsSync(filename)) {
    mkdirSync(dirname(filename), { recursive: true });
  }
  writeFileSync(filename, JSON.stringify(session, null, 2), 'utf-8');
}

export function removeAtlasSession(): void {
  const filename = getSessionStorageFilename();

  if (!existsSync(filename)) {
    mkdirSync(dirname(filename), { recursive: true });
  }
  writeFileSync(filename, '', 'utf-8');
}

export function getExpiresIn(session: AtlasSession): ExpireInfo {
  if (session?.expiresAt == null) {
    throw new Error('Should not be null: session?.expiresAt');
  }

  const distanceInMilliseconds = session.expiresAt - Date.now();
  const seconds = Math.floor(distanceInMilliseconds / 1000);

  return {
    seconds: seconds,
    inWords: moment(session.expiresAt).fromNow()
  };
}
