// good explanation of error handling - see https://stackify.com/node-js-error-handling/
// nodejs - see https://www.joyent.com/node-js/production/design/errors
// best practices with typescript - see https://joefallon.net/2018/09/typescript-try-catch-finally-and-custom-errors/

import _ from "lodash";
import { randString } from "./utils";

// When should I restart by throwing and unhandled exception?
// When an handling and recovering from and error is not possible.

// When should I use "throw"?
// Use throw when you want to stop the program/application.
// The nearest catch that JavaScript finds is where the
// thrown exception will emerge. If no try/catch is found,
// the exception throws, and the Node.js process will exit,
// causing the server to restart.

// When should I use new Error()?
// Use Error objects (or subclasses) for ALL errors.
// You should provide name and message properties, and
// stack should work too (and be accurate).

class BaseError extends Error {
  // random identifier is used for when someone wants to call in with a specific
  // unique error code we can search the logs to pin-point the problem in log output
  public id?: string;
  public stringify: string;

  constructor(
    public message: string,
    public kind?: "auth" | "unexpected" | string,
    public data?: any
  ) {
    super(message);

    // can be used to pass unique id back to client,
    // this allows user to call in and provide the error code
    // so that we can look-up in the logs what they are specifically
    // referring to
    this.id = randString(8, ["lowercase", "numbers"]);

    const responseBodyObj = {
      id: this.id, // randomly generated
      message: message, // required
    };

    // set if available
    if (data) {
      _.set(responseBodyObj, "data", data);
    }
    if (kind) {
      _.set(responseBodyObj, "kind", kind);
    }

    // stringify error response
    this.stringify = JSON.stringify(responseBodyObj);

    return this;
  }
}

export class CommonError extends BaseError {
  constructor(message: string, kind?: string, data?: any) {
    super(message, data, kind);
    // do something...
    return this;
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string, data?: any) {
    super(message, data, "auth");
    // do something...
    return this;
  }
}
