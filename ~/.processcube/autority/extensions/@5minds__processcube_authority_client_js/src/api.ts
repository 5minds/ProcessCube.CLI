import {
  GenericError,
  MfaRequiredError,
  MissingRefreshTokenError,
} from "./errors";
import {
  FetchOptions,
  TokenEndpointOptions,
  TokenEndpointResponse,
} from "./models";
import { createQueryParams } from "./utils";

const DEFAULT_SILENT_TOKEN_RETRY_COUNT = 3;

const createAbortController = () => new AbortController();

export async function oauthToken({
  baseUrl,
  timeout,
  audience,
  scope,
  auth0Client,
  useFormData,
  ...options
}: TokenEndpointOptions) {
  const body = useFormData
    ? createQueryParams(options)
    : JSON.stringify(options);

  return await getJSON<TokenEndpointResponse>(
    `${baseUrl}/token`,
    timeout,
    audience || "default",
    scope,
    {
      method: "POST",
      body,
      headers: {
        "Content-Type": useFormData
          ? "application/x-www-form-urlencoded"
          : "application/json",
      },
    }
  );
}

const dofetch = async (fetchUrl: string, fetchOptions: FetchOptions) => {
  const response = await fetch(fetchUrl, fetchOptions);

  return {
    ok: response.ok,
    json: await response.json(),
  };
};

const fetchWithTimeout = async (
  fetchUrl: string,
  fetchOptions: FetchOptions,
  timeout: number
) => {
  const controller = createAbortController();
  fetchOptions.signal = controller.signal;

  let timeoutId: any;

  // The promise will resolve with one of these two promises (the fetch or the timeout), whichever completes first.
  return Promise.race([
    dofetch(fetchUrl, fetchOptions),

    new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error("Timeout when executing 'fetch'"));
      }, timeout);
    }),
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

export async function getJSON<T>(
  url: string,
  timeout: number | undefined,
  audience: string,
  scope: string,
  options: FetchOptions
): Promise<T> {
  let fetchError: null | Error = null;
  let response: any;

  for (let i = 0; i < DEFAULT_SILENT_TOKEN_RETRY_COUNT; i++) {
    try {
      response = await fetchWithTimeout(url, options, timeout!);
      fetchError = null;
      break;
    } catch (e: any) {
      // Fetch only fails in the case of a network issue, so should be
      // retried here. Failure status (4xx, 5xx, etc) return a resolved Promise
      // with the failure in the body.
      // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
      fetchError = e;
    }
  }

  if (fetchError) {
    throw fetchError;
  }

  const {
    json: { error, error_description, ...data },
    ok,
  } = response;

  if (!ok) {
    const errorMessage =
      error_description || `HTTP error. Unable to fetch ${url}`;

    if (error === "mfa_required") {
      throw new MfaRequiredError(error, errorMessage, data.mfa_token);
    }

    if (error === "missing_refresh_token") {
      throw new MissingRefreshTokenError(audience, scope);
    }

    throw new GenericError(error || "request_error", errorMessage);
  }

  return data;
}
