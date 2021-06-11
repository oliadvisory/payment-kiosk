import * as admin from "firebase-admin";
import { Database } from "../db/context";
import { IPayment } from "../payment/payment";
import { Time } from "./timeService";

export class TimeWatchers {
  private watcher: admin.database.Database;
  private db: Database;
  private paymentsRef: admin.database.Reference;
  private time: Time;

  constructor() {
    this.watcher = admin.database();
    this.time = new Time();
    this.paymentsRef = this.watcher.ref(`payment`);
    this.db = new Database();
  }

  watchPaymentsForCheckout() {
    this.paymentsRef.on(
      "child_added",
      async (snapshot) => {
        const payment: IPayment = snapshot.val();
        const paymentId: string = snapshot.key as string;
        console.log(payment);

        // update processing flag when new payments are received
        await this.db.updatePaymentProcessing(paymentId, "received");

        // calculate how much time to give based on current pricing
        const allowedTime = await this.time.calcTime(
          payment.checkoutId,
          "min",
          payment.usd
        );

        await this.time.startCycle(payment.checkoutId, allowedTime);
      },
      (error) => {
        console.error("failed to watch for payment update");
        console.error(error);
      }
    );
  }
}
