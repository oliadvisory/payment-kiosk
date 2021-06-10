import { RegisterRoutes } from "./routes";
import { customResponseHandler } from "./middleware/response";
import { Config } from "./config";

class App {
  private config: Config;
  constructor() {
    const config = new Config();
    RegisterRoutes(config.app);
    customResponseHandler(config.app);
    this.config = config;
  }
  init() {
    return this.config.app;
  }
}

export const app = new App().init();
