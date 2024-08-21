import { join }                            from "path"
import { Sequelize }                       from "sequelize"
import { Umzug, SequelizeStorage }         from "umzug"
import { Config }                          from "../types"
import { getDockerContainer }              from "./Docker"
import * as logger                         from "../services/logger"
import { attachHooks, init as initModels } from "./models"
import { seedTable }                       from "./seeds/lib"
import { runScheduler }                    from "../services/Scheduler"


let connection: Sequelize;

async function waitForDatabaseServer(options: Config)
{
    if (options.docker?.containerName && !process.env.GITHUB_CI) {
        try {
            await getDockerContainer(options)
        } catch (ex) {
            if (ex.failed && !ex.isCanceled && !ex.killed) {
                logger.error(ex)
                process.exit(ex.exitCode)
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
        logger.error("✘ Failed to connected to the database", { ...ex });
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
        migrations: { glob: ["migrations/*.ts", { cwd: __dirname }] },
        storage: new SequelizeStorage({ sequelize: dbConnection }),
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

async function applySeeds(options: Config, dbConnection: Sequelize)
{
    const seedPath = options.db.seed;
    if (seedPath) {
        // If we have 0 users then the the entire DB should be empty
        const count = await dbConnection.models.User.count()
        if (count > 0) {
            logger.verbose("- Seeding the database SKIPPED because the users table is not empty");

            // However, even if the DB is not empty the Permissions table might be
            const permissionCount =  await dbConnection.models.Permission.count()
            if (permissionCount === 0) {
                logger.verbose("- Seeding default permissions...");
                const path = join(seedPath, "permissions.ts")
                try {
                    const data = await import(path);
                    await seedTable(dbConnection, "Permission", data)
                } catch (error) {
                    logger.error("Applying seeds failed %o", error)
                    process.exit(1)
                }
                logger.verbose(`✔ Applied seeds from ${path.replace(__dirname, "")}`);
            }
        } else {
            const { seed } = await import(seedPath);
            try {
                await seed(dbConnection);
            } catch (error) {
                logger.error("Applying seeds failed %o", error)
                process.exit(1)
            }
            logger.verbose(`✔ Applied seeds from ${seedPath.replace(__dirname, "")}`);
        }
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

    attachHooks(connection)

    runScheduler();
    
    return connection;
}
