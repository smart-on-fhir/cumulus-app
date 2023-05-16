# Cumulus Dashboard

## Quick Start

You can get a demo of this app running out of the box with one command: `./build_and_start.sh` This relies on a modern Docker version installed on the host machine. 

| |Demo Login Info|
|-----------|------------------------|
| Site      |  http://localhost:4000 |
|User       | `admin@cumulus.dev`    |  
|Password   |  `Admin@12345`         |


## Setup Your Environment

The `.env` file with this repo includes everything you need to get a demo of the Cumulus System up and running. 
Developers will want to create an `.env.local` file that is not checked into git. This is where you store
secrets and personalized variables such as email addresses. 

Example `.env.local` vars: 
```
    CUMULUS_ADMIN_EMAIL=""
    REGIONAL_CLUSTER_EMAIL=""
    MAILGUN_API_KEY=""
    MAILGUN_DOMAIN="smarthealthit.org"
    APP_EMAIL_FROM="developer@SomeDomain.org"
    DB_SYNC="normal"
```


## Running Tests 

## Local Development (No Docker)

First make sure you have an unix system (Linux or Mac) with Git, Docker and NodeJS 18+.
Node Version Manager helps: 
https://github.com/nvm-sh/nvm

Then do:
```
git clone https://github.com/smart-on-fhir/cumulus-app.git
cd cumulus-app
npm i
```

## Local Environment Configuration
The configuration is done via `.env` files. In the project root folder there is 
a file called `.env` which contains all the environment variables and their
descriptions. However, most of these variables are set to their default values. Many are empty
and are supposed to be overridden. When the application is started, several configuration files
will be loaded and override each other's variables:

1. `.env` - base values for all variables
2. `.env.development` - some overrides for development if started via `npm run start:server:dev`
3. `.env.local` - most variables are set here. Secrets are OK here as this file is git-ignored

To configure new installation make a copy of the file `.env` and rename it to `.env.local`. Then add
your configurations to `.env.local`.


## Running the App
In one terminal run `npm run start:server`. Then open http://localhost:4000/ and
login with one of the following credentials:
- email: `user@cumulus.dev`, password: `User@12345`
- email: `manager@cumulus.dev`, password: `Manager@12345`
- email: `admin@cumulus.dev`, password: `Admin@12345`

For React development using hot-reload server, in a separate terminal run `npm start` and then use `http://localhost:3001/` instead. Keep in mind that any changes you make to the front-end code will appear immediately on http://localhost:3001/, but will not be visible on http://localhost:4000/, until you run `npm run build`.


## Running the test suite

```
npm ci --legacy-peer-deps                
npm run test:server
```
