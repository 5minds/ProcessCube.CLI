export function toFilterRegexes(patterns: string[]): RegExp[] {
  return patterns.map((pattern: string) => new RegExp(pattern, 'gi'));
}
