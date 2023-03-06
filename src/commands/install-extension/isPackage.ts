const { spawn } = require('child_process');

export function isPackage(name: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const ls = spawn('npm', ['view', '--json', name]);

    ls.on('error', (error) => reject(error));
    ls.on('close', (code) => resolve(true));
  });
}
