import express from 'express';
import open from 'open';

import { getModalHtml } from '../login/html_message';
import { isUrlAvailable } from '../../client/is_url_available';

const DEFAULT_PORT = 9000; // 56073;

export async function startServerToLogoutAndWaitForSessionEnd(
  identityServerUrl: string,
  idToken: string,
  givenPort?: number,
): Promise<boolean> {
  const isAvailable = await isUrlAvailable(identityServerUrl);
  if (isAvailable === false) {
    return false;
  }

  return new Promise((resolve: Function, reject: Function) => {
    const app = express();
    const port = givenPort ?? DEFAULT_PORT;

    app.get('/logout', (req, res) => {
      const redirectUri = `http://localhost:${port}/signout-oidc`;

      const params = `id_token_hint=${encodeURIComponent(idToken)}&post_logout_redirect_uri=${encodeURIComponent(
        redirectUri,
      )}`;
      const uri = `${identityServerUrl.replace(/\/$/, '')}/connect/endsession?${params}`;

      res.redirect(uri);
    });

    app.get('/signout-oidc', (req, res) => {
      res.set('Connection', 'close');
      res.send(
        getModalHtml(
          `
          <div class="icon icon--logout">
            <svg style="width:48px;height:48px" viewBox="0 0 48 48">
              <g transform="scale(2)">
              <path fill="currentColor" d="M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H9.18C9.6,1.84 10.7,1 12,1C13.3,1 14.4,1.84 14.82,3H19M12,3A1,1 0 0,0 11,4A1,1 0 0,0 12,5A1,1 0 0,0 13,4A1,1 0 0,0 12,3M7,7V5H5V19H19V5H17V7H7M12,9A2,2 0 0,1 14,11A2,2 0 0,1 12,13A2,2 0 0,1 10,11A2,2 0 0,1 12,9M8,17V16C8,14.9 9.79,14 12,14C14.21,14 16,14.9 16,16V17H8Z" />
              </g>
            </svg>
          </div>
          `,
          `
          <b>You can close this browser tab now.</b>

          You are now logged out.
          `,
        ),
      );

      resolve();
    });

    app.listen(port, () => {
      const url = `http://localhost:${port}/logout`;
      console.log(`\nIf your web browser does not open automatically, open this link manually to logout: ${url}`);
      open(url);
    });
  });
}
