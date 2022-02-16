const Path             = require("path")
const express          = require("express")
const cors             = require("cors")
const cookieParser     = require("cookie-parser")
const config           = require("./config")
const Auth             = require("./controllers/Auth")
const { init: initDB } = require("./db")


const app = express()


app.use(cors({
    origin: true,
    credentials: true
}));

// We use cookies for user sessions
app.use(cookieParser(), Auth.authenticate);

app.use(express.static(Path.join(__dirname, "../build/")));
app.use("/api/screenshot", express.static(Path.join(__dirname, "screenShots")));

// app.use((rec, res, next) => setTimeout(next, 1000))

app.use("/api/auth"          , Auth.router);
app.use("/api/request-groups", require("./controllers/RequestGroup"));
app.use("/api/requests"      , require("./controllers/DataRequest" ));
app.use("/api/views"         , require("./controllers/View"        ));
app.use("/api/users"         , require("./controllers/User"        ));

// React app - redirect all to ./build/index.html
app.get("*", (req, res) => res.sendFile("index.html", { root: "../build" }));



// -----------------------------------------------------------------------------

// Global error 404 handler
app.use((_, res) => {
    res.sendStatus(404).end("Not Found");
});

// Global error 500 handler
app.use((error, req, res, next) => {
    
    // HTTP Errors
    if (error.http) {
        return res.status(error.status).send(error.message);
    }

    // Sequelize Validation Errors
    if (error.name === "SequelizeValidationError") {
        return res.status(400).send(error.errors.map(e => (
            `${e.type || "Error"} while validating ${e.path || "data"}: ${e.message}`
        )).join("\n"));
    }

    // Other Errors
    res.status(500).json(error);
});

initDB().then(() => {
    // Start the server
    app.listen(config.port, config.host, () => {
        console.log(`Server listening at ${config.host}:${config.port}`)
    });
})

