import HTTP                     from "http"
import Path                     from "path"
import express, { Application } from "express"
import cors                     from "cors"
import cookieParser             from "cookie-parser"
import * as Auth                from "./routes/Auth"
import setupDB                  from "./db"
import settings                 from "./config"
import * as logger              from "./services/logger"
import * as api                 from "./routes"
import { Config, AppErrorRequestHandler } from "./types"


function createServer(config: Config)
{
    const app    = express();
    const server = new HTTP.Server(app);

    app.set('etag', false);  

    app.use(cors({ origin: true, credentials: true }));

    logger.verbose("✔ Created a server");

    if (config.throttle) {
        app.use((rec, res, next) => setTimeout(next, config.throttle));
        logger.verbose("All responses delayed by %sms", config.throttle);
    }

    server.requestTimeout = 0;

    return { app, server };
}

function setupAuth(app: Application)
{
    app.use(cookieParser(), Auth.authenticate());
    app.use("/api/auth", Auth.router);
    logger.verbose("✔ Authentication set up");
}

function setupAPI(app: Application)
{
    app.use("/api/request-groups", api.groupsRouter       );
    app.use("/api/requests"      , api.subscriptionsRouter);
    app.use("/api/views"         , api.viewsRouter        );
    app.use("/api/users"         , api.usersRouter        );
    app.use("/api/study-areas"   , api.studyAreasRouter   );
    app.use("/api/tags"          , api.tagsRouter         );
    app.use("/api/aggregator"    , api.aggregatorRouter   );
    app.use("/api/permissions"   , api.permissionsRouter  );
    app.use("/api/user-groups"   , api.userGroupsRouter   );
    app.use("/api/health-check"  , api.healthCheckRouter  );
    app.use("/api/search"        , api.searchRouter       );
    app.use("/api/sse"           , api.longPollingHandler );
    logger.verbose("✔ REST API set up");
}

function setupStaticContent(app: Application)
{
    // Get the path to the static content
    const staticPath = Path.join(__dirname, "../frontend");
    
    // Don't have a favicon
    app.get("/favicon.ico", (req, res) => res.status(404).end());
    
    // Serve the cumulus_library_columns file (temporary)
    app.get("/cumulus_library_columns.json", (req, res) => res.sendFile("cumulus_library_columns.json", { root: __dirname }));
    
    // Serve the static content
    app.use(express.static(staticPath));
    
    // Serve the index.html file for all other requests
    app.get("*", (req, res) => res.sendFile("index.html", { root: staticPath }));
    
    // Declare the static content hosted
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
    app.use(((error, req, res, next) => {
        
        // console.error(error)

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
        else if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            const msg = error.errors.map((e: any) => `${req.method.padStart(6)} ${decodeURIComponent(req.originalUrl)} => ${e.type || "Error"} while validating ${e.path || "data"}: ${e.message}`).join("\n")
            logger.error("Sequelize Validation Error " + JSON.stringify(error, null, 4))
            res.status(400).send(msg);
        }

        // Other Errors
        else {
            const msg = `${req.method.padStart(6)} ${decodeURIComponent(req.originalUrl)} => ${error.message.replace(/^\s*\w*Error:\s+/, "")}`
            logger.error(msg, error)
            res.status(500).send("Internal Server Error");
        }

        res.end()
    }) as AppErrorRequestHandler);

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
    await setupDB(config);
    setupAuth(app);
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

