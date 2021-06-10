import { IRequest } from "../../http";

export const testAuth = (request: IRequest, scopes?: string[]) => {
  console.log(
    "scope is defined in controller and read at authentication.ts: ",
    scopes
  );

  if (request.headers["x-auth-test"]) {
    // x-auth-test can be anything for illustrative purposes only ...
    // success (via normal return)
    return { data: 'any data to pass to controller here....'};
  }

  // failed (return an custom error and handle via response response.ts )
  const error = {
    message: "you failed authentication",
    data: { some: "failure with authentication" },
  };
  const e = new Error(JSON.stringify(error));
  request.res.status(401).json({ error: e });
  return Promise.reject({});
};
