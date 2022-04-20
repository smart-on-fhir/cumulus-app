const { Sequelize } = require("sequelize");
const { debuglog }  = require("util");
const colors        = require("colors")
const config        = require("../config");
const debugDB       = debuglog("app:db");

// @ts-ignore
// const DB = new Sequelize(config.db.options);
const DB = new Sequelize({
    dialect: 'sqlite',
    storage: __dirname + '/cumulus.db',
    logging: false
});

module.exports = DB;

module.exports.init = async () => {

    // test connection
    await DB.authenticate();
    config.verbose && console.log("✔ Connected to the database");

    // This creates the table if it doesn't exist (and does nothing if it already
    // exists)
    if (config.db.sync == "normal") {
        await DB.sync({ force: true })    
    }

    // This creates the table, dropping it first if it already existed
    if (config.db.sync == "force") {
        await DB.sync({ force: true })    
    }

    // This checks what is the current state of the table in the database (which
    // columns it has, what are their data types, etc), and then performs the
    // necessary changes in the table to make it match the model.
    if (config.db.sync == "alter") {
        await DB.sync({ alter: true })
    }

    if (config.db.seed) {
        debugDB(colors.bold("Inserting seeds ..."));
        await require(config.db.seed)(DB);
    }

};
