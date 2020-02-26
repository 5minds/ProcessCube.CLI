export function createResultJson(resultType: string, result: any): any {
  return { result_type: resultType, result: result };
}
