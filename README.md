# Payment Server  
Central backend that watches for payment activity and broadcasts events.

NOTE: Works in conjunction with payment-kiosk using a raspberry-pi to operate logic for a self-service kiosk (such as a DIY Carwash)

## Getting Started

```bash

# IMPORTANT! Requires few secrets and environment variable to run locally. See details at env.d.ts

# Install project dependencies (one time only)
npm i

# build
npm run build

# start up the server
npm start # or f5 to debug in vscode

# deploy to google app engine 
# NOTE: requires GCP GAE and Secrets setup
# see secrets discussion below and app.yaml
npm run deploy
```

# Architecture

## API Server (Back-end)

The application level architecture for this API utilizes a controller based approach to contain the logic for all endpoints. Javascript decorators in controllers are used by TSOA (the api framework) to generate OpenAPI/swagger documentation. The middleware.ts contains all the middleware logic for this application

## Secret Manager
The api should NEVER have the ability to write/update secrets. The API should only consume these configurations via the secret manager. The system admin will be manually provisioning secrets thought cloud UI Console. This project makes use of GCPs secret manager and integrates securely with App-engine.

# FAQs
1. **Question**  
_I'm getting a common error when trying to run my app from launch.json. `Cannot find runtime 'node' on path. Is 'node' installed?`_   
<img src="screenshots/error1.png" width="300" />    
**Answer**  
* *Using Ubuntu*: You must be a user with node in it's path. In this case, I (the logged in user) have `node` in my path but the root user does not. So I simply need to open up vscode from a terminal via `code .` to fix this error.  
* You can try to add node to the /usr/bin via `sudo cp ~/.nvm/versions/node/[VERSION_HERE]/bin/node /usr/bin`
or add to your path via `export PATH=$PATH:~/.nvm/versions/node/[VERSION_HERE]/bin/node
`
* *Using WSL*: Type `which node` in terminal to find the node path. And replace the following lines of code in the launch.json  
```json
"runtimeExecutable": "~/.nvm/versions/node/SOME_VERSION/bin/node"
```

2. **Question**  
_How do I set environment variables on by firebase functions deployments?_   
**Answer**  
`firebase functions:config:set beskar.key="THE API KEY" beskar.id="THE CLIENT ID"`  
See details at https://firebase.google.com/docs/functions/config-env  

3. **Question**  
_Firebase credential is not initializing and indicating that there is a time sync issue?_   
**Answer**  
See and run instructions here if using WSL https://github.com/microsoft/WSL/issues/4149#issuecomment-521877012  `sudo ntpdate -sb time.nist.gov`

4. **Question**  
_How do I assign permissions (ie: service account) to my firebase functions deployment? So functions can access other gcloud services like KMS?_   
**Answer**  
Functions makes use of the App Engine default service account usually named `YOUR_PROJECT_ID@appspot.gserviceaccount.com`. Simply add permissions to this service account for the gcloud services you would like your functions to access like KMS encrypt and decrypt roles. See https://cloud.google.com/appengine/docs/standard/nodejs/service-account

5. **Question**  
_Why is there both postman definition files and OpenAPI (formerly Swagger) definition files for the project maintained separately?_   
**Answer**  
Unfortunately, OpenAPI is not as extensive as OpenAPI (formerly Swagger). And while Postman can import OpenAPI definitions it does not do a good job parsing all the OpenAPI fields. Specifically, the Postman default values in cannot be populated from the defined OpenAPI `schema.examples`. Furthermore, tests, scripts and environment variables are limited in OpenAPI. For this reason I have decided to use 
* TSOA as a tool to drive the use of common code conventions, consistency, and clarity 
* Postman to interact with endpoints and generate API documentation 
NOTE: Generating documentation via Postman is preferable to OpenAPI definition due to it comprehensiveness and ability to automatically generate a website with comprehensive API documentation)

6. **Question**
_Getting Error: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?_
**Answer**
See https://github.com/docker/for-win/issues/5096#issuecomment-551426331
