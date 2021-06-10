import { Controller, Post, Route, Security, Body } from "tsoa";
import { CoinbaseService } from "./coinbaseService";
import * as coinbase from "coinbase-commerce-node";

@Route("coinbase")
export class coinbaseController extends Controller {
  private coinbase = new CoinbaseService();

  @Post("webhook")
  @Security("coinbase-webhook")
  public async webhook(@Body() body: any) {
    const event: coinbase.EventResource<coinbase.ChargeResource> = body;
    await this.coinbase.handleEvent(event);
    this.setStatus(201);
    return;
  }

  // @Post("dummy")
  // @Security("coinbase-webhook")
  // public async dummy(@Body() body: any) {
  //   this.setStatus(201);
  //   return;
  // }
}
