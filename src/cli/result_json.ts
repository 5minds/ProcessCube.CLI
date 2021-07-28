const NO_TTY_HINT = 'This output was automatically converted to JSON. Use `--output text` to force text output.';
const TTY_HINT = 'You can pipe the result of this JSON output into other commands. Use `--help` to learn more!';

export function createResultJson(resultType: string, result: any): any {
  return { result_type: resultType, result: result };
}

export function addJsonPipingHintToResultJson(resultJson: any): any {
  const isOutputGiven = process.argv.some((arg) => ['--output', '-o'].indexOf(arg) !== -1);
  const isPipedAndNoOutputGiven = !isOutputGiven && !Boolean(process.stdout.isTTY);

  return {
    ...resultJson,
    __hint__: isPipedAndNoOutputGiven ? NO_TTY_HINT : TTY_HINT
  };
}

export function useMessageForResultJsonErrors(results: any): any {
  results.forEach((result) => {
    result.error = result.error.message;
  });

  return results;
}
