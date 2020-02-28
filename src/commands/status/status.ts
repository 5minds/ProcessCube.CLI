import { loadAtlasSession } from '../../session/atlas_session';
import { logWarning } from '../../cli/logging';

export async function printSessionStatus(format: string): Promise<void> {
  const session = loadAtlasSession();

  if (session == null) {
    logWarning('No session found.');
    return;
  }

  console.dir(session, { depth: null });
}
