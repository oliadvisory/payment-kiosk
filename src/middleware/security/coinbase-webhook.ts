import { CommonError } from "../../err";
import { IRequest } from "../../http";
import * as coinbase from "coinbase-commerce-node";

export const verifySignature = (request: IRequest) => {
  console.log("trying to verify....");
  try {
    const client = coinbase.Client;
    const webhook = coinbase.Webhook;
    const sharedSecret = process.env.coinbase_commerce_webhook_secret as string;
    const apiKey = process.env.coinbase_commerce_webhook_secret as string;
    if (apiKey && process.env.coinbase_commerce_webhook_secret) {
      client.init(apiKey);
    } else {
      new CommonError("Missing coinbase API Key or Webhook Secret", "coinbase");
    }
    webhook.verifySigHeader(
      request.rawBody,
      request.headers["x-cc-webhook-signature"],
      sharedSecret
    );
    return Promise.resolve({});
    // console.log("verified success!");
  } catch (error) {
    // console.log("verification failure");
    const e = new CommonError(
      "failed to verify coinbase webhook signature",
      "coinbase"
    );

    request.res.status(401).send(e.message);
    return Promise.reject({});
  }
};
