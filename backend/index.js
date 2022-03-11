require("dotenv").config();

const HTTP             = require("http")
const Path             = require("path")
const express          = require("express")
const cors             = require("cors")
const cookieParser     = require("cookie-parser")
const { Sequelize }    = require("sequelize")
const Auth             = require("./controllers/Auth")
const { getDockerContainer } = require("./Docker")
const { walkSync } = require("./lib")





function createServer(config)
{
    const app    = express();
    const server = new HTTP.Server(app);

    app.set('etag', false);  

    app.use(cors({ origin: true, credentials: true }));

    config.verbose && console.log("✔ Created a server");

    if (config.throttle) {
        app.use((rec, res, next) => setTimeout(next, 1000));
        config.verbose && console.log(
            "✔ \u001b[1m\u001b[35mAll responses delayed by %sms\u001b[39m\u001b[22m",
            config.throttle
        );
    }

    return { app, server };
}

function setupAuth(app, config)
{
    // We use cookies for user sessions
    app.use(cookieParser(), Auth.authenticate);
    app.use("/api/auth", Auth.router);
    config.verbose && console.log("✔ Authentication set up");
}

function setupAPI(app, { verbose })
{
    app.use("/api/request-groups", require("./controllers/RequestGroup"));
    app.use("/api/requests"      , require("./controllers/DataRequest" ));
    app.use("/api/views"         , require("./controllers/View"        ));
    app.use("/api/users"         , require("./controllers/User"        ));
    app.use("/api/activity"      , require("./controllers/Activity"    ));
    app.use("/api/data-sites"    , require("./controllers/DataSites"   ));
    verbose && console.log("✔ REST API set up");
}

function setupStaticContent(app, { verbose })
{
    app.get("/favicon.ico", (req, res) => res.status(404).end());
    app.use(express.static(Path.join(__dirname, "../build/")));
    app.use("/api/screenshot", express.static(Path.join(__dirname, "screenShots")));
    app.get("*", (req, res) => res.sendFile("index.html", { root: "../build" }));
    verbose && console.log("✔ Static content hosted");
}

async function setupDB({ db, docker, verbose })
{
    // await initDB()
    // verbose && console.log("✔ Database initialized");

    // Bring up a Docker container ---------------------------------------------
    if (docker?.containerName && !process.env.GITHUB_CI) {
        await getDockerContainer(docker.containerNames)
        verbose && console.log(`✔ Initialized Docker container "${docker.containerName}"`)
    }

    let connection;

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
    for (let path of walkSync(Path.join(__dirname, "./db/models"))) {
        verbose && console.log(`  - Initializing model from ${path.replace(__dirname, "backend")}`)
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

    require("./Scheduler");
    
    return connection;
}

async function applySeeds({ db, verbose }, dbConnection)
{
    const seedPath = db.seed;
    if (seedPath) {
        const seed = require(seedPath);
        await seed(dbConnection);
        verbose && console.log(`✔ Applied seeds from ${seedPath.replace(__dirname, "")}`);
    } else {
        verbose && console.log("- Seeding the database SKIPPED because config.db.seedPath is not set!");
    }
}

async function applyMigrations({ db, verbose }, dbConnection)
{
    const migrationsPath = db.migrationsPath;
    if (migrationsPath) {
        const umzug = new Umzug({
            // @ts-ignore
            migrations: {
                path: __dirname + "/db/" + migrationsPath,
                // @ts-ignore
                wrap: fn => () => fn(dbConnection.getQueryInterface(), Sequelize)
            },
            storageOptions: {
                dbConnection,
                model: dbConnection.models.migrations,
                schema: 'public',
            },
            storage: "sequelize",
        });

        const pending = await umzug.pending();
        verbose && console.log("✔ Pending migrations: %s", pending.length ? pending.map(m => m.file).join(',') : "none")
        
        // Checks migrations and run them if they are not already applied.
        // Metadata stored in the SequelizeMeta table in postgres
        const migrations = await umzug.up();
        verbose && console.log('✔ Successful migrations: %s', migrations.length ? migrations.map(m => m.file).join(','): "none")
    }
}

function setUpErrorHandlers(app, { verbose })
{
    // Global error 404 handler
    app.use((_, res) => {
        res.sendStatus(404).end("Not Found");
    });

    // Global error 500 handler
    app.use((error, req, res, next) => {

        console.error(error)

        const msg = error.message.replace(/^\s*\w*Error:\s+/, "")
        
        // HTTP Errors
        if (error.http) {
            return res.status(error.status).end(msg);
        }

        // Sequelize Validation Errors
        if (error.name === "SequelizeValidationError") {
            return res.status(400).send(error.errors.map(e => (
                `${e.type || "Error"} while validating ${e.path || "data"}: ${e.message}`
            )).join("\n"));
        }

        // Other Errors
        res.status(500).end(msg);
    });

    verbose && console.log("✔ Error handlers activated");
}

/**
 * @param {HTTP.Server} server 
 * @param {object} config 
 * @returns {Promise<HTTP.Server>}
 */
function startServer(server, config)
{
    return new Promise(resolve => {
        server.listen(config.port, config.host, () => {

            let addr = server.address();

            if (addr && typeof addr != "string") {
                const { address, port } = addr;
                addr = `http://${address}:${port}`;
            }

            console.log("✔ \u001b[1m\u001b[33mServer listening on %s\u001b[39m\u001b[22m", addr);

            resolve(server);
        });
    });
}

async function main(config)
{
    const { app, server } = createServer(config);

    const dbConnection = await setupDB(config);
    
    await applySeeds(config, dbConnection);
    // await applyMigrations(config, dbConnection);
    
    // app.set("db", dbConnection);
    
    setupAuth(app, config);
    setupAPI(app, config);
    setupStaticContent(app, config);
    setUpErrorHandlers(app, config);

    await startServer(server, config);

    // Start the server --------------------------------------------------------
    return { server, app, config };
}

// If invoked directly start a server (otherwise let the tests do that)
if (require.main === module) {
    main(require("./config"));
}

module.exports = main;

