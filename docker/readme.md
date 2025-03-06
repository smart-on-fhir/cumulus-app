### Build
Assuming that you run this from the dashboard project root, and you are tagging the
image as `dashboard-prod`, the build command would look like this:

```
docker build -t dashboard-prod -f docker/backend.prod.Dockerfile .
```

### Run

```sh
docker run --init -it --env-file .env.production -p 6001:80 dashboard-prod
```
The `--init` flag enables us to kill the container with `Ctrl+C`.

If `--env-file` is not passed, then separate env vars will have to provided
using the `-e VAR=VALUE` parameters. Example:

```sh
docker run --init -it -p 6001:80 -e DATABASE_URL='postgres://user:password@host:port/db?ssl=false' dashboard-prod
```
Note that `DATABASE_URL` is currently the only required environment variable.

# Configuration Variables

## Database

The entire database configuration is provided via the `DATABASE_URL` variable containing the DB connection string and using the following schema:

`postgres://{{user}}:{{password}}@{{host}}:{{port}}/{{schema}}?{{query}}`, where:

- **user** is the database username. For Postgres databases this defaults to `postgres`. Provide a different username if needed.
- **password** is the database password
- **host** is the database host or IP. Note that localhost values like `localhost` or `127.0.0.1` won't work because they would resolve to the local network within the container.
- **port** is the port on which the database is available. For Postgres databases this defaults to `5432`. Provide a different port if needed.
- **schema** is the name of the database schema we are connecting to. If you omit this, then you must have a schema created, called `cumulus`. Otherwise, use a different schema and provide it's name here.
- **query** is an optional query string that may contain the following parameters:
    - **ssl** - any falsy value (false, 0, no) will avoid using ssl while connecting
    - **sync** - Can be `none` | `normal` | `force` | `alter`. This affects how changes to data models are applied to the database.
        - **none** - Changes are not automatically applied and should be done manually. This is the default behavior on production.
        - **normal** - New models are applied via CREATE TABLE statements
        - **alter** - Changes are applied via ALTER TABLE statements
        - **force** - Tables are dropped and then re-created

        **IMPORTANT: Do NOT use this on production (omit it or use 'none'). Production databases should be synchronized via migrations instead!**



#### Examples:

Basic example:

`DATABASE_URL=postgres://user:password@10.0.0.59:4002/cumulus`

Connecting without SSL:

`DATABASE_URL=postgres://user:password@10.0.0.59:4002/cumulus?ssl=false`

Full example used by tests:

`DATABASE_URL=postgres://postgres:cumulus_test_db_password@localhost:5455/cumulus_test?ssl=false&sync=force`



## Emails

### MAILGUN_API_KEY
Set your Mailgun API key here. We use Mailgun to send emails. If you don't set this, any emails will fail to send.

### MAILGUN_DOMAIN
Set your Mailgun domain here. Defaults to `smarthealthit.org`

### APP_EMAIL_FROM
The email's `from` header. Defaults to `admin@cumulus.org`

### CUMULUS_ADMIN_EMAIL
Who will be notified when new subscription is created?

### REGIONAL_CLUSTER_EMAIL
Who will be notified when a user makes a line-level data request?

## Aggregator



### AGGREGATOR_URL
The base URL of the aggregator to connect to. Defaults to `https://api.smartcumulus.org`

### AGGREGATOR_API_KEY
The API Key used for aggregator connections

### AGGREGATOR_ENABLED
Boolean value to toggle aggregator support. This way you can enable or disable the aggregator functionality without having to delete the `AGGREGATOR_URL` or `AGGREGATOR_API_KEY` variables from your configuration.


## Misc.

### PORT
By default the server runs on port `80` and your own port to it when you run the container (e.g.: `-p 6001:80`). However, if this image is part of a docker compose network, it might be useful to use a different port which you can provide here.

### NODE_DEBUG
What to log to STDOUT? A comma-separated list of values. The full list is `app-verbose,app-error,app-info,app-warn,app-log,app-sql`.

The default value is to log everything except SQL (`app-sql`). Note that logging sql might be useful for debugging but generates a lot of information, as it logs more than just SQL queries. Therefore, it is not recommended to keep that flag on.

### REACT_APP_NOTEBOOK_URL
If set, a "Open in analytics environment" button will be rendered below charts.
Example: `https://cumulusdemo.notebook.us-east-1.sagemaker.aws/notebooks/cumulus/demo.ipynb`


## Full .env File Template
```
# Database
DATABASE_URL=postgres://user:password@host:port/db?ssl=false

# Emails
MAILGUN_API_KEY=
MAILGUN_DOMAIN=smarthealthit.org
CUMULUS_ADMIN_EMAIL=
REGIONAL_CLUSTER_EMAIL=
APP_EMAIL_FROM=admin@cumulus.org

# Aggregator
AGGREGATOR_URL=https://api.smartcumulus.org
AGGREGATOR_API_KEY=
AGGREGATOR_ENABLED=false

# Misc
REACT_APP_NOTEBOOK_URL=
NODE_DEBUG=app-verbose,app-error,app-info,app-warn,app-log
```
