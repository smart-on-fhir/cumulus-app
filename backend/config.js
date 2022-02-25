const Path     = require("path");
const { bool, uInt } = require("./lib");

const {
    NODE_ENV    = "production",
    HOST        = "0.0.0.0",
    PORT        = "4000",
    DB_SEED     = "",
    DB_SYNC     = "alter", // normal|force|alter|none
    DB_HOST     = "localhost",
    DB_PORT     = "5432",
    DB_USER     = "postgres",
    DB_PASS     = "",
    DB_DATABASE = "cumulus",
    VERBOSE     = "false",
    THROTTLE    = "0",
    DB_SSL      = "true",
    DB_DOCKER_CONTAINER = ""
} = process.env;


module.exports = {
    port    : uInt(PORT),
    host    : HOST,
    verbose : bool(VERBOSE),
    throttle: uInt(THROTTLE),
    docker: {
        containerName: DB_DOCKER_CONTAINER
    },
    db: {
        sync: DB_SYNC,
        seed: bool(DB_SEED) ? Path.join(__dirname, DB_SEED) : "",
        options: {
            // dialectOptions: {
                ssl: {
                    // require: true,
                    rejectUnauthorized: bool(DB_SSL)
                },
            // },
            dialect : "postgres",
            schema  : "public",
            database: DB_DATABASE,
            logging : NODE_ENV === "production" ? false : console.log,
            username: DB_USER,
            password: DB_PASS,
            port    : DB_PORT,
            host    : DB_HOST
        }
    }
};
