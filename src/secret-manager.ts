// based from https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets

import { IEnv } from "./env";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import _ from "lodash";

// secret-manager.ts should only access secrets.
// The api should NEVER have the ability to write/update secrets. This is because the
// system admin will be manually provisioning secrets thought the GCP UI Console.
// The API should only consume these configurations via the secret manager.
// NOTE: signing keys and their material will be managed through KMS. This prevents an
// admin from viewing customer signing key material.

/**
 * example secret naming:
 */
// const name = 'projects/my-project/secrets/my-secret/versions/5';
// const name = 'projects/my-project/secrets/my-secret/versions/latest';

declare var process: {
  env: IEnv;
};

export async function fetchSecrets() {
  try {
    console.info("secrets loading...");

    // Instantiates a client
    const client = new SecretManagerServiceClient();

    const names = [
      // // see secrets from /env.d.ts ISecrets
      "coinbase_commerce_api_key",
      "coinbase_commerce_webhook_secret",
    ];

    for (const i of names) {
      const [version]: any = await client.accessSecretVersion({
        name: `projects/${process.env.gcp_project_number}/secrets/${i}/versions/latest`,
      });

      // Extract the payload as a string.
      //   const payload = version.payload.data.toString('utf8')
      const payload = version.payload.data.toString();

      // WARNING: Do not print the secret in a production environment - this
      // snippet is showing how to access the secret material.
      if (process.env.build === "dev") {
        console.info(`secret payload for ${i}: ${payload}`);
      }

      // Set the environment variable in runtime memory
      // here. Alternatively we could retrieve secrets
      // on every use however that would be costly,
      // impact performance, and be redundant. Especially since
      // some configurations persist - such as the firebase credential  Either way the secrets go
      // into temporary memory
      if (payload) {
        _.set(process.env, i, payload);
      } else {
        console.error(`secret is empty for ${i}`);
      }
    }

    console.info("done, secrets successfully loaded");
  } catch (error) {
    console.error("failed load secrets at runtime: ", error);
  }
}
