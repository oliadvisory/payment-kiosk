// see usage docs here https://github.com/lukeautry/tsoa#security
// See routes.ts for implementation of the expressAuthentication() function

import * as _ from "lodash";
import { IRequest } from "../http";
import { AuthenticationError } from "../err";
import { testAuth } from "./security/example-auth";
import { verifySignature } from "./security/coinbase-webhook";

// import { IEnv, IGlobal } from "../env";
// declare var process: {
//   env: IEnv;
// };

// declare var global: IGlobal;

export async function expressAuthentication(
  request: IRequest,
  securityName: string,
  scopes?: string[]
): Promise<{} | void> {
  if (securityName === "auth-test") {
    return testAuth(request, scopes);
  }

  if (securityName === "coinbase-webhook") {
    return verifySignature(request);
  }

  // default response to reject if not previously resolved
  const e = new AuthenticationError("failed to match security name");
  request.res.status(401).json({ error: e });
  return Promise.reject({});
}
