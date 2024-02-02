import { join, resolve } from 'path';
import * as os from 'os';
import { existsSync } from 'fs';
import { logWarning } from '../cli/logging';

const PC_HOME_DIRNAME_LEGACY = '.atlas';
const PC_HOME_DIRNAME = '.processcube';
const PC_CLI_SUBDIRNAME = 'cli';

const PC_CLI_EXTENSIONS_SUBDIRNAME = 'extensions';

// TODO: default will be renamed to the session name once we know how to do multi-session things with IdentityServer
export const SESSION_STORAGE_FILENAME = 'default.json';

export function getCliHomeDir(): string {
  const homeDir = process.platform == 'win32' ? '%userprofile%' : '~';

  const legacyDir = join(os.homedir(), PC_HOME_DIRNAME_LEGACY, PC_CLI_SUBDIRNAME);
  const dir = join(os.homedir(), PC_HOME_DIRNAME, PC_CLI_SUBDIRNAME);

  const existsLegacyDir = existsSync(legacyDir);
  const existsDir = existsSync(dir);

  if (existsLegacyDir) {
    if (existsDir) {
      throw new Error(
        `Found both ${homeDir}/.processcube/cli and ${homeDir}/.atlas/cli as home directory.\n\nPlease rename/remove ${homeDir}/.atlas/cli in favor of ${homeDir}/.processcube/cli.`,
      );
    }

    logWarning(
      `Found a ${homeDir}/.atlas/cli home directory.\n\nPlease rename ${homeDir}/.atlas/cli to ${homeDir}/.processcube/cli.`,
    );

    return legacyDir;
  }

  return dir;
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
export function getExtensionsDir(givenCliExtensionDir?: string): string {
  if (givenCliExtensionDir == null) {
    return join(getCliHomeDir(), PC_CLI_EXTENSIONS_SUBDIRNAME);
  }

  return resolve(givenCliExtensionDir);
}
