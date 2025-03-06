import clc                                         from "cli-color"
import dotenv                                      from "dotenv"
import dotenvExpand                                from "dotenv-expand"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { ask }                                     from "./lib"


const STATE: Record<string, string | number | boolean> = {}



function generateEnvFile() {
    const vars: Record<string, string | number | boolean> = {
        NODE_ENV              : String(STATE.NODE_ENV         || "development"),
        PORT                  : String(STATE.PORT                             ),
        DB_PORT               : String(STATE.DB_PORT                          ),
        DB_USER               : String(STATE.DB_USER                          ),
        DB_PASS               : String(STATE.DB_PASS                          ),
        DB_DATABASE           : String(STATE.DB_DATABASE                      ),
        DATABASE_URL          : String(STATE.DATABASE_URL           || ""     ),
        MAILGUN_API_KEY       : String(STATE.MAILGUN_API_KEY        || ""     ),
        MAILGUN_DOMAIN        : String(STATE.MAILGUN_DOMAIN         || ""     ),
        APP_EMAIL_FROM        : String(STATE.APP_EMAIL_FROM         || ""     ),
        CUMULUS_ADMIN_EMAIL   : String(STATE.CUMULUS_ADMIN_EMAIL    || ""     ),
        REGIONAL_CLUSTER_EMAIL: String(STATE.REGIONAL_CLUSTER_EMAIL || ""     ),
        REACT_APP_NOTEBOOK_URL: String(STATE.REACT_APP_NOTEBOOK_URL || ""     ),
        AGGREGATOR_URL        : String(STATE.AGGREGATOR_URL         || ""     ),
        AGGREGATOR_API_KEY    : String(STATE.AGGREGATOR_API_KEY     || ""     ),
        AGGREGATOR_ENABLED    : String(STATE.AGGREGATOR_ENABLED     || "false"),
    }

    if (STATE.HOST    !== undefined) vars.HOST    = String(STATE.HOST   )
    if (STATE.DB_HOST !== undefined) vars.DB_HOST = String(STATE.DB_HOST)

    // @ts-ignore
    dotenvExpand.expand({ parsed: vars })

    let out = `# Database\n`
    out += `DATABASE_URL=${vars.DATABASE_URL}\n`
    if (vars.NODE_ENV === "test") {
        out += `DB_DOCKER_CONTAINER=cumulus_test\n`
    }
    if (STATE.DEPLOY === "docker") {
        out += `\n# The app only uses DATABASE_URL but the following variables\n` +
               `# are needed for docker compose, to be passed to the database\n`
        out += `DB_PORT=${vars.DB_PORT}\n`
        out += `DB_USER=${vars.DB_USER}\n`
        out += `DB_PASS=${vars.DB_PASS}\n`
        out += `DB_DATABASE=${vars.DB_DATABASE}\n`
    }
    out += `\n`
    out += `# Emails\n`
    out += `MAILGUN_API_KEY=${vars.MAILGUN_API_KEY || ""}\n`
    out += `MAILGUN_DOMAIN=${vars.MAILGUN_DOMAIN || ""}\n`
    out += `CUMULUS_ADMIN_EMAIL=${vars.CUMULUS_ADMIN_EMAIL || ""}\n`
    out += `REGIONAL_CLUSTER_EMAIL=${vars.REGIONAL_CLUSTER_EMAIL || ""}\n`
    out += `APP_EMAIL_FROM=${vars.APP_EMAIL_FROM || ""}\n`
    out += `\n`
    out += `# Aggregator\n`
    out += `AGGREGATOR_URL=${vars.AGGREGATOR_URL || ""}\n`
    out += `AGGREGATOR_API_KEY=${vars.AGGREGATOR_API_KEY || ""}\n`
    out += `AGGREGATOR_ENABLED=${vars.AGGREGATOR_ENABLED || ""}\n`
    out += `\n`
    out += `# Misc\n`
    out += `NODE_ENV=${vars.NODE_ENV}\n`
    out += `PORT=${vars.PORT || ""}\n`
    out += `REACT_APP_NOTEBOOK_URL=${vars.REACT_APP_NOTEBOOK_URL || ""}\n`
    out += `NODE_DEBUG=${vars.NODE_ENV === "test" ? "" : "app-verbose,app-error,app-info,app-warn,app-log"}\n`
    out += `BROWSER=none\n`
    out += `THROTTLE=0\n`
    out += `CI=true\n`
    out += `\n`

    return out
}


export default async function main()
{
    // Main settings -----------------------------------------------------------

    // NODE_ENV: 'production' | 'development' | 'test'
    STATE.NODE_ENV = await ask(
        `What environment is this configuration intended for?`,
        { answers: ['production', 'development', 'test'], defaultValue: "production" }
    )

    const FILE = `.env.${STATE.NODE_ENV}.local`

    const FILE_EXISTS = existsSync(FILE)

    let FILE_DATA = {}

    if (FILE_EXISTS) {
        const data = readFileSync(FILE)
        FILE_DATA = dotenv.parse(data)
        Object.assign(STATE, FILE_DATA)
    }

    // DEPLOY: 'docker' | 'manual'
    STATE.DEPLOY = STATE.NODE_ENV === "development" ? "docker" : "manual"

    // HOST = "0.0.0.0"
    if (STATE.DEPLOY !== "docker") {
        STATE.HOST = await ask(
            `Enter the host on which the dashboard will be accessible. Common values are "localhost" or ` +
            `"127.0.0.1", as well as "0.0.0.0" to make the dashboard visible on your entire local network.` +
            `You can also enter "$HOST" to map this to the HOST environment variable if one is already set on the system.`,
            { defaultValue: "0.0.0.0", currentValue: STATE.HOST }
        )
    }

    // PORT = 4000
    STATE.PORT = (await ask(
        `Enter the port number on which the dashboard will be accessible. ` +
        `You can also enter "$PORT" to map this to the PORT environment variable ` +
        `if one is already set on the system.`,
        { defaultValue: 4000, currentValue: STATE.PORT }
    ))

    // Database ----------------------------------------------------------------

    // DB_HOST: hostname or fixed value "db" in docker-compose
    if (STATE.NODE_ENV === "production") {
        STATE.DB_HOST = await ask(
            "Please enter the database hostname (you will have to setup a " +
            "Postgres database yourself and enter it's host here).",
            {
                defaultValue: "localhost",
                required: true,
                currentValue: STATE.DB_HOST
            }
        );
    } else if (STATE.NODE_ENV === "test") {
        STATE.DB_HOST = "localhost"
    } else {
        STATE.DB_HOST = "db"
    }

    STATE.DB_PORT = +await ask(
        "Please enter the database port.",
        {
            defaultValue: STATE.NODE_ENV === "development" ?
                4002 :
                STATE.NODE_ENV === "production" ?
                    5432 :
                    5455,
            required: true,
            currentValue: STATE.DB_PORT
        }
    );
    
    STATE.DB_USER = await ask(
        "Enter database username:",
        {
            defaultValue: STATE.NODE_ENV === "production" ? undefined : "postgres",
            required: true,
            currentValue: STATE.DB_USER
        }
    )
    
    STATE.DB_PASS = await ask(
        "Enter database password:",
        {
            defaultValue: STATE.NODE_ENV === "development" ?
                "cumulus-db-password" :
                STATE.NODE_ENV === "test" ?
                    "cumulus_test_db_password" :
                    undefined,
            required: true,
            currentValue: STATE.DB_PASS
        }
    )
    
    STATE.DB_DATABASE = await ask(
        "Enter database name:",
        {
            defaultValue: STATE.NODE_ENV === "development" ?
                "cumulus" :
                STATE.NODE_ENV === "test" ?
                    "cumulus_test" :
                    undefined,
            required: true,
            currentValue: STATE.DB_DATABASE
        }
    )
    
    STATE.DB_SSL = await ask(
        "Would you like to use SSL for DB connection (recommended)? Please answer yes or no:",
        {
            answers: [ "true", "false" ],
            defaultValue: STATE.NODE_ENV === "production" ? "true" : "false",
            currentValue: STATE.DB_SSL
        }
    )

    STATE.DB_SYNC = await ask(
        'How would you like the database to be synchronized with model structure changes? Options are:\n' +
        clc.bold.cyan("normal") + " - create tables for new models and do nothing for existing models\n" +
        clc.bold.cyan("force") + "  - drop and recreate all tables\n" +
        clc.bold.cyan("none") + "   - do not synchronize (I will do that manually)",
        {
            answers: ['normal', 'force', 'none'],
            defaultValue: STATE.NODE_ENV === "test" ? "force" : "normal",
            currentValue: STATE.DB_SYNC
        }
    )

    STATE.DATABASE_URL = `postgres://${STATE.DB_USER}:${STATE.DB_PASS}@${STATE.DB_HOST}:${
        STATE.DB_PORT}/${STATE.DB_DATABASE}?ssl=${STATE.DB_SSL}&sync=${STATE.DB_SYNC}`

    // Email -------------------------------------------------------------------

    STATE.MAILGUN_API_KEY = await ask(
        `Enter your Mailgun API key. Leave empty to disable email sending.`,
        { currentValue: STATE.MAILGUN_API_KEY, defaultValue: "" }
    )

    if (STATE.MAILGUN_API_KEY) {
        STATE.MAILGUN_DOMAIN = await ask(
            `Enter your Mailgun domain.`,
            {
                required: true,
                defaultValue: "smarthealthit.org",
                currentValue: STATE.MAILGUN_DOMAIN || ""
            }
        )
        
        STATE.CUMULUS_ADMIN_EMAIL = await ask(
            `Enter the administrator email.`,
            { required: true, currentValue: STATE.CUMULUS_ADMIN_EMAIL || "" }
        )

        STATE.REGIONAL_CLUSTER_EMAIL = await ask(
            `Enter the regional cluster email address. Hit Enter to leave this empty and configure it later.`,
            {
                required: true,
                defaultValue: "cluster@some-dph.org",
                currentValue: STATE.REGIONAL_CLUSTER_EMAIL || ""
            }
        )
        
        STATE.APP_EMAIL_FROM = await ask(
            `Enter the "from" header in emails sent by the app.`,
            { defaultValue: "admin@cumulus.org", currentValue: STATE.APP_EMAIL_FROM || "" }
        )
    }    

    // Aggregator --------------------------------------------------------------
    
    STATE.AGGREGATOR_URL = await ask(
        `Enter the URL for the aggregator service. Leave empty to disable that feature."`,
        {
            defaultValue: "https://api.smartcumulus.org",
            currentValue: STATE.AGGREGATOR_URL
        }
    )
    
    STATE.AGGREGATOR_API_KEY = await ask(
        `Enter the API KEY for aggregator service requests. Leave empty to disable that feature."`,
        { defaultValue: "", currentValue: STATE.AGGREGATOR_API_KEY }
    )
    
    STATE.AGGREGATOR_ENABLED = await ask(
        `Should the aggregator service be enabled? Even if aggregator service URL and API KEY are set, the service can still be disabled if this is set to false."`,
        {
            answers: [ "true", "false" ],
            defaultValue: "true",
            currentValue: STATE.AGGREGATOR_ENABLED
        }
    )

    // Misc. -------------------------------------------------------------------

    STATE.REACT_APP_NOTEBOOK_URL = await ask(
        `Enter a notebook URL for the "Open in Analytic Environment" command. Leave empty to disable that feature.`,
        {
            defaultValue: "https://cumulusdemo.notebook.us-east-1.sagemaker.aws/notebooks/cumulus/demo.ipynb",
            currentValue: STATE.REACT_APP_NOTEBOOK_URL
        }
    )

    const contents = generateEnvFile()
    
    if (FILE_EXISTS) {

        let hasChanges = false
        const diff = {}
        const NEW_FILE_DATA = dotenv.parse(contents)
        Object.keys(NEW_FILE_DATA).forEach(key => {
            const oldValue = FILE_DATA[key]
            const newValue = NEW_FILE_DATA[key]
            if (newValue !== oldValue) {
                diff[key] = { oldValue, newValue }
                hasChanges = true
            }
        })

        console.log(clc.italic.green(`\n\nOlder configuration found at ${clc.bold(FILE)}`))

        if (!hasChanges) {
            console.log(clc.italic.green(`Your new configuration is exactly the same as your old one!`))
        } else {
            console.log(clc.italic.green(`Here is your new configuration. Please review and decide if and what to override:`))
            console.log(clc.italic.green(`--------------------------------------------------------------------------------`))
            console.log(contents)
            console.log(clc.italic.green(`--------------------------------------------------------------------------------`))
            console.log(clc.italic.green(`Changes:`))
            console.log(clc.italic.green(`--------------------------------------------------------------------------------`))
            console.log(diff)
            console.log(clc.italic.green(`--------------------------------------------------------------------------------`))
        }
    } else {
        writeFileSync(FILE, contents, "utf8")
        console.log(`\n\nConfiguration saved at ${clc.bold(FILE)}`)
    }

    process.exit(0)
}
