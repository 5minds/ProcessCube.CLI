import { JwtPayload, jwtDecode } from "jwt-decode";
import { DecodedToken, IdToken, User } from "./models";

const idTokenKeys = [
  "__raw",
  "iss",
  "aud",
  "exp",
  "nbf",
  "iat",
  "jti",
  "azp",
  "nonce",
  "auth_time",
  "at_hash",
  "c_hash",
  "acr",
  "amr",
  "sub_jwk",
  "cnf",
  "sip_from_tag",
  "sip_date",
  "sip_callid",
  "sip_cseq_num",
  "sip_via_branch",
  "orig",
  "dest",
  "mky",
  "events",
  "toe",
  "txn",
  "rph",
  "sid",
  "vot",
  "vtm",
];

export const decodeIdToken = (token: string): DecodedToken => {
  const decoded = jwtDecode(token);

  const idToken: IdToken = {
    __raw: token,
    ...decoded,
  };

  const user: User = {};

  Object.keys(idToken).forEach((key) => {
    if (!idTokenKeys.includes(key)) {
      user[key] = idToken[key];
    }
  });

  const decodedToken: DecodedToken = {
    claims: idToken,
    user: user,
  };

  return decodedToken;
};
