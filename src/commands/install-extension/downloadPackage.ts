import fs from '@npmcli/fs';
import { join } from 'path';
import { spawn } from 'child_process';
import os from 'os';

export function downloadPackage(name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const ls = spawn('npm', ['pack', '--silent', name]);
    let filename = '';

    ls.stdout.on('data', (data) => {
      filename += data;
    });

    ls.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    ls.on('error', (error) => {
      reject(error);
    });

    ls.on('close', (code) => {
      filename = filename.trim();

      const localFilename = join(os.tmpdir(), filename);

      fs.moveFile(filename, localFilename).then(() => resolve(localFilename));
    });
  });
}
