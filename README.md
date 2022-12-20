# Cumulus

## Install

First make sure you have an unix system (Linux or Mac) with Git, Docker and NodeJS 18+.
Then do:
```sh
git clone https://github.com/smart-on-fhir/cumulus-app.git
cd cumulus-app
npm i
```

## Configure
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


## Run
In one terminal run `npm run start:server`. Then open http://localhost:4000/ and
login with one of the following credentials:
- email: `user@cumulus.dev`, password: `User@12345`
- email: `manager@cumulus.dev`, password: `Manager@12345`
- email: `admin@cumulus.dev`, password: `Admin@12345`

For React development using hot-reload server, in a separate terminal run `npm start` and then use `http://localhost:3001/` instead. Keep in mind that any changes you make to the front-end code will appear immediately on http://localhost:3001/, but will not be visible on http://localhost:4000/, until you run `npm run build`.



