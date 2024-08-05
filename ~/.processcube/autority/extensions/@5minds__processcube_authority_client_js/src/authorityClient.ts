import { oauthToken } from "./api";
import {
  CACHE_KEY_ID_TOKEN_SUFFIX,
  CacheEntry,
  CacheKey,
  CacheManager,
  ICache,
  IdTokenEntry,
  InMemoryCache,
} from "./cache";
import { CacheKeyManifest } from "./cache/key-manifest";
import {
  CACHE_LOCATION_MEMORY,
  DEFAULT_AUTHORIZE_TIMEOUT_IN_SECONDS,
  DEFAULT_NOW_PROVIDER,
  DEFAULT_SCOPE,
  DEFAULT_SESSION_EXPIRY_DAYS,
} from "./constants";
import { decodeIdToken } from "./jwt";
import {
  AuthParams,
  AuthorizeOptions,
  CacheLocation,
  ClientOptions,
  DecodedToken,
  GetTokenResponse,
  GetTokenSilentlyLocalOptions,
  GetTokenSilentlyOptions,
  GetTokenSilentlyVerboseResponse,
  PKCERequestTokenOptions,
  RefreshTokenRequestTokenOptions,
  TokenEndpointResponse,
  User,
} from "./models";
import { singlePromise } from "./promise-utils";
import { ClientStorage, CookieStorage } from "./storage";
import { TransactionManager } from "./transaction-manager";
import {
  encode,
  createRandomString,
  getUniqueScopes,
  sha256,
  bufferToBase64UrlEncoded,
  createQueryParams,
  parseAuthenticationResult,
  cacheFactory,
  buildIsAuthenticatedCookieName,
  getAuthorizeParams,
  runIframe,
} from "./utils";
import { GenericError, MissingRefreshTokenError } from "./errors";

interface LoginRedirectOptions {
  authParams?: AuthParams;
  onRedirect?: (url: string) => Promise<void>;
}

const DEFAULT_FETCH_TIMEOUT_MS = 10000;

export class AuthorityClient {
  private readonly authenticatedCookieName: string;
  private readonly httpTimeoutMs: number;
  private readonly transactionManager: TransactionManager;
  private readonly options: ClientOptions;
  private readonly sessionExpiryDays: number;
  private readonly scope: string;
  private readonly cacheManager: CacheManager;
  private readonly userCache: ICache = new InMemoryCache().enclosedCache;

  constructor(options: ClientOptions) {
    this.httpTimeoutMs = DEFAULT_FETCH_TIMEOUT_MS;
    this.options = options;
    this.scope = getUniqueScopes(DEFAULT_SCOPE, options.authParams?.scope);

    this.transactionManager = new TransactionManager(
      CookieStorage,
      this.options.clientId
    );

    let cacheLocation: CacheLocation | undefined;
    let cache: ICache;

    if (options.cache) {
      cache = options.cache;
    } else {
      cacheLocation = options.cacheLocation || CACHE_LOCATION_MEMORY;

      if (!cacheFactory(cacheLocation)) {
        throw new Error(`Invalid cache location "${cacheLocation}"`);
      }

      cache = cacheFactory(cacheLocation)();
    }

    this.cacheManager = new CacheManager(
      cache,
      !cache.allKeys
        ? new CacheKeyManifest(cache, this.options.clientId)
        : undefined,
      DEFAULT_NOW_PROVIDER
    );

    this.authenticatedCookieName = buildIsAuthenticatedCookieName(
      this.options.clientId
    );

    this.sessionExpiryDays =
      options.sessionExpiryDays || DEFAULT_SESSION_EXPIRY_DAYS;
  }

  public async loginRedirect(loginOptions?: LoginRedirectOptions) {
    const { url, ...transaction } = await this._prepareAuthorizeUrl(
      this.options.authParams || {}
    );

    this.transactionManager.create({
      ...transaction,
    });

    window.location.assign(url);
  }

  public async handleRedirectCallback(
    url: string = window.location.href
  ): Promise<void> {
    const queryStringFragments = url.split("?").slice(1);

    if (queryStringFragments.length === 0) {
      throw new Error("There are no query params available for parsing.");
    }

    const { state, code, error, error_description } = parseAuthenticationResult(
      queryStringFragments.join("")
    );

    const transaction = this.transactionManager.get();

    if (!transaction) {
      throw new Error("Missing Transaction");
    }

    this.transactionManager.remove();

    if (
      !transaction.code_verifier ||
      (transaction.state && transaction.state !== state)
    ) {
      throw new Error("State Mismatch in Transaction");
    }

    const redirect_uri = transaction.redirect_uri;

    await this._requestToken({
      audience: transaction.audience,
      scope: transaction.scope,
      code_verifier: transaction.code_verifier,
      grant_type: "authorization_code",
      code: code as string,
      ...(redirect_uri ? { redirect_uri } : {}),
    });

    const user = await this.getUser();

    return;
  }

  public async checkSession(options?: LoginRedirectOptions) {
    if (!CookieStorage.get(this.authenticatedCookieName)) {
      return;
    }

    try {
      await this.loginRedirect(options);
    } catch (_) {}
  }

  public async getUser<TUser extends User>(): Promise<TUser | undefined> {
    const cache = await this._getIdTokenFromCache();
    return cache?.decodedToken?.user as TUser;
  }

  public async getTokenSilently(
    options: GetTokenSilentlyOptions = {}
  ): Promise<string> {
    const localOptions: GetTokenSilentlyLocalOptions = {
      cacheMode: "on",
      ...options,
      authParams: {
        ...this.options.authParams,
        ...options.authParams,
        scope: getUniqueScopes(this.scope, options.authParams?.scope),
      },
    };

    const result = await singlePromise(
      () => this._getTokenSilently(localOptions),
      `${this.options.clientId}::${localOptions.authParams.audience}::${localOptions.authParams.scope}`
    );

    return result;
  }

  private async _getTokenSilently(
    options: GetTokenSilentlyLocalOptions
  ): Promise<string> {
    const { cacheMode, ...getTokenOptions } = options;

    try {
      if (cacheMode !== "off") {
        const entry = await this._getEntryFromCache({
          scope: getTokenOptions.authParams.scope,
          audience: getTokenOptions.authParams.audience || "default",
          clientId: this.options.clientId,
        });

        if (entry) {
          return entry.access_token;
        }
      }

      const authResult = this.options.refreshTokens
        ? await this._getTokenUsingRefreshToken(getTokenOptions)
        : await this._getTokenUsingRefreshToken(getTokenOptions);

      return authResult;
    } finally {
    }

    return "no token in cache";
  }

  private async _getIdTokenFromCache() {
    const audience = this.options.authParams?.audience || "default";

    const cache = await this.cacheManager.getIdToken(
      new CacheKey({
        clientId: this.options.clientId,
        audience,
        scope: this.scope,
      })
    );

    const currentCache = this.userCache.get<IdTokenEntry>(
      CACHE_KEY_ID_TOKEN_SUFFIX
    ) as IdTokenEntry;

    // If the id_token in the cache matches the value we previously cached in memory return the in-memory
    // value so that object comparison will work
    if (cache && cache.id_token === currentCache?.id_token) {
      return currentCache;
    }

    this.userCache.set(CACHE_KEY_ID_TOKEN_SUFFIX, cache);
    return cache;
  }

  private async _getTokenFromIFrame(
    options: GetTokenSilentlyLocalOptions
  ): Promise<string> {
    const params: AuthParams & { scope: string } = {
      ...options.authParams,
    };

    const {
      url,
      state: stateIn,
      nonce: nonceIn,
      code_verifier,
      redirect_uri,
      scope,
      audience,
    } = await this._prepareAuthorizeUrl(params, "fragment");

    try {
      if ((window as any).crossOriginIsolated) {
        throw new GenericError(
          "login_required",
          "The application is running in a Cross-Origin Isolated context, silently retrieving a token without refresh token is not possible."
        );
      }

      const authorizeTimeout = options.timeoutInSeconds;

      const codeResult = await runIframe(url, authorizeTimeout);

      console.log(codeResult);

      if (stateIn !== codeResult.state) {
        throw new GenericError("state_mismatch", "Invalid state");
      }
    } finally {
      return "";
    }
  }

  private async _getTokenUsingRefreshToken(
    options: GetTokenSilentlyLocalOptions
  ): Promise<string> {
    const cache = await this.cacheManager.get(
      new CacheKey({
        scope: options.authParams.scope,
        audience: options.authParams.audience || "default",
        clientId: this.options.clientId,
      })
    );

    if (!cache || !cache.refresh_token) {
      throw new MissingRefreshTokenError(
        options.authParams.audience || "default",
        options.authParams.scope
      );
    }

    const redirect_uri =
      options.authParams.redirectUri ||
      this.options.authParams?.redirectUri ||
      window.location.origin;

    const tokenResult = await this._requestToken({
      ...options.authParams,
      grant_type: "refresh_token",
      refresh_token: cache && cache.refresh_token,
      redirect_uri,
    });

    return tokenResult.access_token;
  }

  private async _prepareAuthorizeUrl(
    authParams: AuthParams,
    responseMode?: string
  ): Promise<{
    scope: string;
    audience: string;
    redirect_uri?: string;
    nonce: string;
    code_verifier: string;
    state: string;
    url: string;
  }> {
    const state = encode(createRandomString());
    const nonce = encode(createRandomString());
    const code_verifier = createRandomString();
    const code_challengeBuffer = await sha256(code_verifier);
    const code_challenge = bufferToBase64UrlEncoded(code_challengeBuffer);

    const params = getAuthorizeParams(
      this.options,
      this.scope,
      authParams,
      state,
      nonce,
      code_challenge,
      authParams.redirectUri || this.options.authParams?.redirectUri,
      responseMode
    );

    const url = this._authorizeUrl(params);

    return {
      nonce,
      code_verifier,
      scope: params.scope,
      audience: params.audience || "default",
      redirect_uri: params.redirect_uri,
      state,
      url,
    };
  }

  private _url(path: string) {
    const auth0Client = encodeURIComponent(
      btoa(JSON.stringify(this.options.clientId))
    );
    return `${this.options.issuerUrl}${path}`;
  }

  private _authorizeUrl(authorizeOptions: AuthorizeOptions) {
    return this._url(`/auth?${createQueryParams(authorizeOptions)}`);
  }

  private async _requestToken(
    options: PKCERequestTokenOptions | RefreshTokenRequestTokenOptions
  ): Promise<GetTokenResponse> {
    const authResult = await oauthToken({
      useFormData: true,
      baseUrl: this.options.issuerUrl,
      client_id: this.options.clientId,
      timeout: this.httpTimeoutMs,
      ...options,
    });

    const decodedToken = decodeIdToken(authResult.id_token);

    console.log(authResult);

    await this._saveEntryInCache({
      ...authResult,
      decodedToken,
      scope: options.scope,
      audience: options.audience || "default",
      ...(authResult.scope ? { oauthTokenScope: authResult.scope } : null),
      client_id: this.options.clientId,
    });

    CookieStorage.save(this.authenticatedCookieName, true, {
      daysUntilExpire: this.sessionExpiryDays,
      cookieDomain: this.options.cookieDomain,
    });

    return { ...authResult, decodedToken };
  }

  private async _saveEntryInCache(
    entry: CacheEntry & { id_token: string; decodedToken: DecodedToken }
  ) {
    const { id_token, decodedToken, ...entryWithoutIdToken } = entry;

    this.userCache.set(CACHE_KEY_ID_TOKEN_SUFFIX, {
      id_token,
      decodedToken,
    });

    await this.cacheManager.setIdToken(
      this.options.clientId,
      entry.id_token,
      entry.decodedToken
    );

    await this.cacheManager.set(entryWithoutIdToken);
  }

  private async _getEntryFromCache({
    scope,
    audience,
    clientId,
  }: {
    scope: string;
    audience: string;
    clientId: string;
  }): Promise<undefined | GetTokenSilentlyVerboseResponse> {
    const entry = await this.cacheManager.get(
      new CacheKey({
        scope,
        audience,
        clientId,
      }),
      60 // get a new token if within 60 seconds of expiring
    );

    if (entry && entry.access_token) {
      const { access_token, oauthTokenScope, expires_in } = entry as CacheEntry;
      const cache = await this._getIdTokenFromCache();
      return (
        cache && {
          id_token: cache.id_token,
          access_token,
          ...(oauthTokenScope ? { scope: oauthTokenScope } : null),
          expires_in,
        }
      );
    }
  }
}
