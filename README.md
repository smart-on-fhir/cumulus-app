# Cumulus Dashboard

## Installation

***Prerequisites***
1. OS - This app has been only tested on Mac OS and Linux
2. Git - Needs to be available to pull the source code
3. NodeJS - The project currently uses NodeJS 18 which needs to be pre-installed.
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
The configuration script will generate a local config file for you named `.env.production.local`
or `.env.development.local`. You can run it twice to generate both files, although 
you don't typically need use production settings on local machine and vice versa.

When you run the configure script for the first time it will create configuration files.
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
need to rebuild, `cd docker` and run one of these (depending on what your environment
is and what .env file you have generated):

**for production**
```
docker-compose --env-file='../.env.production.local' up --build
```
**for development**
```
docker-compose --env-file='../.env.development.local' up --build 
```

## Run
There are 4 major ways to start the dashboard. Production instances are those deployed for public use.
Development instances are started by developers on their local machines in order to test the app or
contribute in some way.

- Run **production** instance via **docker-compose**
    1. Prepare (see below)
    2. Make sure a `NODE_ENV` environment variable is set to `production`
    3. Run `npm run start:docker`
- Run **production** instance **manually**
    1. Prepare (see below)
    2. Make sure a `NODE_ENV` environment variable is set to `production`
    3. Run `npm start`
- Run **development** instance via **docker-compose**
    1. Make sure a `NODE_ENV` environment variable is set to `development`
    2. Run `npm run start:docker`
    3. In separate terminal run `npm run start:hmr`
- Run **development** instance **manually**
    1. Make sure a `NODE_ENV` environment variable is set to `development`
    2. Run `npm run start:manual`
    3. In separate terminal run `npm run start:hmr`

Note that in production there is a formal step that we call "prepare".
This can include various steps like:
- Initial deployment setup
- Pulling latest code
- Installing (`npm install`)
- Building (`npm run build`)

## Using the Dashboard
Once the dashboard is started you can access it at:
- http://localhost:4000 by default, or whatever your HOST and PORT have been configured to
- In development you can also run `npm run start:hmr` and use the live app with hot reloading
  at http://localhost:3000. If port 3000 is not available the number will be incremented and
  the updated URL should be printed in the terminal.
- You can also use DB management tools to connect the database. For example, the default
  connection string for a development database would be `postgres://postgres:cumulus-db-password@localhost:4002/cumulus`.

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
