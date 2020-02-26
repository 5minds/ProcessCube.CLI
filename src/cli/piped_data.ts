export async function getPipedDataIfAny(): Promise<string | null> {
  if (isReceivingPipedStdin() === false) {
    return null;
  }

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
