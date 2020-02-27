import * as express from 'express';
import open = require('open');
import { getModalHtml } from './html_message';

export type IdTokenAccessTokenAndExpiresAt = {
  accessToken: string;
  idToken: string;
  expiresAt: number;
};

const DEFAULT_PORT = 9000; // 56073;
const DEFAULT_CLIENT_ID = 'bpmn_studio';

export function startServerToLoginAndWaitForAccessTokenFromIdentityServer(
  identityServerUrl: string,
  givenPort?: number,
  givenClientId?: number
): Promise<IdTokenAccessTokenAndExpiresAt | null> {
  return new Promise((resolve: Function, reject: Function) => {
    const app = express();
    const port = givenPort ?? DEFAULT_PORT;
    const clientId = givenClientId ?? DEFAULT_CLIENT_ID;

    app.get('/login', (req, res) => {
      const redirectUri = `http://localhost:${port}/signin-oidc`;
      const scope = 'openid profile test_resource';
      const responseType = 'id_token token';
      const state = Math.random().toString(36);
      const nonce = Math.random().toString(36);

      const params = `client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=${encodeURIComponent(responseType)}&scope=${encodeURIComponent(
        scope
      )}&state=${encodeURIComponent(state)}&nonce=${encodeURIComponent(nonce)}&display=popup`;
      const uri = `${identityServerUrl.replace(/\/$/, '')}/connect/authorize?${params}`;

      res.redirect(uri);
    });

    app.get('/signin-oidc', (req, res) => {
      res.send(`
        <script>
          var hashWithoutHash = window.location.hash.substr(1);
          var pairs = hashWithoutHash.split("&");
          var accessToken = pairs.find(function (pair) {
            return pair.startsWith('access_token=')
          }).replace(/^access_token=/, '');
          var idToken = pairs.find(function (pair) {
            return pair.startsWith('id_token=')
          }).replace(/^id_token=/, '');
          var expiresIn = pairs.find(function (pair) {
            return pair.startsWith('expires_in=')
          }).replace(/^expires_in=/, '');

          window.location.href = '/signin-oidc-done/'+expiresIn+'/'+accessToken+'/'+idToken;
        </script>
      `);
    });

    app.get('/signin-oidc-done/:expires_in/:access_token/:id_token', (req, res) => {
      const accessToken = req.params.access_token;
      const idToken = req.params.id_token;
      const expiresInSeconds = parseInt(req.params.expires_in);
      const expiresAt = Date.now() + expiresInSeconds * 1000;

      res.set('Connection', 'close');
      res.send(
        getModalHtml(
          `
        <b>You can close this browser tab now.</b>

        Continue this session in your terminal.`,
          `
        # You are now logged in!

        $ atlas list-process-models

        $ atlas list-process-instances

        $ atlas --help
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
