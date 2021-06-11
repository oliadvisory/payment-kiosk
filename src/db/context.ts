import * as admin from "firebase-admin";
import moment from "moment";
import { ITimeCycle, ITimePricingGet } from "../time/time";

export class Database {
  private db: admin.database.Database;
  private pricingRef: admin.database.Reference;
  private paymentsRef: admin.database.Reference;

  constructor() {
    this.db = admin.database();
    this.pricingRef = this.db.ref(`time/price`);
    this.paymentsRef = this.db.ref(`payment`);
  }

  private getTimeCycleRef(checkoutId: string): admin.database.Reference {
    return this.db.ref(`time/cycle/${checkoutId}`);
  }

  // async getCheckoutDetails(checkoutId: string): Promise<1 | 2 | 3 | 4 | 5> {
  //   const bay = (
  //     await this.db.ref(`checkoutMap/${checkoutId}`).once("value")
  //   ).val() as any;
  //   return bay;
  // }

  async getLastCycleTime(
    checkoutId: string
  ): Promise<{ [timestamp: string]: ITimeCycle }> {
    // query the last end time
    const lastRecord = (
      await this.getTimeCycleRef(checkoutId)
        .orderByKey()
        .limitToLast(1)
        .once("value")
    ).val() as any;
    return lastRecord;
  }

  async addCycleTime(checkoutId: string, timeCycle: ITimeCycle): Promise<void> {
    const nowMs = moment().format("x");
    await this.getTimeCycleRef(checkoutId).child(nowMs).set(timeCycle);
    return;
  }

  async getTimePricing(obj: ITimePricingGet): Promise<number> {
    return await (
      await this.pricingRef
        .child(`${obj.checkoutId}/${obj.duration}`)
        .once("value")
    ).val();
  }

  async updatePaymentProcessing(
    paymentId: string,
    status: "received" | "fulfilling" | "completed"
  ) {
    await this.paymentsRef.child(`${paymentId}/processing`).set(status);
    return;
  }
}
