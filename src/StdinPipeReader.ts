import * as JSON5 from 'json5';
import { logError } from './cli/logging';

export class StdinPipeReader {
  private hasReadFromStdin: boolean = false;
  private pipedJson: any | null = null;
  private pipedText: string | null = null;

  async getJson(): Promise<any | null> {
    if (this.pipedJson != null) {
      return this.pipedJson;
    }

    const text = await this.getText();

    try {
      this.pipedJson = JSON5.parse(text);
    } catch (error) {
      logError('Could not parse piped JSON from STDIN:');
      console.error(this.pipedText);
    }

    return this.pipedJson;
  }

  async getText(): Promise<string | null> {
    if (this.hasReadFromStdin === false) {
      await this.readFromStdin();
    }

    return this.pipedText;
  }

  isPipe(): boolean {
    return !Boolean(process.stdin.isTTY);
  }

  private async readFromStdin(): Promise<void> {
    this.hasReadFromStdin = true;

    if (this.isPipe()) {
      this.pipedText = await this.readPipedDataIfAny();
    }
  }

  private async readPipedDataIfAny(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const self = process.openStdin();
      let receivedData: string | null = null;
      self.on('data', function(chunk) {
        receivedData = (receivedData || '') + chunk;
      });
      self.on('end', function() {
        resolve(receivedData);
      });
    });
  }
}
