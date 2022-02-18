const Path     = require("path");
const { bool, uInt } = require("./lib");

const {
    NODE_ENV    = "production",
    HOST        = "0.0.0.0",
    PORT        = "4000",
    DB_SEED     = "",//"db/seeds.js",
    DB_SYNC     = "alter", // normal|force|alter|none
    DB_HOST     = "localhost",
    DB_PORT     = "5432",
    DB_USER     = "postgres",
    DB_PASS     = "cumulus-db-password",
    DB_DATABASE = "cumulus",
    VERBOSE     = "true",
    THROTTLE    = "0"
} = process.env;


module.exports = {
    port    : uInt(PORT),
    host    : HOST,
    verbose : bool(VERBOSE),
    throttle: uInt(THROTTLE),
    docker: {
        containerName: "cumulus"
    },
    db: {
        sync     : DB_SYNC,
        seed     : bool(DB_SEED) ? Path.join(__dirname, DB_SEED) : "",
        options: {
            // dialectOptions: {
                ssl: {
                    // require: true,
                    rejectUnauthorized: false
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
