import { HttpClient } from '@essential-projects/http';
import { ExternalAccessor, ManagementApiClient } from '@process-engine/management_api_client';

import { AtlasSession } from '../session/atlas_session';

export type IdentityAndManagementApiClient = {
  identity: {
    userId: string;
    token: string;
  };
  managementApiClient: ManagementApiClient;
};

export function getIdentityAndManagementApiClient(session: AtlasSession): IdentityAndManagementApiClient {
  const httpClient = new HttpClient();
  // TODO: Make an issue whether or not this is seriously how one should use this?
  httpClient.config = { url: session.engineUrl };
  const externalAccessor: ExternalAccessor = new ExternalAccessor(httpClient);
  const managementApiClient: ManagementApiClient = new ManagementApiClient(externalAccessor);

  const identity = {
    // TODO: do we need a user id? what for?
    userId: 'atlas-cli',
    token: session.accessToken
  };

  return { identity, managementApiClient };
}
