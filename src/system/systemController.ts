import { Controller, Get, Route, Security } from "tsoa";

@Route("system")
export class SystemController extends Controller {
  @Get("ping")
  public async ping(): Promise<string> {
    this.setStatus(201);
    return "hello from server";
  }
  @Security("auth-test")
  @Get("fake")
  public async testAuth(): Promise<string> {
    this.setStatus(201);
    return "authentication success!";
  }
}
