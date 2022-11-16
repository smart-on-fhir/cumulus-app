require("dotenv").config();

const HTTP                        = require("http")
const Path                        = require("path")
const express                     = require("express")
const cors                        = require("cors")
const cookieParser                = require("cookie-parser")
const { Umzug, SequelizeStorage } = require("umzug");
// const { debuglog }                = require("util");
const Auth                        = require("./controllers/Auth")
const setupDB                     = require("./db")
const settings                    = require("./config")
const { logger }                  = require("./logger");
// const { getRequestBaseURL } = require("./lib");

// const debug = debuglog("app");


function createServer(config)
{
    const app    = express();
    const server = new HTTP.Server(app);

    app.set('etag', false);  

    app.use(cors({ origin: true, credentials: true }));

    logger.verbose("✔ Created a server");

    app.use((req, res, next) => {
        res.on("finish", () => {
            const meta = {
                tags     : ["WEB"],
                userAgent: req.headers["user-agent"],
                ip       : req.ip,
                user     : req.user?.email || "guest"
            }
            
            if (req.method === "POST" || req.method === "PUT") {
                meta.requestBody = req.body
            }
            
            logger.log(
                res.statusCode >= 400 ? "error" : "http",
                `${res.statusCode} ${req.method.padStart(6)} ${req.originalUrl}`,
                meta
            )
        })
        next()
    });

    if (config.throttle) {
        app.use((rec, res, next) => setTimeout(next, 1000));
        logger.verbose("All responses delayed by %sms", config.throttle);
    }

    server.requestTimeout = 0;

    return { app, server };
}

function setupAuth(app)
{
    // We use cookies for user sessions
    app.use(cookieParser(), Auth.authenticate);
    app.use("/api/auth", Auth.router);
    logger.verbose("✔ Authentication set up");
}

function setupAPI(app)
{
    app.use("/api/request-groups", require("./controllers/RequestGroup"));
    app.use("/api/requests"      , require("./controllers/DataRequest" ));
    app.use("/api/views"         , require("./controllers/View"        ));
    app.use("/api/users"         , require("./routes/users"            ));
    app.use("/api/projects"      , require("./routes/projects"         ));
    app.use("/api/logs"          , require("./routes/logs"             ));
    app.use("/api/activity"      , require("./controllers/Activity"    ));
    app.use("/api/data-sites"    , require("./controllers/DataSites"   ));
    logger.verbose("✔ REST API set up");
}

function setupStaticContent(app)
{
    app.get("/favicon.ico", (req, res) => res.status(404).end());
    app.use(express.static(Path.join(__dirname, "../build/")));
    app.get("*", (req, res) => res.sendFile("index.html", { root: "../build" }));
    logger.verbose("✔ Static content hosted");
}

async function applySeeds({ db }, dbConnection)
{
    const seedPath = db.seed;
    if (seedPath) {
        const seed = require(seedPath);
        await seed(dbConnection);
        logger.verbose(`✔ Applied seeds from ${seedPath.replace(__dirname, "")}`);
    } else {
        logger.verbose("- Seeding the database SKIPPED because config.db.seedPath is not set!");
    }
}

async function applyMigrations({ db }, dbConnection)
{
    const umzug = new Umzug({
        context: dbConnection.getQueryInterface(),
        migrations: {
            glob: ["db/migrations/*.js", { cwd: __dirname }],
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
        logger: db.logging
    });

    const pending = await umzug.pending();
    logger.verbose("✔ Pending migrations: %s", pending.length ? pending.map(m => m.path).join(',') : "none")
    
    // Checks migrations and run them if they are not already applied.
    // Metadata stored in the SequelizeMeta table in postgres
    const migrations = await umzug.up();
    logger.verbose('✔ Successful migrations: %s', migrations.length ? migrations.map(m => m.path).join(','): "none")
}

function setUpErrorHandlers(app)
{
    // Global error 404 handler
    app.use((req, res) => {
        logger.error(`${req.method} ${req.originalUrl} -> 404 Not Found`)
        res.sendStatus(404).end("Not Found");
    });

    // Global error 500 handler
    app.use((error, req, res, next) => {
        
        // HTTP Errors
        if (error.http) {
            const msg = error.message.replace(/^\s*\w*Error:\s+/, "")
            error.data = { ...error.data, user: req.user?.email || "guest" }
            if (req.method === "POST" || req.method === "PUT") {
                error.data.requestBody = req.body
            }
            logger.error(`${error.status} ${req.method.padStart(6)} ${req.originalUrl} => `, error)
            res.status(error.status).send(msg);
        }

        // Sequelize Validation Errors
        else if (error.name === "SequelizeValidationError") {
            const msg = error.errors.map(e => `${req.method.padStart(6)} ${req.originalUrl} => ${e.type || "Error"} while validating ${e.path || "data"}: ${e.message}`).join("\n")
            logger.error("Sequelize Validation Error " + JSON.stringify(error, null, 4))
            res.status(400).send(msg);
        }

        // Other Errors
        else {
            const msg = `${req.method.padStart(6)} ${req.originalUrl} => ${error.message.replace(/^\s*\w*Error:\s+/, "")}`
            logger.error(msg, error)
            res.status(500).send(msg);
        }

        res.end()
    });

    logger.verbose("✔ Error handlers activated");
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

            logger.verbose("✔ Server listening on %s", addr);

            resolve(server);
        });
    });
}

async function main(config = settings)
{
    const { app, server } = createServer(config);

    const dbConnection = await setupDB(config);

    app.set("dbConnection", dbConnection);
    
    await applySeeds(config, dbConnection);
    await applyMigrations(config, dbConnection);
    
    // app.set("db", dbConnection);
    
    setupAuth(app);
    setupAPI(app);
    setupStaticContent(app);
    setUpErrorHandlers(app);

    await startServer(server, config);

    // Start the server --------------------------------------------------------
    return { server, app, config };
}

// If invoked directly start a server (otherwise let the tests do that)
if (require.main === module) {
    main();
}

module.exports = main;

