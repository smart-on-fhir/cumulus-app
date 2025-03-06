import "dotenv/config"
import Path                       from "path"
import { bool, parseDbUrl, uInt } from "./lib"
import { sql as logSql }          from "./services/logger"
import { Config }                 from "./types"


const dbSettings = parseDbUrl(process.env.DATABASE_URL || "")

const {
    HOST                   = "0.0.0.0",
    PORT                   = "4000",
    THROTTLE               = 0,
    DB_DOCKER_CONTAINER    = "",
    MAILGUN_API_KEY        = "missing mailgun api key",
    MAILGUN_DOMAIN         = "smarthealthit.org",
    APP_EMAIL_FROM         = "",
    CUMULUS_ADMIN_EMAIL    = "",
    REGIONAL_CLUSTER_EMAIL = "",
    AGGREGATOR_URL         = "",
    AGGREGATOR_API_KEY     = "",
    AGGREGATOR_ENABLED     = "false"
} = process.env;


const config: Config = {
    port    : uInt(PORT),
    host    : HOST,
    throttle: uInt(THROTTLE),
    
    
    appEmail: APP_EMAIL_FROM,

    // When line-level data is requested, the email is sent to this address.
    regionalClusterEmail: REGIONAL_CLUSTER_EMAIL,

    // When new data sources are created, notification emails are sent to this address
    cumulusAdminEmail: CUMULUS_ADMIN_EMAIL,

    // Note that moment humanized duration shows 24 * 7 as "168 hours" and not
    // many people are used to that so we add one more hour to get "7 days"!
    userInviteExpireAfterHours: 24 * 7 + 1,

    // How long are password reset links good for
    userResetExpireAfterHours: 24,

    docker: {
        containerName: DB_DOCKER_CONTAINER
    },
    db: {
        sync: String(dbSettings.query.sync || "none") as Config["db"]["sync"],
        options: {
            dialectOptions: {
                ssl: bool(dbSettings.query.ssl ?? true) ? {
                    rejectUnauthorized: false
                } : false
            },
            dialect : "postgres",
            schema  : "public",
            database: dbSettings.database || "cumulus",
            logging : logSql,
            username: dbSettings.username || "",
            password: dbSettings.password || "",
            port    : +(dbSettings.port   || "5432"),
            host    : dbSettings.host     || "localhost"
        }
    },
    aggregator: {
        baseUrl: AGGREGATOR_URL,
        apiKey : AGGREGATOR_API_KEY,
        enabled: bool(AGGREGATOR_ENABLED)
    },

    mailGun: {
        // Your Mailgun API KEY
        apiKey: MAILGUN_API_KEY || "Missing Mailgun API Key",

        // Your public Mailgun API KEY
        publicApiKey: "",

        // Your Mailgun Domain (Please note: domain field is MY-DOMAIN-NAME.com,
        // not https://api.mailgun.net/v3/MY-DOMAIN-NAME.com)
        domain: MAILGUN_DOMAIN,

        // Set to true if you wish to mute the console error logs in
        // validateWebhook() function
        mute: false,

        // The proxy URI in format http[s]://[auth@]host:port. ex:
        // 'http://proxy.example.com:8080'
        // proxy: ""

        // Request timeout in milliseconds
        timeout: 10000,

        // the mailgun host (default: 'api.mailgun.net')
        // host:

        // the mailgun protocol (default: 'https:', possible values: 'http:' or 'https:')
        // protocol:

        // the mailgun port (default: '443')
        // port:

        // the mailgun host (default: '/v3')
        // endpoint:

        // the number of total attempts to do when performing requests. Default is 1.
        // That is, we will try an operation only once with no retries on error.
        retry: 2
    }
};

export default config
