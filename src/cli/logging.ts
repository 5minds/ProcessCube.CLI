import chalk from 'chalk';
import { getBorderCharacters, table } from 'table';
import mapValues from 'lodash.mapvalues';

import marked from 'marked';
import { MarkdownRenderer } from './MarkdownRenderer';

const HTML_ENTITY_REGEX = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;

export function logJsonResult(result: any): void {
  console.log(JSON.stringify(result, null, 2));
}

export function logJsonResultAsTextTable(resultJson: any, fields: string[], title?: string): void {
  const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.substring(1);
  const partCapitalization = {
    id: 'ID',
    Id: 'ID',
    Ids: 'IDs'
  };
  const headerRow = fields.map((fieldName) => {
    const header = fieldName
      .split(/(?=[A-Z])/)
      .map((part) => partCapitalization[part] || capitalize(part))
      .join(' ');

    return chalk.bold(header);
  });
  const rows = resultJson.result.map((object) => {
    return fields.map((fieldName) => {
      let value = object[fieldName];

      if (value === undefined) {
        value = '';
      }
      if (value instanceof Date) {
        value = value.toISOString();
      }
      if (Array.isArray(value)) {
        value = value.join('\n');
      }
      if (fieldName === 'state') {
        if (value === 'error') {
          value = chalk.black.bgRedBright('ERROR');
        }
        if (value === 'finished') {
          value = chalk.greenBright(value);
        }
        if (value === 'terminated') {
          value = chalk.redBright(value);
        }
        if (value === 'running') {
          value = chalk.cyanBright(value);
        }
      }
      return value;
    });
  });

  const tableData = [headerRow, ...rows];

  const border = getDimmedTableBorder();
  const header = title == null ? undefined : { content: chalk.bold.blueBright(title) };
  const tableConfig = { border, header };

  console.log(table(tableData, tableConfig).trimRight());
  if (Array.isArray(resultJson.result)) {
    console.log(
      `  ${resultJson.result.length} results shown` +
        chalk.gray(' - use `--help` to learn more about filtering and sorting.')
    );
  }
}

function getDimmedTableBorder(): any {
  return mapValues(getBorderCharacters('norc'), (char) => chalk.dim(char));
}

export function logError(error: string): void {
  error.split('\n').forEach((line) => {
    console.warn(chalk.redBright.bold(`** (pc) ${line}`));
  });
}

export function logNoValidSessionError(): void {
  logError('No session found. Please use `pc login <engine_url>` to log in.');
}

export function logWarning(warning: string): void {
  warning.split('\n').forEach((line) => {
    console.warn(chalk.yellowBright(`** (pc) ${line}`));
  });
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

export function usageString(usage: string, descriptionLong: string): string {
  return heading('USAGE') + `\n  $0 ${usage}\n\n` + heading('DESCRIPTION') + `\n  ${descriptionLong}`;
}
