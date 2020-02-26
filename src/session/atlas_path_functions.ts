import { join } from 'path';
import * as os from 'os';

const ATLAS_HOME_DIRNAME = '.atlas';
const ATLAS_CLI_SUBDIRNAME = 'cli';

// TODO: default will be renamed to the session name once we know how to do multi-session things with IdentityServer
export const SESSION_STORAGE_FILENAME = 'default.json';

export function getCharonHomeDir(): string {
  return join(os.homedir(), ATLAS_HOME_DIRNAME, ATLAS_CLI_SUBDIRNAME);
}

/**
 * Returns the local filename used to store the session.
 */
export function getSessionStorageFilename(): string {
  return join(getCharonHomeDir(), SESSION_STORAGE_FILENAME);
}
