require("dotenv").config();

const HTTP                        = require("http")
const Path                        = require("path")
const express                     = require("express")
const cors                        = require("cors")
const cookieParser                = require("cookie-parser")
const { Umzug, SequelizeStorage } = require("umzug");
const { debuglog }                = require("util");
const Auth                        = require("./controllers/Auth")
const setupDB                     = require("./db")
const settings                    = require("./config")

const debug = debuglog("app");


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

    server.requestTimeout = 0;

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
    app.use("/api/users"         , require("./routes/users"            ));
    app.use("/api/activity"      , require("./controllers/Activity"    ));
    app.use("/api/data-sites"    , require("./controllers/DataSites"   ));
    verbose && console.log("✔ REST API set up");
}

function setupStaticContent(app, { verbose })
{
    app.get("/favicon.ico", (req, res) => res.status(404).end());
    app.use(express.static(Path.join(__dirname, "../build/")));
    app.get("*", (req, res) => res.sendFile("index.html", { root: "../build" }));
    verbose && console.log("✔ Static content hosted");
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
        logger: verbose ? console : undefined
    });

    const pending = await umzug.pending();
    verbose && console.log("✔ Pending migrations: %s", pending.length ? pending.map(m => m.path).join(',') : "none")
    
    // Checks migrations and run them if they are not already applied.
    // Metadata stored in the SequelizeMeta table in postgres
    const migrations = await umzug.up();
    verbose && console.log('✔ Successful migrations: %s', migrations.length ? migrations.map(m => m.path).join(','): "none")
}

function setUpErrorHandlers(app, { verbose })
{
    // Global error 404 handler
    app.use((_, res) => {
        res.sendStatus(404).end("Not Found");
    });

    // Global error 500 handler
    app.use((error, req, res, next) => {

        debug(error)

        const msg = error.message.replace(/^\s*\w*Error:\s+/, "")
        
        // HTTP Errors
        if (error.http) {
            res.status(error.status).send(msg);
        }

        // Sequelize Validation Errors
        else if (error.name === "SequelizeValidationError") {
            res.status(400).send(error.errors.map(e => (
                `${e.type || "Error"} while validating ${e.path || "data"}: ${e.message}`
            )).join("\n"));
        }

        // Other Errors
        else {
            res.status(500).send(msg);
        }

        res.end()
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

async function main(config = settings)
{
    const { app, server } = createServer(config);

    const dbConnection = await setupDB(config);

    app.set("dbConnection", dbConnection);
    
    await applySeeds(config, dbConnection);
    await applyMigrations(config, dbConnection);
    
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
    main();
}

module.exports = main;

