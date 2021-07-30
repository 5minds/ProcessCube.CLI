import { Issuer, TokenSet } from 'openid-client';

export type IdTokenAccessTokenAndExpiresAt = {
  accessToken: string;
  idToken: string;
  expiresAt: number;
};

export async function getAccessTokenFromIdentityServer(
  identityServerUrl: string,
  clientId: string,
  clientSecret: string,
  givenScope?: string
): Promise<IdTokenAccessTokenAndExpiresAt | null> {
  const scope = givenScope ?? 'test_resource';
  const issuer = await Issuer.discover(identityServerUrl);

  const client = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    response_type: ['id_token', 'token']
  });

  const tokenSet: TokenSet = await client.grant({
    grant_type: 'client_credentials',
    scope: scope
  });

  return {
    accessToken: tokenSet.access_token,
    idToken: tokenSet.id_token,
    expiresAt: tokenSet.expires_at * 1000
  };
}
