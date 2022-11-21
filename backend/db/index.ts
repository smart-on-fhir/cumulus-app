import { Sequelize }               from "sequelize"
import { Umzug, SequelizeStorage } from "umzug"
import { Config }                  from ".."
import { getDockerContainer }      from "./Docker"
import { logger }                  from "../logger"
import { init as initModels }      from "./models"


let connection: Sequelize;

async function waitForDatabaseServer(options: Config)
{
    if (options.docker?.containerName && !process.env.GITHUB_CI) {
        try {
            await getDockerContainer(options)
        } catch (ex) {
            if (ex.failed && !ex.isCanceled && !ex.killed) {
                logger.error(ex, { tags: ["DOCKER"] })
                process.exit(ex.exitCode)
            }
            throw ex
        }
        logger.verbose(`✔ Initialized Docker container "${options.docker.containerName}"`, { tags: ["DATA"] })
    }
}

async function connectToDatabase(options: Config)
{
    try {
        const connection = new Sequelize(options.db.options);
        await connection.authenticate();
        logger.verbose("✔ Connected to the database");
        return connection
    } catch (ex) {
        logger.error("✘ Failed to connected to the database", { ...ex, tags: ["DATA"] });
        throw ex;
    }
}

async function applyAssociations()
{
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
}

async function syncModels(options: Config)
{
    // This creates the table, dropping it first if it already existed
    if (options.db.sync == "force") {
        await connection.sync({ force: true })
        logger.verbose(`✔ Dropped and re-created tables`, { tags: ["DATA"] })
    }
    
    // This creates the table if it doesn't exist (and does nothing if it already
    // exists)
    else {
    // if (options.db.sync == "normal") {
        await connection.sync()
        logger.verbose(`✔ Created tables which did not exist (if any)`, { tags: ["DATA"] })
    }

    

    // This checks what is the current state of the table in the database (which
    // columns it has, what are their data types, etc), and then performs the
    // necessary changes in the table to make it match the model.
    // if (options.db.sync == "alter") {
    //     await connection.sync({ alter: true })
    //     logger.verbose(`✔ Updated tables to match model structures`, { tags: ["DATA"] })
    // }
}

async function applyMigrations(options: Config, dbConnection: Sequelize)
{
    if (options.db.sync === "force") {
        logger.verbose("- migrations are skipped if db.sync is set to 'force'");
        return
    }

    const umzug = new Umzug({
        context: dbConnection.getQueryInterface(),
        migrations: {
            glob: ["migrations/*.js", { cwd: __dirname }],
            resolve: ({ name, path, context }) => {

                // @ts-ignore
                const migration = require(path);
                
                // adjust the parameters Umzug will
                // pass to migration methods when called
                return {
                    name,
                    up: async () => migration.up(context),
                    down: async () => migration.down(context),
                };
            }
        },
        storage: new SequelizeStorage({ sequelize: dbConnection }),
        logger: {
            debug: msg => logger.debug(msg.event + " " + msg.name, { ...msg, tags: ["DATA"] }),
            info : msg => logger.info (msg.event + " " + msg.name, { ...msg, tags: ["DATA"] }),
            warn : msg => logger.warn (msg.event + " " + msg.name, { ...msg, tags: ["DATA"] }),
            error: logger.error
        }
    });

    const pending = await umzug.pending();
    logger.verbose("✔ Pending migrations: %s", pending.length ? pending.map(m => m.path) : "none")
    
    // Checks migrations and run them if they are not already applied.
    // Metadata stored in the SequelizeMeta table in postgres
    const migrations = await umzug.up();
    logger.verbose('✔ Successful migrations: %s', migrations.length ? migrations.map(m => m.path): "none")
}

async function applySeeds(options: Config, dbConnection: Sequelize)
{
    const seedPath = options.db.seed;
    if (seedPath) {
        const seed = require(seedPath);
        try {
            await seed(dbConnection);
        } catch (error) {
            logger.error("Applying seeds failed %o", error)
            process.exit(1)
        }
        logger.verbose(`✔ Applied seeds from ${seedPath.replace(__dirname, "")}`);
    } else {
        logger.verbose("- Seeding the database SKIPPED because config.db.seedPath is not set!");
    }
}

export default async function setupDB(options: Config): Promise<Sequelize>
{
    if (connection) {
        return connection;
    }

    // In case DB is in Docker container wat for it
    await waitForDatabaseServer(options)

    // Test connection and return it if successful
    connection = await connectToDatabase(options)

    // Load models and call their init method
    initModels(connection)

    // Run pending migrations (if any)
    await applyMigrations(options, connection)
    
    // Create missing tables (or recreate all of them if sync = 'force')
    await syncModels(options)

    // Insert seeds (if enabled)
    await applySeeds(options, connection)

    require("../Scheduler");
    
    return connection;
}
