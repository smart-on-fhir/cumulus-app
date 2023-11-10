require("dotenv").config();

import HTTP                     from "http"
import Path                     from "path"
import express, { Application } from "express"
import cors                     from "cors"
import cookieParser             from "cookie-parser"
import { Sequelize }            from "sequelize";
import * as Auth                from "./controllers/Auth"
import setupDB                  from "./db"
import settings                 from "./config"
import { logger }               from "./logger"
import { AppRequest, Config }   from "./types"


function createServer(config: Config)
{
    const app    = express();
    const server = new HTTP.Server(app);

    app.set('etag', false);  

    app.use(cors({ origin: true, credentials: true }));

    logger.verbose("✔ Created a server");

    app.use((req, res, next) => {
        res.on("finish", () => {
            const meta: Record<string, any> = {
                tags     : ["WEB"],
                userAgent: req.headers["user-agent"],
                ip       : req.socket ? req.ip : undefined,
                user     : (req as AppRequest).user?.email || "guest"
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

function setupAuth(app: Application, dbConnection: Sequelize)
{
    app.use(cookieParser(), Auth.authenticate(dbConnection));
    app.use("/api/auth", Auth.router);
    logger.verbose("✔ Authentication set up");
}

function setupAPI(app: Application)
{
    app.use("/api/request-groups", require("./routes/groups"           ).default);
    app.use("/api/requests"      , require("./controllers/DataRequest" ));
    app.use("/api/views"         , require("./routes/views"            ).default);
    app.use("/api/users"         , require("./routes/users"            ).default);
    app.use("/api/projects"      , require("./routes/projects"         ).default);
    app.use("/api/logs"          , require("./routes/logs"             ).default);
    app.use("/api/tags"          , require("./routes/tags"             ).default);
    app.use("/api/data-sites"    , require("./routes/sites"            ).default);
    app.use("/api/aggregator"    , require("./routes/aggregator"       ).default);
    logger.verbose("✔ REST API set up");
}

function setupStaticContent(app: Application)
{
    app.get("/favicon.ico", (req, res) => res.status(404).end());
    app.use(express.static(Path.join(__dirname, "../build/")));
    app.get("*", (req, res) => res.sendFile("index.html", { root: Path.join(__dirname, "../build/") }));
    logger.verbose("✔ Static content hosted");
}

function setUpErrorHandlers(app: Application)
{
    // Global error 404 handler
    app.use((req, res) => {
        logger.error(`${req.method} ${decodeURIComponent(req.originalUrl)} -> 404 Not Found`)
        res.status(404).end("Not Found");
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

function startServer(server: HTTP.Server, config: Config)
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

async function main(config: Config = settings)
{
    const { app, server } = createServer(config);
    const dbConnection = await setupDB(config);
    setupAuth(app, dbConnection);
    setupAPI(app);
    setupStaticContent(app);
    setUpErrorHandlers(app);
    await startServer(server, config);
    return { server, app, config };
}

// If invoked directly start a server (otherwise let the tests do that)
if (require.main === module) {
    main();
}

export default main;

