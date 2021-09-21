import { CLI } from './cli';

import { onLoad as onLoadDeployFiles } from './commands/deploy-files';
import { onLoad as onLoadFinishUserTask } from './commands/finish-user-task';
import { onLoad as onLoadInstallExtension } from './commands/install-extension';
import { onLoad as onLoadListProcessInstances } from './commands/list-process-instances';
import { onLoad as onLoadListProcessModels } from './commands/list-process-models';
import { onLoad as onLoadListUserTasks } from './commands/list-user-tasks';
import { onLoad as onLoadLogin } from './commands/login';
import { onLoad as onLoadLogout } from './commands/logout';
import { onLoad as onLoadRemoveProcessModels } from './commands/remove-process-models';
import { onLoad as onLoadRetryProcessInstance } from './commands/retry-process-instance';
import { onLoad as onLoadSessionStatus } from './commands/session-status';
import { onLoad as onLoadShowProcessInstance } from './commands/show-process-instance';
import { onLoad as onLoadStartProcessModel } from './commands/start-process-model';
import { onLoad as onLoadStopProcessInstance } from './commands/stop-process-instance';
import { onLoad as onLoadGenerateRootAccessToken } from './commands/generate-root-access-token';

const packagedOnLoadFunctions = [
  onLoadDeployFiles,
  onLoadFinishUserTask,
  onLoadGenerateRootAccessToken,
  onLoadInstallExtension,
  onLoadListProcessInstances,
  onLoadListProcessModels,
  onLoadListUserTasks,
  onLoadLogin,
  onLoadLogout,
  onLoadRemoveProcessModels,
  onLoadRetryProcessInstance,
  onLoadSessionStatus,
  onLoadShowProcessInstance,
  onLoadStartProcessModel,
  onLoadStopProcessInstance
];

export async function loadPackagedExtensions(cli: CLI): Promise<void> {
  for (const onLoad of packagedOnLoadFunctions) {
    await onLoad(cli);
  }
}
