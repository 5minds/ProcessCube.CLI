import * as marked from 'marked';
import chalk from 'chalk';

import { padLeftMultiline } from './logging';

export class MarkdownRenderer extends marked.Renderer {
  code(code: string, language: string | undefined, isEscaped: boolean): string {
    let result = code;
    if (code.startsWith('$')) {
      const codeWithHightlightedShellPrompt = code.replace(/(\$ )(pc \S+)/gim, (...args) => {
        return `${chalk.greenBright(args[1])}${args[2]}`;
      });
      result = codeWithHightlightedShellPrompt;
    } else {
      result = chalk.cyanBright(code);
    }
    return padLeftMultiline(result, '    ') + '\n\n';
  }

  blockquote(quote: string): string {
    return quote;
  }

  html(html: string): string {
    return html;
  }

  heading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6, raw: string, slugger: marked.Slugger): string {
    return chalk.bold(text) + '\n\n';
  }

  hr(): string {
    return '---' + '\n\n';
  }

  list(body: string, ordered: boolean, start: number): string {
    return body;
  }

  listitem(text: string): string {
    return text;
  }

  paragraph(text: string): string {
    return text + '\n\n';
  }

  strong(text: string): string {
    return chalk.bold(text);
  }

  em(text: string): string {
    return chalk.italic(text);
  }

  codespan(code: string): string {
    return chalk.magentaBright(code);
  }

  br(): string {
    return '' + '\n\n';
  }

  del(text: string): string {
    return text;
  }

  link(href: string, title: string, text: string): string {
    return href;
  }

  image(href: string, title: string, text: string): string {
    return href;
  }

  text(text: string): string {
    return text;
  }
}
