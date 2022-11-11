const Path                   = require("path");
const { Sequelize }          = require("sequelize");
const { getDockerContainer } = require("../Docker");
const { walkSync }           = require("../lib");

/** @type {Sequelize} */
let connection;

/**
 * 
 * @param {object} options 
 * @param {object} options.db
 * @param {object} options.docker
 * @param {boolean} options.verbose
 * @returns 
 */
async function setupDB(options)
{
    if (connection) {
        return connection;
    }

    const { db, docker, verbose } = options

    // Bring up a Docker container ---------------------------------------------
    if (docker?.containerName && !process.env.GITHUB_CI) {
        try {
            await getDockerContainer(options)
        } catch (ex) {
            if (ex.failed && !ex.isCanceled && !ex.killed) {
                console.error(ex.message)
                process.exit(ex.exitCode)
            }
            throw ex
        }
        verbose && console.log(`✔ Initialized Docker container "${docker.containerName}"`)
    }

    // Test connection ---------------------------------------------------------
    try {
        connection = new Sequelize(db.options);
        await connection.authenticate();
        verbose && console.log("✔ Connected to the database");
    } catch (ex) {
        console.log("\u001b[1m\u001b[31m✘ Failed to connected to the database\u001b[39m\u001b[22m");
        throw ex;
    }

    // Initialize models -------------------------------------------------------
    for (let path of walkSync(Path.join(__dirname, "./models"))) {
        verbose && console.log(`  - Initializing model from ${path.replace(__dirname, "backend/db")}`)
        require(path).initialize(connection);
    }

    // Apply associations ------------------------------------------------------
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
    verbose && console.log("✔ Activated model associations");


    // Sync --------------------------------------------------------------------

    // This creates the table if it doesn't exist (and does nothing if it already
    // exists)
    if (db.sync == "normal") {
        await connection.sync()  
        verbose && console.log(`✔ Created tables which did not exist (if any)`)
    }

    // This creates the table, dropping it first if it already existed
    if (db.sync == "force") {
        await connection.sync({ force: true })
        verbose && console.log(`✔ Dropped and re-created tables`)
    }

    // This checks what is the current state of the table in the database (which
    // columns it has, what are their data types, etc), and then performs the
    // necessary changes in the table to make it match the model.
    if (db.sync == "alter") {
        await connection.sync({ alter: true })
        verbose && console.log(`✔ Updated tables to match model structures`)
    }

    require("../Scheduler");
    
    return connection;
}

module.exports = setupDB;
