import { CLI } from './cli';
import { onLoad as onLoadListProcessInstances } from './commands/list-process-instances';

const packagedOnLoadFunctions = [onLoadListProcessInstances];

export async function loadPackagedExtensions(cli: CLI): Promise<void> {
  for (const onLoad of packagedOnLoadFunctions) {
    await onLoad(cli);
  }
}
