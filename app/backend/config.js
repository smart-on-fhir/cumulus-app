const Path           = require("path");
const { bool, uInt } = require("./lib");
const { logger }     = require("./logger");

const {
    NODE_ENV               = "production",
    HOST                   = "0.0.0.0",
    PORT                   = "4000",
    DB_SEED                = "",
    DB_SYNC                = "none", // normal|force|alter|none
    DB_HOST                = "localhost",
    DB_PORT                = "5432",
    DB_USER                = "postgres",
    DB_PASS                = "",
    DB_DATABASE            = "cumulus",
    THROTTLE               = "0",
    DB_SSL                 = "true",
    DB_DOCKER_CONTAINER    = "",
    MAILGUN_API_KEY        = "missing mailgun api key",
    MAILGUN_DOMAIN         = "smarthealthit.org",
    APP_EMAIL_FROM         = "admin@cumulus.org",
    CUMULUS_ADMIN_EMAIL    = "vlad.ignatov@gmail.com",
    REGIONAL_CLUSTER_EMAIL = "vlad.ignatov@gmail.com",
    DB_DOCKER_DATA_DIR     = "",
    LOG_SQL                = "false",
    // BASE_URL               = "./db/postgres-data"

} = process.env;


module.exports = {
    port    : uInt(PORT),
    host    : HOST,
    throttle: uInt(THROTTLE),
    
    
    appEmail: APP_EMAIL_FROM,

    // When line-level data is requested, the email is sent to this address.
    // Typically, this would represent a subscription group that handles for
    // example "MA DPH Subscriptions to the Massachusetts regional cluster"
    regionalClusterEmail: REGIONAL_CLUSTER_EMAIL,

    // When new data requests (and/or subscriptions) are created, notification
    // emails are sent to this address
    cumulusAdminEmail: CUMULUS_ADMIN_EMAIL,

    docker: {
        containerName: DB_DOCKER_CONTAINER,
        dataDir: DB_DOCKER_DATA_DIR //? Path.resolve(__dirname, DB_DOCKER_DATA_DIR) : ""
    },
    db: {
        sync: DB_SYNC,
        seed: bool(DB_SEED) ? Path.join(__dirname, DB_SEED) : "",
        options: {
            dialectOptions: {
                ssl: bool(DB_SSL) ? {
                    rejectUnauthorized: false
                } : false
            },
            dialect : "postgres",
            schema  : "public",
            database: DB_DATABASE,
            logging : bool(LOG_SQL) ?
                (msg) => logger.log("info", msg, { tags: ["SQL"] }) :
                false,
            username: DB_USER,
            password: DB_PASS,
            port    : DB_PORT,
            host    : DB_HOST
        }
    },
    mailGun: {
        // Your Mailgun API KEY
        apiKey: MAILGUN_API_KEY,

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
