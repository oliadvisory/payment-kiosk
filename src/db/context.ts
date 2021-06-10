import * as admin from "firebase-admin";
import moment from "moment";

export interface IPayment {
  kind: "cash" | "crypto" | "card";
  usd: number;
  bay: 1 | 2 | 3 | 4 | 5;
  receivedAt: number;
  crypto?: {
    id: string;
    asset: string;
    amount: number;
  };
}

export interface IWashTime {
  m: number;
  s: number;
}

export interface IWashCycle {
  // time right now
  now: number;
  // time to add to the clock (additional purchased time)
  addSeconds: number;
  // Last recorded wash end time (requires query from db)
  lastEnd: number;
  // start is the greater of the lastEnd or now
  start: number;
  // end equals the start + addSeconds
  end: number;
}

export class Database {
  private db: admin.database.Database;

  constructor() {
    this.db = admin.database();
  }

  async getBayForCryptoCheckout(
    checkoutId: string
  ): Promise<1 | 2 | 3 | 4 | 5> {
    const bay = (
      await this.db.ref(`checkoutMap/${checkoutId}`).once("value")
    ).val() as any;
    return bay;
  }

  async recordPayment(payment: IPayment): Promise<void> {
    try {
      await this.db.ref(`payment`).push(payment);
    } catch (error) {
      console.log(error);
    }
    return;
  }

  async getLastWashTime(
    bay: number
  ): Promise<{ [timestamp: string]: IWashCycle }> {
    const ref = this.db.ref(`wash/${bay}`);
    // query the last end time
    const lastRecord = (
      await ref.orderByKey().limitToLast(1).once("value")
    ).val() as any;
    return lastRecord;
  }

  async addWashTime(bay: number, washCycle: IWashCycle): Promise<void> {
    const ref = this.db.ref(`wash/${bay}`);
    const nowMs = moment().format("x");
    await ref.child(nowMs).set(washCycle);
    return;
  }
}
