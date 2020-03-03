import chalk from 'chalk';

export function logError(error: string): void {
  console.warn(chalk.redBright.bold(`** (Atlas) ${error}`));
}

export function logWarning(warning: string): void {
  console.warn(chalk.yellowBright(`** (Atlas) ${warning}`));
}

export function logMultiline(text: string): void {
  console.log(removeMultilineIndent(text));
}

export function removeMultilineIndent(text: string): string {
  const lines = text.split('\n');
  const firstLine = lines[0] === '' ? lines[1] : lines[0];
  const indent = firstLine.length - firstLine.trimLeft().length;
  const removeIndentRegex = new RegExp(`^(\ {${indent}})`);

  return lines
    .map((line: string) => line.replace(removeIndentRegex, ''))
    .join('\n')
    .trim();
}
