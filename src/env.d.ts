// adds typing to process.env.xxx, see usage in config.ts
export declare var process: {
  env: IEnv;
};

// for env var types only
export interface IEnv extends ISecrets, IDevSecrets {
  // FOLLOWING ENVs - are used by both functions and api server:

  build: "dev" | "prod";

  portal_url: string;

  port?: string;

  // used by tests
  cicd: "local" | "githubaction";

  // see https://cloud.google.com/appengine/docs/standard/nodejs/runtime#environment_variables
  // for default GCP env vars
  gcp_project_number: string; 

  GOOGLE_APPLICATION_CREDENTIALS: string;
  firebase_database_url: string;
}

interface IDevSecrets {
  // used locally for development (development only)
  // ...
}

export interface ISecrets {
  // the following will be set and retrieved via Secret Manager
}

export interface IGlobal {
  database_started: boolean;
  initialized_firebase: boolean;
}
