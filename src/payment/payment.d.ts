export interface IPayment {
    kind: "cash" | "crypto" | "card";
    usd: number;
    // id that indicates details regarding the purchased item
    checkoutId: string;
    receivedAt: number;
    crypto?: {
      id: string;
      asset: string;
      amount: number;
    };
    processing?: number | string
  }