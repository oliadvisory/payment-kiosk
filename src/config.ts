import cors from "cors";
import express from "express";
import { IEnv } from "./env";
const helmet = require("helmet");
import * as bodyParser from "body-parser";
import _ from "lodash";
import admin from "firebase-admin";
import { IRequest } from "./http";
import { fetchSecrets } from "./secret-manager";
import { TimeWatchers } from "./time/timeWatchers";

declare var process: {
  env: IEnv;
};

export class Config {
  app: express.Application;
  private allowedOrigins: string[];
  build: "prod" | "dev";

  constructor() {
    // init express app
    this.app = express();

    this.build = process.env.build as "prod" | "dev";

    // set origins
    this.setEnv();

    // this.app.use(this.rawBody);

    // set cors for specified origins
    // enable selective origins:
    // this.app.use(this.setCorsConfig())
    // enable all origins:
    this.app.use(cors());

    // initialize managed services
    this.startServices();

    // parse application/x-www-form-urlencoded
    this.app.use(bodyParser.urlencoded({ extended: false }));

    // parse application/json
    this.app.use(
      bodyParser.json({
        verify: this.rawBody,
      })
    );

    // init arr
    this.allowedOrigins = [];
  }

  private rawBody(
    req: IRequest | any,
    res: express.Response,
    buf: Buffer,
    encoding: string
  ) {
    if (buf && buf.length) {
      req.rawBody = buf.toString("utf8");
    }
  }

  private async loadSecrets() {
    const secretsLoaded = _.get(global, "secrets_loaded", false);
    // get container secrets from secret manager
    if (!secretsLoaded) {
      // update global value denoting that secrets are loaded
      _.set(global, "secrets_loaded", true);

      // load secrets from secret manager
      await fetchSecrets();
    }
  }

  private startWatchers() {
    const watchersStarted = _.get(global, "watchers_started", false);
    if (!watchersStarted) {
      // update global value denoting that watchers are started
      _.set(global, "watchers_started", true);
      // start watchers
      new TimeWatchers().watchPaymentsForCheckout();
    }
  }

  private initFirebase() {
    const firebaseInitialized = _.get(global, "initialized_firebase", false);
    if (!firebaseInitialized) {
      // update global value denoting that firebase is initialized
      _.set(global, "initialized_firebase", true);

      // initialize firebase app
      // https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application
      // https://firebase.google.com/docs/admin/setup#add_firebase_to_your_app
      // console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)

      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: process.env.firebase_database_url,
      });
    }
  }

  private async startServices() {
    await this.loadSecrets();
    this.initFirebase();
    this.startWatchers();
  }

  private setEnv() {
    // setup configs based on build target
    if (process.env.build === "dev") {
      // Development configurations
      this.devConfig();
    } else {
      // Production configurations
      this.prodConfig();
    }
  }

  private prodConfig() {
    // set basic security related middleware
    // https://expressjs.com/en/advanced/best-practice-security.html
    this.app.use(helmet());

    // view logs to ensure proper deployment
    console.info("===> Running PRODUCTION Configuration <===");

    // cors domains to allow
    this.allowedOrigins = [
      process.env.portal_url,
      process.env.portal_url + "/",
    ];

    this.app.use((req, res, next) => {
      const allowedOrigins = this.allowedOrigins;
      const origin = req.headers.origin as string;
      if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      }
      res.header(
        "Access-Control-Allow-Methods",
        "GET, PUT, POST, OPTIONS, DELETE"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
      return next();
    });
  }

  private devConfig() {
    try {
      this.app.use(
        helmet({
          hsts: false,
        })
      );

      // view logs to ensure proper deployment
      console.info("===> Running DEVELOPMENT Configuration <===");

      // not a production build, so add testing domains to cors
      this.allowedOrigins = [
        // angular app request
        "http://localhost:4200",
        "http://localhost:4200/",

        // express app
        "http://localhost:3000",
        "http://localhost:3000/",

        // google cloud function emulator
        "http://localhost:8010",
        "http://localhost:8010/",
      ];

      this.app.use((req, res, next) => {
        const allowedOrigins = this.allowedOrigins;
        const origin = req.headers.origin as string;
        if (allowedOrigins.indexOf(origin) > -1) {
          res.setHeader("Access-Control-Allow-Origin", origin);
        }
        res.header(
          "Access-Control-Allow-Methods",
          "GET, PUT, POST, OPTIONS, DELETE"
        );
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        res.header("Access-Control-Allow-Credentials", "true");
        return next();
      });
    } catch (error) {
      console.error(error);
    }
  }

  // private setCorsConfig(): express.RequestHandler {

  //     // https://github.com/expressjs/cors

  //     // set cors configuration for all routes
  //     return cors({
  //         origin: (origin, callback) => {
  //             // allow requests with no origin
  //             // (like mobile apps or curl requests)
  //             if (!origin) {
  //                 return callback(null, true)
  //             }

  //             if (this.allowedOrigins.indexOf(origin) === -1) {
  //                 const msg = 'The CORS policy for this site does not ' +
  //                     'allow access from the specified Origin.'
  //                 return callback(new Error(msg), false)
  //             }

  //             return callback(null, true)
  //         }
  //     })

  // }
}
