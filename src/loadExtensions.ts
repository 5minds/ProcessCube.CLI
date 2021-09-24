import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { logWarning } from './cli/logging';
import { CLI } from './contracts/cli_types';
import { getExtensionsDir } from './session/atlas_path_functions';

export type ExtensionModule = {
  name: string;
  version: string;
  exports: any;
};

type LoadedModule = {
  exports: any;
};

export async function loadExtensions(cli: CLI): Promise<void> {
  const extensionsDir = getExtensionsDir();
  if (!existsSync(extensionsDir)) {
    return;
  }

  const subdirNames = readdirSync(extensionsDir);

  for (const subdir of subdirNames) {
    const filename = join(extensionsDir, subdir, 'package.json');

    if (existsSync(filename)) {
      const packageText = readFileSync(filename).toString();
      let packageJson: any = null;

      try {
        packageJson = JSON.parse(packageText);
      } catch (error) {
        console.error(error);
        return;
      }

      const entrypoint = join(extensionsDir, subdir, packageJson.main);
      if (existsSync(entrypoint)) {
        try {
          const module = await loadFile(entrypoint);
          const extensionModule: ExtensionModule = { ...packageJson, ...module };

          if (extensionModule.exports.onLoad) {
            await extensionModule.exports.onLoad(cli);
          } else {
            logWarning(`Expected 'main' script for extension '${subdir}' to export an \`onLoad\` hook: ${entrypoint}`);
          }
        } catch (e) {
          logWarning(`Error while loading 'main' script for extension '${subdir}' (${entrypoint}): ${e.message}`);
        }
      } else {
        logWarning(`Expected 'main' script for extension '${subdir}' to exist: ${entrypoint}`);
      }
    }
  }
}

async function loadFile(filename: string): Promise<LoadedModule> {
  const module: LoadedModule = {
    exports: {}
  };

  const code = readFileSync(filename).toString();

  loadStringIntoModule(code, require, module);

  return module;
}

function loadStringIntoModule(code: string, require: Function, module: any): void {
  const exports = module.exports;

  const wrappedCode = `(function evaluate(require, module, exports) {
        ${code}
      })`;

  (0, eval)(wrappedCode).apply(this, [require, module, exports]);
}
