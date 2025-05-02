import AdmZip from 'adm-zip';
import chalk from 'chalk';
import { spawnSync } from 'child_process';
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'fs';
import fs from 'fs-extra';
import http from 'http';
import https from 'https';
import os from 'os';
import { join } from 'path';
import path from 'path';
import tar from 'tar';
import yesno from 'yesno';

import { logError, logWarning } from '../../cli/logging';
import { downloadPackage } from './downloadPackage';
import { isPackage } from './isPackage';

const EXTENSION_DIRS = {
  cli: join(os.homedir(), '.processcube', 'cli', 'extensions'),
  engine: join(os.homedir(), '.processcube', 'engine', 'extensions'),
  portal: join(os.homedir(), '.processcube', 'portal', 'extensions'),
  studio: join(os.homedir(), '.processcube', 'studio', 'extensions'),
  studioInsiders: join(os.homedir(), '.processcube', 'studio-insiders', 'extensions'),
  studioDev: join(os.homedir(), '.processcube', 'studio-dev', 'extensions'),
  studioLowcode: join(os.homedir(), '.processcube', 'studio', '__internal_studio_lowcode__', 'data'),
  studioInsidersLowcode: join(os.homedir(), '.processcube', 'studio-insiders', '__internal_studio_lowcode__', 'data'),
  studioDevLowcode: join(os.homedir(), '.processcube', 'studio-dev', '__internal_studio_lowcode__', 'data'),
};
const VALID_TYPES = ['cli', 'engine', 'portal', 'studio', 'studioInsiders', 'studioDev'];
const EXTENSION_TYPE_TO_WORDING = {
  cli: 'CLI Extension',
  engine: 'Engine Extension',
  portal: 'Portal Extension',
  studio: 'Studio Extension',
  studioInsiders: 'Studio Extension',
  studioDev: 'Studio Extension',
  studioLowcode: 'LowCode Studio Extension',
  studioInsidersLowcode: 'LowCode Studio Extension',
  studioDevLowcode: 'LowCode Studio Extension',
};

export async function installExtension(
  urlOrFilenameOrPackage: string,
  givenType: string,
  autoYes: boolean,
  givenExtensionsDir: string,
  useInsiders: boolean,
  useStable: boolean,
  useDev: boolean,
  output: string,
  lowcode: boolean,
): Promise<void> {
  console.log(`Fetching file/package ${urlOrFilenameOrPackage} ...`);

  const filename = await download(urlOrFilenameOrPackage);

  console.log(`Using file at ${filename}`);

  const cacheDir = join(os.tmpdir(), Date.now().toString());
  ensureDir(cacheDir);

  const cacheDirOfExtensions = await extractExtensionToCacheDir(filename, cacheDir);
  for (const cacheDirOfExtension of cacheDirOfExtensions) {
    const packageJson = readPackageJson(cacheDirOfExtension);
    const name = lowcode ? packageJson.name : packageNameToPath(packageJson.name);
    const engines = packageJson.engines || {};
    let types = [];

    if (useStable) {
      types.push('studio');
    }
    if (useDev) {
      types.push('studioDev');
    }
    if (useInsiders) {
      types.push('studioInsiders');
    }
    if (!useStable && !useDev && !useInsiders) {
      types.push(...(givenType ? [givenType] : Object.keys(engines).filter((engine) => VALID_TYPES.includes(engine))));
    }

    if (types.length === 0) {
      types.push(null);
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

Replace \`<type>\` with any of: ${VALID_TYPES.join(', ')}\nType will be set as \`cli\` by default.
`.trim(),
        );
        type = 'cli';
      }

      if (!VALID_TYPES.includes(type)) {
        logError(`Expected \`type\` to be one of ${JSON.stringify(VALID_TYPES)}, got: ${type}`);
      }

      console.log('\r');
      const newPath = await moveExtensionToDestination(
        cacheDirOfExtension,
        type,
        name,
        autoYes,
        givenExtensionsDir,
        lowcode,
        filename,
      );

      console.log(
        EXTENSION_TYPE_TO_WORDING[lowcode ? type + 'Lowcode' : type],
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

  await new Promise<void>((resolve) =>
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
  lowcode: boolean,
  packageFilepath: string,
): Promise<string> {
  const extensionDirForType = givenExtensionsDir || EXTENSION_DIRS[lowcode ? type + 'Lowcode' : type];
  if (!extensionDirForType && lowcode) {
    logError(
      `Expected \`type\` to be one of ${JSON.stringify(VALID_TYPES)}. Got \`${type}\`\n\`--lowcode\` flag is only supported for Studio extensions.`,
    );
    process.exit(1);
  }

  if (lowcode) {
    return installExtensionToPath(extensionDirForType, packageFilepath);
  }

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

async function installExtensionToPath(extensionDir: string, packageFilepath: string): Promise<string> {
  ensureDir(extensionDir);
  const packageJsonExists = existsSync(join(extensionDir, 'package.json'));
  if (!packageJsonExists) {
    const init = spawnSync('npm', ['init', '-y'], { cwd: extensionDir });
    if (init.status !== 0) {
      logError(`Failed to initialize package.json in ${extensionDir}\n${init.output.toString()}`);
      process.exit(1);
    }
  }

  const result = spawnSync('npm', ['install', '--prefix', extensionDir, '--silent', packageFilepath]);
  if (result.status !== 0) {
    logError(`Failed to install extension in ${extensionDir}\n${result.output.toString()}`);
    process.exit(1);
  }

  return extensionDir;
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
