import { AtlasSession } from '../session/atlas_session';

export type Identity = {
  userId: string;
  token: string;
};

export function getIdentity(session: AtlasSession): Identity {
  const identity = {
    // TODO: do we need a user id? what for?
    userId: session.idToken,
    token: session.accessToken
  };

  return identity;
}
