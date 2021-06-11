import _ from "lodash";
import moment from "moment";
import { Database } from "../db/context";
import { ITimeClock, ITimeCycle } from "./time";

export class Time {
  private db: Database;
  constructor() {
    this.db = new Database();
  }

  async calcTime(
    checkoutId: string,
    duration: "min",
    usd: number
  ): Promise<ITimeClock> {
    // get price for the checkoutId and duration
    const pricePerMin = await this.db.getTimePricing({ checkoutId, duration });

    // determine minutes paid for
    const minutesFractional = usd / pricePerMin;

    // calc mins an seconds
    const minutes: number = Math.floor(Number(minutesFractional));
    const seconds: number = Math.floor((minutesFractional % 1) * 60);
    return {
      m: minutes,
      s: seconds,
    };
  }

  async startCycle(checkoutId: string, time: ITimeClock) {
    // record now
    const now = Number(moment().format("X"));

    // calc additional time in seconds
    const addSeconds = time.m * 60 + time.s;

    // query the last end time
    const lastRecord = await this.db.getLastCycleTime(checkoutId);

    let lastEnd = 0;
    if (lastRecord) {
      lastEnd = _.toArray(lastRecord)[0].end;
    }

    // start should be greater of either now or the previously paid for end time
    const start = Math.max(now, lastEnd);

    // add time
    const end = start + addSeconds;

    const cycle: ITimeCycle = {
      now,
      addSeconds,
      lastEnd,
      start,
      end,
    };
    await this.db.addCycleTime(checkoutId, cycle);
    // TODO: run raspberry pi until end time has expired
    return;
  }
}
