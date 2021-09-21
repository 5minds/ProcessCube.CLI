import http from 'http';
import https from 'https';
import os from 'os';
import tar from 'tar';
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, rename, rmdirSync } from 'fs';
import { join } from 'path';
import AdmZip from 'adm-zip';
import chalk from 'chalk';
import yesno from 'yesno';

import { logError } from '../../cli/logging';

const EXTENSION_DIRS = {
  cli: join(os.homedir(), '.atlas', 'cli', 'extensions'),
  engine: join(os.homedir(), '.atlas', 'engine', 'extensions'),
  portal: join(os.homedir(), '.atlas', 'portal', 'extensions'),
  studio: join(os.homedir(), '.atlas', 'studio', 'extensions')
};
const VALID_TYPES = Object.keys(EXTENSION_DIRS);
const EXTENSION_TYPE_TO_WORDING = {
  cli: 'CLI Extension',
  engine: 'Engine Extension',
  portal: 'Portal Extension',
  studio: 'Studio Extension'
};

export async function installExtension(
  urlOrFilename: string,
  givenType: string,
  autoYes: boolean,
  output: string
): Promise<void> {
  console.log(`Fetching file at ${urlOrFilename} ...`);

  const filename = await download(urlOrFilename);

  console.log(`Using file at ${filename}`);

  const cacheDir = join(os.tmpdir(), Date.now().toString());
  ensureDir(cacheDir);

  const cacheDirOfExtensions = await extractExtensionToCacheDir(filename, cacheDir);
  for (const cacheDirOfExtension of cacheDirOfExtensions) {
    const packageJson = readPackageJson(cacheDirOfExtension);
    const name = packageJson.name;
    const engines = packageJson.engines || {};
    const type = givenType || Object.keys(engines)[0] || 'cli';

    if (!VALID_TYPES.includes(type)) {
      logError(`Expected \`type\` to be one of ${JSON.stringify(VALID_TYPES)}, got: ${type}`);
    }

    const newPath = await moveExtensionToDestination(cacheDirOfExtension, type, name, autoYes);

    console.log(
      EXTENSION_TYPE_TO_WORDING[type],
      chalk.greenBright(
        `${name} (${packageJson.version ? 'v' + packageJson.version : 'version missing'})`,
        chalk.reset(`has been installed to ${newPath}`)
      )
    );

    rmdirSync(cacheDirOfExtension, { recursive: true });
  }
}

async function download(filename: string): Promise<string> {
  if (existsSync(filename)) {
    return filename;
  }

  const filenameFromUri = filename.match(/\/([^?\/]+)$/)[1];
  const localFilename = join(os.tmpdir(), filenameFromUri);

  const file = createWriteStream(localFilename);
  const httpClient = filename.match(/^https:/) == null ? http : https;

  await new Promise((resolve) =>
    httpClient.get(filename, function(response) {
      response.pipe(file);
      file.on('finish', resolve);
    })
  );

  return localFilename;
}

async function extractExtensionToCacheDir(filename: string, dir: string): Promise<string[]> {
  if (filename.match(/(\.tar\.gz|\.tgz)$/)) {
    await extractTar(filename, dir);
  } else {
    await extractZip(filename, dir);
  }

  return getSubDirectoriesOfExtensions(dir);
}

async function extractTar(filename: string, dir: string): Promise<void> {
  await tar.extract({
    file: filename,
    cwd: dir
  });
}

async function extractZip(filename: string, dir: string): Promise<void> {
  new AdmZip(filename).extractAllTo(dir, true);
}

function getSubDirectoriesOfExtensions(dir: string): string[] {
  const extensionDirs = readdirSync(dir)
    .filter((fileEntry) => existsSync(join(dir, fileEntry, 'package.json')))
    .map((fileEntry) => join(dir, fileEntry));

  return extensionDirs;
}

async function moveExtensionToDestination(
  cacheDirOfExtension: string,
  type: string,
  name: string,
  autoYes: boolean
): Promise<string> {
  const newPath = join(EXTENSION_DIRS[type], name);

  if (autoYes !== true && existsSync(newPath)) {
    const yes = await yesno({
      question: `Extension path already exists: ${newPath}. Overwrite it? [Yn]`
    });

    if (yes !== true) {
      console.log('User cancelled operation. Aborting.');
      process.exit(255);
    }
  }

  await new Promise((resolve) => rename(cacheDirOfExtension, newPath, resolve));

  return newPath;
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function readPackageJson(dir: string): any {
  const filename = join(dir, 'package.json');
  if (!existsSync(filename)) {
    logError(`File \`package.json\` missing in extension: ${dir}`);
    process.exit(1);
  }

  const content = readFileSync(filename).toString();

  try {
    return JSON.parse(content);
  } catch (e) {
    logError(`Expected \`package.json\` to contain a \`name\` field: ${filename}`);
    logError(content);
    process.exit(1);
  }
}
