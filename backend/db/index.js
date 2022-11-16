const Path                   = require("path");
const { Sequelize }          = require("sequelize");
const { getDockerContainer } = require("../Docker");
const { walkSync }           = require("../lib");
const { logger }             = require("../logger");

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

    const { db, docker } = options

    // Bring up a Docker container ---------------------------------------------
    if (docker?.containerName && !process.env.GITHUB_CI) {
        try {
            await getDockerContainer(options)
        } catch (ex) {
            if (ex.failed && !ex.isCanceled && !ex.killed) {
                logger.error(ex, { tags: ["DOCKER"] })
                process.exit(ex.exitCode)
            }
            throw ex
        }
        logger.verbose(`✔ Initialized Docker container "${docker.containerName}"`, { tags: ["DATA"] })
    }

    // Test connection ---------------------------------------------------------
    try {
        connection = new Sequelize(db.options);
        await connection.authenticate();
        logger.verbose("✔ Connected to the database");
    } catch (ex) {
        logger.error("✘ Failed to connected to the database", { ...ex, tags: ["DATA"] });
        throw ex;
    }

    // Initialize models -------------------------------------------------------
    for (let path of walkSync(Path.join(__dirname, "./models"))) {
        logger.verbose(`  - Initializing model from ${path.replace(__dirname, "backend/db")}`, { tags: ["DATA"] })
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
                logger.error(`Activating the associations of model "${modelName}" FAILED!`, { ...e, tags: ["DATA"] })
                throw e
            }
        }
    });
    logger.verbose("✔ Activated model associations", { tags: ["DATA"] });


    // Sync --------------------------------------------------------------------

    // This creates the table if it doesn't exist (and does nothing if it already
    // exists)
    if (db.sync == "normal") {
        await connection.sync()  
        logger.verbose(`✔ Created tables which did not exist (if any)`, { tags: ["DATA"] })
    }

    // This creates the table, dropping it first if it already existed
    if (db.sync == "force") {
        await connection.sync({ force: true })
        logger.verbose(`✔ Dropped and re-created tables`, { tags: ["DATA"] })
    }

    // This checks what is the current state of the table in the database (which
    // columns it has, what are their data types, etc), and then performs the
    // necessary changes in the table to make it match the model.
    if (db.sync == "alter") {
        await connection.sync({ alter: true })
        logger.verbose(`✔ Updated tables to match model structures`, { tags: ["DATA"] })
    }

    require("../Scheduler");
    
    return connection;
}

module.exports = setupDB;
