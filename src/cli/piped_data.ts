import chalk from 'chalk';

export class StdinPipeReader {
  private pipedData: any | null;

  private constructor() {}

  static async create(): Promise<StdinPipeReader> {
    const stdinPipeReader = new StdinPipeReader();
    await stdinPipeReader.initialize();

    return stdinPipeReader;
  }

  getPipedData(): any | null {
    return this.pipedData;
  }

  getPipedProcessInstanceIds(): string[] | null {
    if (this.pipedData?.result_type === 'process-instances') {
      const pipedProcessInstances = this.pipedData.result.map((item: any) => item.processInstanceId);

      return pipedProcessInstances;
    }

    return null;
  }

  getPipedProcessModelIds(): string[] | null {
    if (this.pipedData?.result_type === 'process-models') {
      const pipedProcessModelIds = this.pipedData.result.map((item: any) => item.id);

      return pipedProcessModelIds;
    }

    return null;
  }

  getPipedProcessModelIdsInProcessInstances(): string[] | null {
    if (this.pipedData?.result_type === 'process-instances') {
      const pipedProcessModelIds = this.pipedData.result.map((item: any) => item.processModelId);

      return pipedProcessModelIds;
    }

    return null;
  }

  private async initialize(): Promise<void> {
    if (isReceivingPipedStdin() === false) {
      this.pipedData = null;
      return;
    }

    const content = await this.readPipedDataIfAny();
    if (content === '') {
      this.pipedData = null;
      return;
    }

    try {
      this.pipedData = JSON.parse(content);
    } catch (error) {
      console.error(chalk.red('Could not parse piped JSON from STDIN\n'));
      console.dir(content);
      console.error(chalk.redBright.bold('\nDid you forget to use `--output json` before piping?'));
      process.exit(1);
    }
  }

  private async readPipedDataIfAny(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const self = process.openStdin();
      let receivedData = '';
      self.on('data', function(chunk) {
        receivedData += chunk;
      });
      self.on('end', function() {
        resolve(receivedData);
      });
    });
  }
}

function isReceivingPipedStdin(): boolean {
  return !Boolean(process.stdin.isTTY);
}
