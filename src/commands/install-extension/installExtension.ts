import AdmZip from 'adm-zip';
import chalk from 'chalk';
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, rename, rmSync } from 'fs';
import fs from 'fs-extra';
import http from 'http';
import https from 'https';
import os from 'os';
import { join } from 'path';
import path from 'path';
import tar from 'tar';
import yesno from 'yesno';

import { logError, logJsonResult, logWarning } from '../../cli/logging';
import { downloadPackage } from './downloadPackage';
import { isPackage } from './isPackage';

const EXTENSION_DIRS = {
  cli: join(os.homedir(), '.processcube', 'cli', 'extensions'),
  engine: join(os.homedir(), '.processcube', 'engine', 'extensions'),
  portal: join(os.homedir(), '.processcube', 'portal', 'extensions'),
  studio: join(os.homedir(), '.processcube', 'studio', 'extensions'),
  studioInsiders: join(os.homedir(), '.processcube', 'studio-insiders', 'extensions'),
  studioDev: join(os.homedir(), '.processcube', 'studio-dev', 'extensions'),
};
const TEST = ['cli', 'engine', 'portal'];
const VALID_TYPES = ['cli', 'engine', 'portal', 'studio', 'studioInsiders', 'studioDev'];
const EXTENSION_TYPE_TO_WORDING = {
  cli: 'CLI Extension',
  engine: 'Engine Extension',
  portal: 'Portal Extension',
  studio: 'Studio Extension',
  studioInsiders: 'Studio Extension',
  studioDev: 'Studio Extension',
};

export async function installExtension(
  urlOrFilenameOrPackage: string,
  givenType: string,
  autoYes: boolean,
  givenExtensionsDir: string,
  useInsiders: boolean,
  useStableAndInsiders: boolean,
  useDevAndInsiders: boolean,
  output: string,
): Promise<void> {
  if (useInsiders && !urlOrFilenameOrPackage.includes('studio')) {
    logError(
      `The package ${urlOrFilenameOrPackage} cannot be installed for studio-insiders. It is not a studio extension.`,
    );
    process.exit(1);
  }

  console.log(`Fetching file/package ${urlOrFilenameOrPackage} ...`);

  const filename = await download(urlOrFilenameOrPackage);

  console.log(`Using file at ${filename}`);

  const cacheDir = join(os.tmpdir(), Date.now().toString());
  ensureDir(cacheDir);

  const cacheDirOfExtensions = await extractExtensionToCacheDir(filename, cacheDir);
  for (const cacheDirOfExtension of cacheDirOfExtensions) {
    const packageJson = readPackageJson(cacheDirOfExtension);
    const name = packageNameToPath(packageJson.name);
    const engines = packageJson.engines || {};
    let types = [];

    if (useStableAndInsiders) {
      types.push('studio');
    }
    if (useDevAndInsiders) {
      types.push('studioDev');
    }
    if (useInsiders) {
      types.push('studioInsiders');
    } else {
      types.push(givenType || Object.keys(engines)[0]);
    }

    for (let type of types) {
      if (type == null) {
        logWarning(
          `Package ${name} does not specify its type.

If you are the author, please specify it under \`engines\` in \`package.json\`:

      {
        "name": "${name}",
        "engines": {
          "<type>": "> 0.0.0"
        },
        ...
      }

Replace \`<type>\` with any of: ${VALID_TYPES.join(', ')}
`.trim(),
        );
        type = 'cli';
      }

      if (!VALID_TYPES.includes(type)) {
        logError(`Expected \`type\` to be one of ${JSON.stringify(VALID_TYPES)}, got: ${type}`);
      }

      console.log('\r');
      const newPath = await moveExtensionToDestination(cacheDirOfExtension, type, name, autoYes, givenExtensionsDir);

      console.log(
        EXTENSION_TYPE_TO_WORDING[type],
        chalk.greenBright(
          `${name} (${packageJson.version ? 'v' + packageJson.version : 'version missing'})`,
          chalk.reset(`has been installed to ${newPath}`),
        ),
      );
    }

    await fs.remove(cacheDirOfExtension);
  }

  rmSync(cacheDir, { recursive: true });
}

async function download(filename: string): Promise<string> {
  const hasNoProtocol = filename.match(/:\/\//) == null;
  if (hasNoProtocol) {
    if (existsSync(filename)) {
      return filename;
    }

    if (await isPackage(filename)) {
      return downloadPackage(filename);
    }
  }

  const filenameFromUri = filename.match(/\/([^?\/]+)$/)[1];
  const localFilename = join(os.tmpdir(), filenameFromUri);

  const file = createWriteStream(localFilename);
  const httpClient = filename.match(/^https:/) == null ? http : https;

  await new Promise((resolve) =>
    httpClient.get(filename, function (response) {
      response.pipe(file);
      file.on('finish', resolve);
    }),
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
    cwd: dir,
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
  autoYes: boolean,
  givenExtensionsDir: string,
): Promise<string> {
  const extensionDirForType = givenExtensionsDir || EXTENSION_DIRS[type];
  const newPath = join(extensionDirForType, name);
  const finalPath = getPath(newPath);

  if (existsSync(finalPath)) {
    if (autoYes !== true) {
      const yes = await yesno({
        question: `Extension path already exists: ${finalPath}. Overwrite it? [Yn]`,
      });

      if (yes !== true) {
        console.log('User cancelled operation. Aborting.');
        process.exit(255);
      }
    }

    rmSync(finalPath, { recursive: true });
  }

  ensureDir(extensionDirForType);

  await fs.copy(cacheDirOfExtension, finalPath);

  return finalPath;
}

function getPath(newPath: string): string {
  var finalPath = newPath;
  const homedir = os.homedir();

  if (newPath.startsWith('~')) {
    const pathFromHome = newPath.replace('~/', '');
    finalPath = path.join(homedir, pathFromHome);
  } else {
    finalPath = path.resolve(finalPath);
  }

  return finalPath;
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

function packageNameToPath(name: string): string {
  return name.replace(/\//, '__');
}
