import { ICache, InMemoryCache, LocalStorageCache } from "./cache";
import {
  CLEANUP_IFRAME_TIMEOUT_IN_SECONDS,
  DEFAULT_AUTHORIZE_TIMEOUT_IN_SECONDS,
} from "./constants";
import { GenericError, TimeoutError } from "./errors";
import {
  AuthParams,
  AuthenticationResult,
  AuthorizeOptions,
  ClientOptions,
} from "./models";

export const getCrypto = () => {
  return window.crypto;
};

export const createRandomString = () => {
  const charset =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.";
  let random = "";
  const randomValues = Array.from(
    getCrypto().getRandomValues(new Uint8Array(43))
  );
  randomValues.forEach((v) => (random += charset[v % charset.length]));
  return random;
};

export const encode = (value: string) => btoa(value);
export const decode = (value: string) => atob(value);

const dedupe = (arr: string[]) => Array.from(new Set(arr));

/**
 * @ignore
 */
export const getUniqueScopes = (...scopes: (string | undefined)[]) => {
  return dedupe(scopes.filter(Boolean).join(" ").trim().split(/\s+/)).join(" ");
};

export const sha256 = async (s: string) => {
  const digestOp: any = getCrypto().subtle.digest(
    { name: "SHA-256" },
    new TextEncoder().encode(s)
  );

  return await digestOp;
};

const urlEncodeB64 = (input: string) => {
  const b64Chars: { [index: string]: string } = { "+": "-", "/": "_", "=": "" };
  return input.replace(/[+/=]/g, (m: string) => b64Chars[m]);
};

export const bufferToBase64UrlEncoded = (input: number[] | Uint8Array) => {
  const ie11SafeInput = new Uint8Array(input);
  return urlEncodeB64(
    window.btoa(String.fromCharCode(...Array.from(ie11SafeInput)))
  );
};

const stripUndefined = (params: any) => {
  return Object.keys(params)
    .filter((k) => typeof params[k] !== "undefined")
    .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});
};

export const createQueryParams = ({ clientId: client_id, ...params }: any) => {
  return new URLSearchParams(
    stripUndefined({ client_id, ...params })
  ).toString();
};

export const runIframe = (
  authorizeUrl: string,
  timeoutInSeconds: number = DEFAULT_AUTHORIZE_TIMEOUT_IN_SECONDS
) => {
  return new Promise<AuthenticationResult>((res, rej) => {
    const iframe = window.document.createElement("iframe");

    iframe.setAttribute("width", "500");
    iframe.setAttribute("height", "500");

    const removeIframe = () => {
      if (window.document.body.contains(iframe)) {
        window.document.body.removeChild(iframe);
        window.removeEventListener("message", iframeEventHandler, false);
      }
    };

    let iframeEventHandler: (e: MessageEvent) => void;

    const timeoutSetTimeoutId = setTimeout(() => {
      //rej(new TimeoutError());
      //removeIframe();
    }, timeoutInSeconds * 1000);

    iframeEventHandler = function (e: MessageEvent) {
      if (!e.data || e.data.type !== "authorization_response") return;

      const eventSource = e.source;

      if (eventSource) {
        (eventSource as any).close();
      }

      e.data.response.error
        ? rej(GenericError.fromPayload(e.data.response))
        : res(e.data.response);

      clearTimeout(timeoutSetTimeoutId);
      window.removeEventListener("message", iframeEventHandler, false);

      setTimeout(removeIframe, CLEANUP_IFRAME_TIMEOUT_IN_SECONDS * 1000);
    };

    window.addEventListener("message", iframeEventHandler, false);
    window.document.body.appendChild(iframe);
    iframe.setAttribute("src", authorizeUrl);
  });
};

export const getAuthorizeParams = (
  clientOptions: ClientOptions,
  scope: string,
  authorizationParams: AuthParams,
  state: string,
  nonce: string,
  code_challenge: string,
  redirect_uri?: string,
  response_mode?: string
): AuthorizeOptions => {
  return {
    client_id: clientOptions.clientId,
    scope: getUniqueScopes(scope, authorizationParams.scope),
    response_type: "code",
    response_mode: response_mode || "query",
    state,
    nonce,
    redirect_uri: redirect_uri || clientOptions.authParams?.redirectUri,
    code_challenge,
    code_challenge_method: "S256",
  };
};

export const parseAuthenticationResult = (
  queryString: string
): AuthenticationResult => {
  if (queryString.indexOf("#") > -1) {
    queryString = queryString.substring(0, queryString.indexOf("#"));
  }

  const searchParams = new URLSearchParams(queryString);

  return {
    state: searchParams.get("state")!,
    code: searchParams.get("code") || undefined,
    error: searchParams.get("error") || undefined,
    error_description: searchParams.get("error_description") || undefined,
  };
};

const cacheLocationBuilders: Record<string, () => ICache> = {
  memory: () => new InMemoryCache().enclosedCache,
  localstorage: () => new LocalStorageCache(),
};

export const cacheFactory = (location: string) => {
  return cacheLocationBuilders[location];
};

export const buildIsAuthenticatedCookieName = (clientId: string) =>
  `processcube.authority.${clientId}.is.authenticated`;
