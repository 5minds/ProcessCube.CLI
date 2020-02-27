import * as express from 'express';
import open = require('open');
import { getModalHtml } from '../login/html_message';

export type AccessTokenAndExpiresAt = {
  accessToken: string;
  expiresAt: number;
};

const DEFAULT_PORT = 9000; // 56073;
const DEFAULT_CLIENT_ID = 'bpmn_studio';

export function startServerToLogoutAndWaitForSessionEnd(
  identityServerUrl: string,
  idToken: string,
  givenPort?: number,
  givenClientId?: number
): Promise<AccessTokenAndExpiresAt | null> {
  return new Promise((resolve: Function, reject: Function) => {
    const app = express();
    const port = givenPort ?? DEFAULT_PORT;

    app.get('/logout', (req, res) => {
      const redirectUri = `http://localhost:${port}/signout-oidc`;

      const params = `id_token_hint=${encodeURIComponent(idToken)}&post_logout_redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;
      const uri = `${identityServerUrl.replace(/\/$/, '')}/connect/endsession?${params}`;

      res.redirect(uri);
    });

    app.get('/signout-oidc', (req, res) => {
      res.set('Connection', 'close');
      res.send(getModalHtml('You can close this browser tab now and continue your session in the terminal.'));

      resolve();
    });

    app.listen(port, () => {
      const url = `http://localhost:${port}/logout`;
      console.log(`\nIf your web browser does not open automatically, open this link manually to logout: ${url}`);
      open(url);
    });
  });
}
