export function createResultJson(resultType: string, result: any): any {
  return { result_type: resultType, result: result };
}

export function addJsonPipingHintToResultJson(resultJson: any): any {
  return {
    ...resultJson,
    __hint__: 'You can pipe the result of this JSON output into other commands. Use `pc --help` to learn more!'
  };
}
