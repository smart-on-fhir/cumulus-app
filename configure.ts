import readline                                    from "readline/promises"
import clc                                         from "cli-color"
import dotenv                                      from "dotenv"
import dotenvExpand                                from "dotenv-expand"
import { existsSync, readFileSync, writeFileSync } from "fs"

const rl = readline.createInterface({
    input : process.stdin,
    output: process.stdout
});


const STATE: Record<string, string | number | boolean> = {}


function list(items: (string | number | boolean)[], conditional = "or") {
    if (items.length === 1) {
        return clc.bold.cyan(JSON.stringify(items[0]))
    }
    items = [ ...items ]
    const last = items.pop()
    return items.map(s => clc.bold.cyan(JSON.stringify(s))).join(", ") +
        " " + conditional + " " + clc.bold.cyan(JSON.stringify(last))
}

async function ask(question: string, {
    answers,
    defaultValue,
    required,
    currentValue
}: {
    answers?: string[]
    defaultValue?: any
    required?: boolean
    currentValue?: string | number | boolean
} = {}) {
    let msg = ["\n📄 " + clc.italic.green(question.trim())];

    if (answers) {
        msg.push(`Supported values: ${list(answers)}.`)
    }

    if (defaultValue !== undefined) {
        msg.push(`Default value: ${clc.bold.magenta(JSON.stringify(defaultValue))}.`)
    } else {
        msg.push(`This variable has no default value.`)
    }
    if (currentValue !== undefined) {
        msg.push(`Your current value is ${clc.bold.magenta(JSON.stringify(currentValue))}.`)
    }
    if (defaultValue !== undefined) {
        msg.push(`Hit Enter to accept the default value.`)
    }
    let answer = (await rl.question(
        clc.italic.green(
            msg.join(question.includes("\n") ? "\n" : " ")
        ) + "\n" + clc.bold("Answer: ")
    )).trim()

    if (!answer) answer = defaultValue

    while (!answer && required) {
        process.stdout.write("\x1B[1A\x1B[0G\x1B[0J")
        answer = await rl.question(clc.italic.green(
            `⛔️ This value is required! Please try again:\n`
        ));
    }

    if (answers) {
        while (!answers.includes(answer)) {
            process.stdout.write("\x1B[1A\x1B[0G\x1B[0J")
            answer = await rl.question(clc.italic.green(
                `⛔️ Only the following values are supported: ${list(answers)}. ` +
                'Please try again:\n'
            ));
        }
    }

    process.stdout.write("\x1B[1A\x1B[0G\x1B[0J")
    console.log(clc.bold.yellow(answer))

    return answer
}

function generateEnvFile() {
    const vars: Record<string, string | number | boolean> = {
        NODE_ENV              : String(STATE.NODE_ENV),
        PORT                  : String(STATE.PORT),
        INTERNAL_PORT         : String(STATE.INTERNAL_PORT),
        DB_PORT               : String(STATE.DB_PORT),
        DB_USER               : String(STATE.DB_USER),
        DB_PASS               : String(STATE.DB_PASS),
        DB_DATABASE           : String(STATE.DB_DATABASE),
        DB_SSL                : String(STATE.DB_SSL),
        DB_SEED               : String(STATE.DB_SEED),
        DB_SYNC               : String(STATE.DB_SYNC),
        LOG_SQL               : String(STATE.LOG_SQL),
        DATABASE_URL          : String(STATE.DATABASE_URL),
        MAILGUN_API_KEY       : String(STATE.MAILGUN_API_KEY),
        MAILGUN_DOMAIN        : String(STATE.MAILGUN_DOMAIN),
        APP_EMAIL_FROM        : String(STATE.APP_EMAIL_FROM),
        CUMULUS_ADMIN_EMAIL   : String(STATE.CUMULUS_ADMIN_EMAIL),
        REGIONAL_CLUSTER_EMAIL: String(STATE.REGIONAL_CLUSTER_EMAIL),
        REACT_APP_NOTEBOOK_URL: String(STATE.REACT_APP_NOTEBOOK_URL),
        AGGREGATOR_URL        : String(STATE.AGGREGATOR_URL),
        AGGREGATOR_API_KEY    : String(STATE.AGGREGATOR_API_KEY),
        AGGREGATOR_ENABLED    : String(STATE.AGGREGATOR_ENABLED),
        THROTTLE              : String(STATE.THROTTLE || 0),
    }

    if (STATE.HOST    !== undefined) STATE.HOST    = String(STATE.HOST   )
    if (STATE.DB_HOST !== undefined) STATE.DB_HOST = String(STATE.DB_HOST)

    vars.THROTTLE = "0"

    if (STATE.NODE_ENV === "development") {
        vars.NODE_DEBUG = '"app:*"'
        vars.LOG_LEVEL = "debug" // silly, debug, verbose, http, info, warn, error
        // vars.DANGEROUSLY_DISABLE_HOST_CHECK = "true"
        vars.DB_SEED = "db/seeds" // TODO:
    } else {
        vars.LOG_LEVEL = "info"
        vars.DB_SEED = "db/seeds" // TODO:
    }

    // TODO: # REACT_APP_BACKEND_HOST="http://localhost:$INTERNAL_PORT"

    // @ts-ignore
    dotenvExpand.expand({ parsed: vars })


    return Object.keys(vars).map(k => `${k}=${vars[k]}`).join("\n")
}


async function main()
{
    // Main settings -----------------------------------------------------------

    // NODE_ENV:  'development' | 'production'
    STATE.NODE_ENV = await ask(
        `Please enter the ${clc.bold("environment")} you would like to configure.`,
        { answers: ['development', 'production'], currentValue: STATE.NODE_ENV }
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
    STATE.DEPLOY = await ask(
        `How would you like to deploy? Type ${clc.bold.cyan("docker")} to use docker-compose ` +
        `or ${clc.bold.cyan("manual")} for manual configuration.In manual mode you will have ` +
        `to set up and host the database yourself.`,
        { answers: ['docker', 'manual'] }
    )

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

    // INTERNAL_PORT: 4001 in Docker or same as PORT otherwise
    if (STATE.DEPLOY === "docker") {
        STATE.INTERNAL_PORT = +(await ask(
            `Enter the port number on which the dashboard API will be accessible ` +
            `within the docker network.`,
            { defaultValue: 4001, currentValue: STATE.INTERNAL_PORT }
        ))
    }

    // Database ----------------------------------------------------------------

    // DB_HOST: hostname or fixed value "db" in docker-compose
    if (STATE.DEPLOY !== "docker") {
        STATE.DB_HOST = await ask(
            "Please enter the database hostname (you have chosen a manual " +
            "deploy method, thus you will have to setup a Postgres database " +
            "yourself and enter it's host here).",
            {
                defaultValue: "localhost",
                required: true,
                currentValue: STATE.DB_HOST
            }
        );
    }

    STATE.DB_PORT = +await ask(
        "Please enter the database port.",
        {
            defaultValue: STATE.DEPLOY === "manual" ? 5432 : 4002,
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
            defaultValue: STATE.NODE_ENV === "development" ? "cumulus-db-password" : undefined,
            required: true,
            currentValue: STATE.DB_PASS
        }
    )
    
    STATE.DB_DATABASE = await ask(
        "Enter database name:",
        {
            defaultValue: STATE.NODE_ENV === "development" ? "cumulus" : undefined,
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

    if (STATE.NODE_ENV === "production") {
        STATE.DB_SYNC = "normal"
    } else {
        STATE.DB_SYNC = await ask(
            'How would you like the database to be synchronized with model structure changes? Options are:\n' +
            clc.bold.cyan("normal") + " - create tables for new models and do nothing for existing models\n" +
            clc.bold.cyan("force") + "  - drop and recreate all tables\n" +
            clc.bold.cyan("none") + "   - do not synchronize (I will do that manually)",
            {
                answers: ['normal', 'force', 'none'],
                defaultValue: "normal",
                currentValue: STATE.DB_SYNC
            }
        )
    }

    STATE.LOG_SQL = await ask(
        "Would you like to log SQL queries?",
        {
            answers: [ "true", "false" ],
            defaultValue: "false",
            currentValue: STATE.LOG_SQL
        }
    )

    STATE.DATABASE_URL = `postgres://${STATE.DB_USER}:${STATE.DB_PASS}@${STATE.DB_HOST || "localhost"}:${STATE.DB_PORT}/${STATE.DB_DATABASE}`

    // Email -------------------------------------------------------------------

    STATE.MAILGUN_API_KEY = await ask(
        `Enter your Mailgun API key.`,
        { required: true, currentValue: STATE.MAILGUN_API_KEY }
    )

    STATE.MAILGUN_DOMAIN = await ask(
        `Enter your Mailgun domain.`,
        {
            required: true,
            defaultValue: "smarthealthit.org",
            currentValue: STATE.MAILGUN_DOMAIN
        }
    )
    
    STATE.CUMULUS_ADMIN_EMAIL = await ask(
        `Enter the administrator email.`,
        { required: true, currentValue: STATE.CUMULUS_ADMIN_EMAIL }
    )

    STATE.REGIONAL_CLUSTER_EMAIL = await ask(
        `Enter the regional cluster email address. Hit Enter to leave this empty and configure it later.`,
        {
            required: true,
            defaultValue: "cluster@some-dph.org",
            currentValue: STATE.REGIONAL_CLUSTER_EMAIL
        }
    )
    
    STATE.APP_EMAIL_FROM = await ask(
        `Enter the "from" header in emails sent by the app.`,
        { defaultValue: "admin@cumulus.org", currentValue: STATE.APP_EMAIL_FROM }
    )



    

    // Aggregator --------------------------------------------------------------
    
    STATE.AGGREGATOR_URL = await ask(
        `Enter the URL for the aggregator service. Leave empty to disable that feature."`,
        {
            defaultValue: "https://dev.api.smartcumulus.org",
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

main()
