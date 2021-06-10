export interface ITimeClock {
  m: number;
  s: number;
}

export interface ITimeCycle {
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

export interface ITimePricingGet {
  checkoutId: string;
  duration: "min" | "sec";
}
