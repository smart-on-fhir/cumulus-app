This folder contains some CLI scripts to help with deployment and migration tasks.
Different tasks are exposed as subcommands of the `cumulus` executable. For more
info, from within the project root folder run
```sh
./bin/cumulus.ts
```

## Configuration
Most of the scripts require a database connection to one or more site's database.
The credentials for those sites are configured separately from the main configuration
of the project. The configuration object looks like:
```js
{
    LOCAL: {
        baseUrl: "http://localhost:1234/",
        dbUrl  : "postgres://user:password@host:port/database"
    },
    PROD: {
        baseUrl: "http://prod.cumulus.org/",
        dbUrl  : "postgres://user:password@host:port/database"
    },
    // ...
}
```
Note that the keys of this configuration object (`LOCAL`, `PROD`, ...) are going
to be passed as parameters to some of the scripts.

There is an example configuration file to start with - `config.example.ts`. Please
copy it to `config.ts` and then edit as needed - `cp config.example.ts config.ts`.

Note that `config.ts` is in `.gitignore` so that you don't have to worry about committing
any secrets.

## Commands

### configure
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

### copy_subscription
Copies a subscription (including it's data and charts) from source to destination

Usage: `./bin/cumulus.ts copy_subscription [options]`

Example: `./bin/cumulus.ts copy_subscription --id 123 --src PROD --dst LOCAL`

```
Options:
  --id <id>       Source subscription ID
  -s, --src <id>  Source site identifier (choices: any key from the configuration object)
  -d, --dst <id>  Destination site identifier (choices: any key from the configuration object)
  -h, --help      display help for command
```

### copy_subscription_group
Copies a subscription group (including data and charts for every included subscription) from source to destination

Usage: `./bin/cumulus.ts copy_subscription_group [options]`

Example: `./bin/cumulus.ts copy_subscription_group --id 123 --src PROD --dst LOCAL`

```
Options:
  --id <id>       Source subscription group ID
  -s, --src <id>  Source site identifier (choices: any key from the configuration object)
  -d, --dst <id>  Destination site identifier (choices: any key from the configuration object)
  -h, --help      display help for command
```
