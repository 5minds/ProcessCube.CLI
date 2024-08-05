import { ICache } from "./cache";

export interface AuthParams {
  scope?: string;
  audience?: string;
  redirectUri?: string;
}

export interface AuthorizeOptions {
  client_id: string;
  response_type: string;
  response_mode: string;
  redirect_uri?: string;
  audience?: string;
  nonce: string;
  state: string;
  scope: string;
  code_challenge: string;
  code_challenge_method: string;
}

export interface ClientOptions {
  issuerUrl: string;
  clientId: string;
  authParams?: AuthParams;
  cacheLocation?: CacheLocation;
  cache?: ICache;
  sessionExpiryDays?: number;
  cookieDomain?: string;
  refreshTokens?: boolean;
}

export interface LoginRedirectOptions {
  authParams?: AuthParams;
  onRedirect?: (url: string) => Promise<void>;
}

export interface AuthenticationResult {
  state: string;
  code?: string;
  error?: string;
  error_description?: string;
}

interface BaseRequestTokenOptions {
  audience?: string;
  scope: string;
  timeout?: number;
  redirect_uri?: string;
}

export interface PKCERequestTokenOptions extends BaseRequestTokenOptions {
  code: string;
  grant_type: "authorization_code";
  code_verifier: string;
}

export interface RefreshTokenRequestTokenOptions
  extends BaseRequestTokenOptions {
  grant_type: "refresh_token";
  refresh_token?: string;
}

export interface TokenEndpointOptions {
  baseUrl: string;
  client_id: string;
  grant_type: string;
  timeout?: number;
  useFormData?: boolean;
  [key: string]: any;
}

export interface OAuthTokenOptions extends TokenEndpointOptions {
  code_verifier: string;
  code: string;
  redirect_uri: string;
  audience: string;
  scope: string;
}

export interface GetTokenSilentlyOptions {
  cacheMode?: "on" | "off" | "cache-only";
  timeoutInSeconds?: number;
  detailedResponse?: boolean;
  authParams?: AuthParams;
}

export type GetTokenSilentlyLocalOptions = GetTokenSilentlyOptions & {
  authParams: AuthParams & { scope: string };
};

export type TokenEndpointResponse = {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
};

export type GetTokenResponse = TokenEndpointResponse & {
  decodedToken: DecodedToken;
};

export type GetTokenSilentlyVerboseResponse = Omit<
  TokenEndpointResponse,
  "refresh_token"
>;

export type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  credentials?: "include" | "omit";
  body?: string;
  signal?: AbortSignal;
};

export interface IdToken {
  __raw: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: string;
  company?: string;
  updated_at?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  nonce?: string;
  at_hash?: string;
  acr?: string;
  sub_jwk?: string;
  [key: string]: any;
}

export class User {
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: string;
  updated_at?: string;
  sub?: string;
  [key: string]: any;
}

export interface DecodedToken {
  claims: IdToken;
  user: User;
}

export type CacheLocation = "memory" | "localstorage";
