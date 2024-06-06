import express from 'express';
import open = require('open');
import { getModalHtml } from './html_message';

export type IdTokenAccessTokenAndExpiresAt = {
  accessToken: string;
  idToken: string;
  expiresAt: number;
};

const DEFAULT_PORT = 12560;
const DEFAULT_CLIENT_ID = 'pc_cli';
const DEFAULT_SCOPE = 'openid profile test_resource';
const DEFAULT_RESPONSE_TYPE = 'id_token token';

export function startServerToLoginAndWaitForAccessTokenFromIdentityServer(
  identityServerUrl: string,
  givenPort?: number,
  givenClientId?: string,
  givenResponseType?: string,
  givenScope?: string
): Promise<IdTokenAccessTokenAndExpiresAt | null> {
  return new Promise((resolve: Function, reject: Function) => {
    const app = express();
    const port = givenPort ?? DEFAULT_PORT;
    const clientId = givenClientId ?? DEFAULT_CLIENT_ID;

    app.get('/login', async (req, res) => {
      const redirectUri = `http://localhost:${port}/signin-oidc`;
      const scope = givenScope ?? DEFAULT_SCOPE;
      const responseType = givenResponseType ?? DEFAULT_RESPONSE_TYPE;
      const state = Math.random().toString(36);
      const nonce = Math.random().toString(36);

      const params = `client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=${encodeURIComponent(responseType)}&scope=${encodeURIComponent(
        scope
      )}&state=${encodeURIComponent(state)}&nonce=${encodeURIComponent(nonce)}&display=popup`;

      const discoveryUri = `${identityServerUrl.replace(/\/$/, '')}/.well-known/openid-configuration`;

      const result = await fetch(discoveryUri);
      const payload = await result.json();

      const connectUri = `${payload.authorization_endpoint}?${params}`;

      console.log(`Connecting to ${connectUri}`);

      res.redirect(connectUri);
    });

    app.get('/signin-oidc', (req, res) => {
      res.send(`
        <script>
          var hashWithoutHash = window.location.hash.substr(1);
          window.location.href = '/signin-oidc-extract?'+hashWithoutHash;
        </script>
      `);
    });
    app.get('/signin-oidc-extract', (req, res) => {
      const accessToken = req.query.access_token;
      const idToken = req.query.id_token;
      const expiresInSeconds = parseInt(req.query.expires_in as string);
      const expiresAt = Date.now() + expiresInSeconds * 1000;

      res.set('Connection', 'close');
      res.send(
        getModalHtml(
          `
          <div class="icon icon--login">
            <svg style="width:48px;height:48px" viewBox="0 0 48 48">
              <g transform="scale(2)">
                <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z" />
              </g>
            </svg>
          </div>
          `,
          `
          <b>You can close this browser tab now.</b>

          Continue this session in your terminal.`,
          `
          # You are now logged in!

          $ pc list-process-models

          $ pc list-process-instances

          $ pc --help
          `
        )
      );

      resolve({ accessToken, idToken, expiresAt });
    });

    app.listen(port, () => {
      const url = `http://localhost:${port}/login`;
      console.log(`\nIf your web browser does not open automatically, open this link manually to login: ${url}`);
      open(url);
    });
  });
}
