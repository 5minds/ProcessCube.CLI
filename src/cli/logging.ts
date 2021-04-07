import chalk from 'chalk';
import * as marked from 'marked';
import { MarkdownRenderer } from './MarkdownRenderer';

const HTML_ENTITY_REGEX = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;

export function logJsonResult(result: any): void {
  console.log(JSON.stringify(result, null, 2));
}

export function logError(error: string): void {
  console.warn(chalk.redBright.bold(`** (pc) ${error}`));
}

export function logNoValidSessionError(): void {
  logError('No session found. Please use `pc login <engine_url>` to log in.');
}

export function logWarning(warning: string): void {
  console.warn(chalk.yellowBright(`** (pc) ${warning}`));
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

export function padLeftMultiline(text: string, padText: string): string {
  return text
    .split('\n')
    .map((line) => `${padText}${line}`)
    .join('\n');
}

export function heading(text: string): string {
  return chalk.bold(`${text}\n`);
}

export function shellExample(text: string): string {
  return chalk.bold(`${text}\n`);
}

export function formatHelpText(originalText: string): string {
  const text = removeMultilineIndent(originalText);

  return formatMarkdown(text);
}

function formatMarkdown(text: string): string {
  const stillContainingSomeHtml = marked(text, { renderer: new MarkdownRenderer() });

  return unescapeHtmlEntities(stillContainingSomeHtml);
}

function unescapeHtmlEntities(html: string): string {
  // explicitly match decimal, hex, and named HTML entities
  return html.replace(HTML_ENTITY_REGEX, (_, n) => {
    n = n.toLowerCase();
    if (n === 'colon') {
      return ':';
    }
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}
