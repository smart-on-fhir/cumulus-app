# Cumulus Dashboard

## Deploying Docker image
There is a Dockerfile which builds a production image containing compiled
version of the dashboard backend and frontend. This can be used to deploy to
any environment that can work with such images. An additional requirement is to
setup a Postgres 14 database and make sure a `DATABASE_URL` env variable is
provided to the dashboard image while running it.

[Read More](./docker/readme.md)


## Local Installation

***Prerequisites***
1. OS - This app has been only tested on Mac OS and Linux
2. Git - Needs to be available to pull the source code
3. NodeJS - The project currently uses NodeJS 22+ which needs to be pre-installed.
   If you use [nvm](https://github.com/nvm-sh/nvm), then `cd` into the project
   folder and run `nvm use` to automatically select the required node version
4. Docker - A recent version needs to be installed on the host machine


Then get the code and install dependencies:
```
cd /path/to/install/the/dashboard/into
git clone https://github.com/smart-on-fhir/cumulus-app.git
cd cumulus-app
npm i
```

## Configuration
Some environment variables are required and must be set before the app is started.
To simplify the configuration process we have created a script that will ask you for
any required information and generate the configuration files for you. All you need
to do is:
```
./bin/cumulus.ts configure
```
The configuration script will generate a local config file for you named `.env.production.local`,
or `.env.development.local`, or `.env.test.local`. You can run it multiple times to generate all files,
although you typically only need the development settings on local machine.

When you run the configure script for the first time it will create the configuration file.
However, any subsequent runs will NOT override existing config files. Instead, the script
will just display the proposed file contents and even show a diff of which variables have
been changed.


## Build
There is a **build** step that needs to be executed before you start the app for
the first time, as well as after any changes are made to the front-end part of
the code (under `/src`). To do that `cd` into the project folder and run:
```
npm run build
```
Note that build is **only** needed to "apply" code changes and there is no need
to rebuild on every restart.

Another build that happens once is the docker images build. It happens when you
start the instance via docker-compose for the first time. If for any reason you
need to rebuild, `cd docker` and run:
```
docker-compose --env-file='../.env.development.local' up --build 
```

## Run
There are multiple ways to start the dashboard. Production instances are those deployed for public use.
Development instances are started by developers on their local machines in order to test the app or
contribute in some way.

- **Heroku** (or other similar environments)
  1. All the necessary environment variables should be set before deploying
  2. A Postgres database should be available as a service and the `DATABASE_URL` env variable should point to it
  3. The `NODE_ENV` environment variable should be set to `production`
  4. Deploy with Heroku. That should pull the code and run `npm install`, `npm run build`, `npm start`. This should be enough to get a running instance.

- **Using Docker Images**
  1. All the necessary environment variables should be set before deploying
  2. A Postgres database should be available as a service and the `DATABASE_URL` env variable should point to it
  3. The `NODE_ENV` environment variable should be set to `production`
  4. Build and run a production dashboard image. [Details](./docker/readme.md)

- **Development** (on a local machine)
  1. Generate a development env file if you don't have one already - `./bin/cumulus.ts configure`
  2. Run `npm start`
  3. The dashboard will be available at http://localhost:4000 (or whatever HOST/PORT you have configured). However, for front-end development it might be better to run `npm run start:hmr` in separate terminal. This will start a development server with hot-reloading enabled at http://localhost:3000.


## Database Data
Upon installation the dashboard app will have some data pre-inserted. This includes a
few default user accounts, as well as some sample data for testing in case of
development installation. Here are the default user credentials:

|role   |email              |password     |
|-------|-------------------|-------------|
|admin  |admin@cumulus.dev  |Admin@12345  |
|manager|manager@cumulus.dev|Manager@12345|
|user   |user@cumulus.dev   |User@12345   |


**IMPORTANT**: On production systems these user accounts will have to removed and
replaced with real ones. To do so:
1. Login as the default admin
2. Invite another "real" admin
3. Login as the "real" admin
4. Delete old users and invite new ones as needed


## Running Tests
```            
npm test
```

## Important Note for Contributors
This project uses Highcharts for data visualization. Highcharts no longer offers
a free license for non-commercial use. While our team has obtained a commercial
license for development purposes, this license does not extend to individual
users or contributors. Therefore, if you plan to deploy this project, you are
responsible for securing your own Highcharts license.

For more information on Highcharts licensing, please visit the official
[Highcharts licensing page](https://shop.highcharts.com/).

Thank you for your understanding and compliance.
