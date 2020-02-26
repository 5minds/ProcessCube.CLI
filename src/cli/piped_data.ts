import chalk from 'chalk';

export async function getPipedDataIfAny(): Promise<any | null> {
  if (isReceivingPipedStdin() === false) {
    return null;
  }
  const content = await readPipedDataIfAny();

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red('Could not parse piped JSON from STDIN. Aborting.'));
    process.exit(1);
  }
}

export async function readPipedDataIfAny(): Promise<string | null> {
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

function isReceivingPipedStdin(): boolean {
  return !Boolean(process.stdin.isTTY);
}

export async function getPipedProcessInstanceIds(givenProcessInstanceIds: string[]): Promise<string[]> {
  const pipedData = await getPipedDataIfAny();
  if (pipedData?.result_type === 'process-instances') {
    const pipedProcessInstances = pipedData.result.map((item: any) => item.processInstanceId);

    return pipedProcessInstances;
  }

  return givenProcessInstanceIds;
}

export async function getPipedProcessModelIds(givenProcessModelIds: string[]): Promise<string[]> {
  const pipedData = await getPipedDataIfAny();
  if (pipedData?.result_type === 'process-models') {
    const pipedProcessInstances = pipedData.result.map((item: any) => item.id);

    return pipedProcessInstances;
  }

  return givenProcessModelIds;
}
