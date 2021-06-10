import _ from "lodash";
import moment from "moment";
import { Database, IPayment, IWashCycle, IWashTime } from "../db/context";

export class Carwash {
  // TODO: set as env var
  private pricePerMinute = 0.66666667;
  private db: Database;
  constructor() {
    this.db = new Database();
  }

  calcTime(usd: number) {
    // determine minutes paid for
    const minutesFractional = usd / this.pricePerMinute;
    const minutes: number = Math.floor(Number(minutesFractional));
    // const seconds: number = Number(((minutesFractional % 1) * 60).toFixed(2));
    const seconds: number = Math.floor((minutesFractional % 1) * 60);
    return {
      m: minutes,
      s: seconds,
    };
  }

  async paymentCrypto(
    usd: number,
    checkoutId: string,
    receivedAt: number,
    crypto?: {
      id: string;
      asset: string;
      amount: number;
    }
  ) {
    const bay = await this.db.getBayForCryptoCheckout(checkoutId);
    return await this.payment({
      kind: "crypto",
      usd: usd,
      bay,
      receivedAt,
      crypto,
    });
  }

  async paymentCash(usd: number, bay: 1 | 2 | 3 | 4 | 5, receivedAt: number) {
    return await this.payment({ kind: "cash", usd: usd, bay, receivedAt });
  }

  async paymentCard(usd: number, bay: 1 | 2 | 3 | 4 | 5, receivedAt: number) {
    return await this.payment({ kind: "card", usd: usd, bay, receivedAt });
  }

  private async payment(payment: IPayment) {
    await this.db.recordPayment(payment);
    const time = this.calcTime(payment.usd);
    await this.startWash(payment.bay, time);
    return;
  }

  async startWash(bay: number, time: IWashTime) {
    // record now
    const now = Number(moment().format("X"));

    // calc additional time in seconds
    const addSeconds = time.m * 60 + time.s;

    // query the last end time
    const lastRecord = await this.db.getLastWashTime(bay);

    let lastEnd = 0;
    if (lastRecord) {
      lastEnd = _.toArray(lastRecord)[0].end;
    }

    // start should be greater of either now or the previously paid for end time
    const start = Math.max(now, lastEnd);

    // add time
    const end = start + addSeconds;

    const washCycle: IWashCycle = {
      now,
      addSeconds,
      lastEnd,
      start,
      end,
    };
    await this.db.addWashTime(bay, washCycle);
    return;
  }
}
