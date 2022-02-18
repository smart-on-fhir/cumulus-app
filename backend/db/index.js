const Path = require("path")
const { Sequelize } = require("sequelize");
const { debuglog }  = require("util");
const colors        = require("colors")
const config        = require("../config");
const { walkSync } = require("../lib");
const debugDB       = debuglog("app:db");

// @ts-ignore
// const DB = new Sequelize(config.db.options);
const DB = new Sequelize({
    dialect: 'sqlite',
    storage: __dirname + '/cumulus.db',
    logging: false
});

/**
 * @param {Sequelize} connection 
 */
function initModels(connection, verbose = false) {
    for (let path of walkSync(Path.join(__dirname, "./models"))) {
        verbose && console.log(`  - Initializing model from ${path.replace(__dirname, "backend/db")}`)
        require(path).initialize(connection);
    }

    verbose && console.log(colors.bold("  Activating associations..."));

    Object.keys(connection.models).forEach(modelName => {

        // @ts-ignore
        const associate = connection.models[modelName].associate;
        if (associate) {
            try {
                associate(connection);
            } catch (e) {
                console.log(`Activating the associations of model "${modelName}" FAILED!`)
                throw e
            }
        }
    });
}

// initModels(DB, true)


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
