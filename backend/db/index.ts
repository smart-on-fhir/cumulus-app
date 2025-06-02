import { join }                            from "path"
import { Sequelize }                       from "sequelize"
import { Umzug, SequelizeStorage }         from "umzug"
import { Config }                          from "../types"
import { getDockerContainer }              from "./Docker"
import * as logger                         from "../services/logger"
import { attachHooks, init as initModels } from "./models"
import { seedTable }                       from "./seeds/lib"


let connection: Sequelize;

async function waitForDatabaseServer(options: Config)
{
    if (options.docker?.containerName && !process.env.GITHUB_CI) {
        try {
            await getDockerContainer(options)
        } catch (ex) {
            if ((ex as any).failed && !(ex as any).isCanceled && !(ex as any).killed) {
                logger.error(ex + "")
                process.exit((ex as any).exitCode)
            }
            throw ex
        }
        logger.verbose(`✔ Initialized Docker container "${options.docker.containerName}"`)
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
        logger.error("✘ Failed to connected to the database", { ...(ex as any) });
        throw ex;
    }
}

async function syncModels(options: Config)
{
    // This creates the table, dropping it first if it already existed
    if (options.db.sync == "force") {
        await connection.sync({ force: true })
        logger.verbose(`✔ Dropped and re-created tables`)
    }
    
    // This creates the table if it doesn't exist (and does nothing if it already
    // exists)
    else {
    // if (options.db.sync == "normal") {
        await connection.sync()
        logger.verbose(`✔ Created tables which did not exist (if any)`)
    }

    

    // This checks what is the current state of the table in the database (which
    // columns it has, what are their data types, etc), and then performs the
    // necessary changes in the table to make it match the model.
    // if (options.db.sync == "alter") {
    //     await connection.sync({ alter: true })
    //     logger.verbose(`✔ Updated tables to match model structures`)
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
        migrations: { glob: ["migrations/*.{js,ts}", { cwd: __dirname }] },
        storage: new SequelizeStorage({ sequelize: dbConnection, tableName: "SequelizeMeta" }),
        logger: {
            debug: msg => logger.debug(msg.event + " " + msg.name, { ...msg }),
            info : msg => logger.info (msg.event + " " + msg.name, { ...msg }),
            warn : msg => logger.warn (msg.event + " " + msg.name, { ...msg }),
            error: msg => logger.error(msg.event + " " + msg.name, { ...msg })
        }
    });

    const pending = await umzug.pending();
    logger.verbose("✔ Pending migrations: %s", pending.length ? pending.map(m => m.path) : "none")
    
    // Checks migrations and run them if they are not already applied.
    // Metadata stored in the SequelizeMeta table in postgres
    const migrations = await umzug.up();
    logger.verbose('✔ Successful migrations: %s', migrations.length ? migrations.map(m => m.path): "none")
}

async function applySeeds(dbConnection: Sequelize)
{
    const { NODE_ENV = "development" } = process.env
    
    // Only recognize these 3 environments
    if (!["production", "development", "test"].includes(NODE_ENV)) {
        return
    }

    const seedPath = join(__dirname, "seeds", NODE_ENV)

    // Seed the database, but only if the users table is empty
    const count = await dbConnection.models.User.count()
    if (count > 0) {
        logger.verbose("- Seeding the database SKIPPED because the users table is not empty");
        return
    }

    const { seed } = await import(seedPath);
    try {
        await seed(dbConnection);
    } catch (error) {
        logger.error("Applying seeds failed %o", error)
        throw error
    }

    logger.verbose(`✔ Applied seeds from ${seedPath.replace(__dirname, "")}`);
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

    // Create missing tables (or recreate all of them if sync = 'force')
    await syncModels(options)

    // Run pending migrations (if any)
    await applyMigrations(options, connection)

    // Insert seeds (if enabled)
    await applySeeds(connection)

    attachHooks(connection)
    
    return connection;
}
