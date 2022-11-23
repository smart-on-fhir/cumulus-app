require("dotenv").config();

const HTTP                        = require("http")
const Path                        = require("path")
const express                     = require("express")
const cors                        = require("cors")
const cookieParser                = require("cookie-parser")
const Auth                        = require("./controllers/Auth")
const setupDB                     = require("./db").default
const settings                    = require("./config")
const { logger }                  = require("./logger");


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
                "http", // res.statusCode >= 400 ? "error" : "http",
                `${res.statusCode} ${req.method.padStart(6)} ${decodeURIComponent(req.originalUrl)}`,
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
    app.use("/api/request-groups", require("./controllers/RequestGroup").default);
    app.use("/api/requests"      , require("./controllers/DataRequest" ));
    app.use("/api/views"         , require("./controllers/View"        ));
    app.use("/api/users"         , require("./routes/users"            ));
    app.use("/api/projects"      , require("./routes/projects"         ));
    app.use("/api/logs"          , require("./routes/logs"             ));
    app.use("/api/tags"          , require("./routes/tags"             ));
    app.use("/api/activity"      , require("./controllers/Activity"    ));
    app.use("/api/data-sites"    , require("./controllers/DataSites"   ));
    logger.verbose("✔ REST API set up");
}

function setupStaticContent(app)
{
    app.get("/favicon.ico", (req, res) => res.status(404).end());
    app.use(express.static(Path.join(__dirname, "../build/")));
    app.get("*", (req, res) => res.sendFile("index.html", { root: Path.join(__dirname, "../build/") }));
    logger.verbose("✔ Static content hosted");
}


function setUpErrorHandlers(app)
{
    // Global error 404 handler
    app.use((req, res) => {
        logger.error(`${req.method} ${decodeURIComponent(req.originalUrl)} -> 404 Not Found`)
        res.sendStatus(404).end("Not Found");
    });

    // Global error 500 handler
    app.use((error, req, res, next) => {
        
        // HTTP Errors
        if (error.http) {
            error.data = { ...error.data, user: req.user?.email || "guest" }
            error.tags = error.data.tags
            delete error.data.tags
            if (req.method === "POST" || req.method === "PUT") {
                error.data.requestBody = req.body
            }
            logger.error(`${error.status} ${req.method.padStart(6)} ${decodeURIComponent(req.originalUrl)} => `, error)
            const msg = error.message.replace(/^\s*\w*Error:\s+/, "")
            res.status(error.status).send(msg)
        }

        // Sequelize Validation Errors
        else if (error.name === "SequelizeValidationError") {
            const msg = error.errors.map(e => `${req.method.padStart(6)} ${decodeURIComponent(req.originalUrl)} => ${e.type || "Error"} while validating ${e.path || "data"}: ${e.message}`).join("\n")
            logger.error("Sequelize Validation Error " + JSON.stringify(error, null, 4))
            res.status(400).send(msg);
        }

        // Other Errors
        else {
            const msg = `${req.method.padStart(6)} ${decodeURIComponent(req.originalUrl)} => ${error.message.replace(/^\s*\w*Error:\s+/, "")}`
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

