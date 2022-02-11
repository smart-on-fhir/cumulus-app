const Path     = require("path");
const { bool, uInt } = require("./lib");

const {
    NODE_ENV    = "production",
    HOST        = "0.0.0.0",
    PORT        = "4000",
    DB_SEED     = "db/seeds.js",
    DB_SYNC     = "force", // normal|force|alter|none
    DB_HOST     = "",
    DB_PORT     = "",
    DB_USER     = "",
    DB_PASS     = "",
    DB_DATABASE = ""
} = process.env;


module.exports = {
    port: uInt(PORT),
    host: HOST,
    db: {
        sync     : DB_SYNC,
        seed     : bool(DB_SEED) ? Path.join(__dirname, DB_SEED) : "",
        options: {
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            },
            dialect : "postgres",
            database: DB_DATABASE,
            logging : NODE_ENV === "production" ? false : console.log,
            username: DB_USER,
            password: DB_PASS,
            port    : DB_PORT,
            host    : DB_HOST
        }
    }
};
