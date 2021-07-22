import { join, resolve } from 'path';
import * as os from 'os';

const ATLAS_HOME_DIRNAME = '.atlas';
const ATLAS_CLI_SUBDIRNAME = 'cli';

const ATLAS_CLI_EXTENSIONS_SUBDIRNAME = 'extensions';

// TODO: default will be renamed to the session name once we know how to do multi-session things with IdentityServer
export const SESSION_STORAGE_FILENAME = 'default.json';

export function getCliHomeDir(): string {
  return join(os.homedir(), ATLAS_HOME_DIRNAME, ATLAS_CLI_SUBDIRNAME);
}

/**
 * Returns the local filename used to store the session.
 */
export function getSessionStorageFilename(): string {
  return join(getCliHomeDir(), SESSION_STORAGE_FILENAME);
}

/**
 * Returns the local directory that contains extensions for the cli.
 */
export function getExtensionsDir(givenCharonExtensionsDir?: string): string {
  if (givenCharonExtensionsDir == null) {
    return join(getCliHomeDir(), ATLAS_CLI_EXTENSIONS_SUBDIRNAME);
  }

  return resolve(givenCharonExtensionsDir);
}
