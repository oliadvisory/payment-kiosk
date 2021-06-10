import * as coinbase from "coinbase-commerce-node";
import moment from "moment";
import { Carwash } from "../kiosk/kiosk";
import { IEnv } from "../env";
import { CommonError } from "../err";

declare var process: {
  env: IEnv;
};

export class CoinbaseService {
  private client = coinbase.Client;
  private carwash: Carwash;

  constructor() {
    this.carwash = new Carwash();
    if (process.env.coinbase_commerce_api_key) {
      this.client.init(process.env.coinbase_commerce_api_key);
    } else {
      new CommonError("missing coinbase API Key", "coinbase");
    }
  }

  async handleEvent(event: coinbase.EventResource<coinbase.ChargeResource>) {
    if (event.type === "charge:pending") {
      console.log(`bay - ${event.data.description}`);

      // Checkout will always be associated with specific bay
      let checkout = "";
      if (event.data.checkout?.id) {
        checkout = event.data.checkout.id;
      }
      const usd = Number(event.data.payments[0].value.local.amount);
      const currency = event.data.payments[0].value.crypto.currency;
      const amount = Number(event.data.payments[0].value.crypto.amount);
      const now = Number(moment().format("x"));

      // save the payment event (which will trigger the carwash)
      await this.carwash.paymentCrypto(usd, checkout, now, {
        id: event.data.id,
        asset: currency,
        amount,
      });
      return;
    } else {
      // not a pending charge, do nothing...
    }
  }
}
