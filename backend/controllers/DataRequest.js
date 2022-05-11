const http            = require("http");
const https           = require("https");
const { URL }         = require("url");
const express         = require("express");
const slug            = require("slug");
const { HttpError }   = require("httperrors");
const Model           = require("../db/models/DataRequest");
const GroupModel      = require("../db/models/RequestGroup")
const ViewModel       = require("../db/models/View")
const { requireAuth } = require("./Auth");
const createRestRoutes = require("./BaseController") 
const {
    getFindOptions,
    assert,
    rw,
    parseDelimitedString,
    uInt
} = require("../lib");


const router = module.exports = express.Router({ mergeParams: true });



// Views -----------------------------------------------------------------------
router.get("/:id/views", rw(async (req, res) => {
    const options = getFindOptions(req);
    options.where = { DataRequestId: +req.params.id };
    const views = await ViewModel.findAll(options);
    res.json(views);

}));

// Export Data endpoint --------------------------------------------------------
router.get("/:id/data", rw(async (req, res) => {
    const model = await Model.findByPk(req.params.id, getFindOptions(req))
    assert(model, HttpError.NotFound("Model not found"))
    const data = model.get("data")
    const name = model.get("name")
    // @ts-ignore
    exportData(data || { cols: [], rows: [] }, name, req, res)
}));

// Refresh Data endpoint -------------------------------------------------------
router.get("/:id/refresh", requireAuth("admin"), rw(async (req, res) => {
    const model = await Model.findByPk(req.params.id, getFindOptions(req))
    assert(model, HttpError.NotFound("Model not found"))
    const data = await fetchData(model)
    await model.set({ data, completed: new Date() }).save({ user: req.user })
    res.json(model)
}));

// By Group -------------------------------------------------------------------
router.get("/by-group", rw(async (req, res) => {
    
    const groupLimit   = uInt(req.query.groupLimit); // >= 2!
    const requestLimit = uInt(req.query.requestLimit);

    const test = await GroupModel.findAll({
        attributes: ["id", "name", "description", "createdAt"],
        include: {
            association: "requests",
            attributes : ["id", "name", "description", "refresh", "completed"],
            right      : true
        },
        order: [["name", "asc"]],
        limit: groupLimit ? Math.max(groupLimit, 2) : undefined
    });
    
    res.json(test.map(rec => {
        const out = rec.toJSON();
        if (requestLimit > 0) {
            out.requests = out.requests.slice(0, requestLimit)
        }
        if (out.id === null) {
            out.name = "GENERAL"
            out.description = "Contains reqyests that are not assigned to any specific group"
        }
        return out
    }));
}));

// Get Data endpoint --------------------------------------------------------
router.get("/:id", rw(async (req, res) => {
    const model = await Model.findByPk(req.params.id, getFindOptions(req))
    assert(model, HttpError.NotFound("Model not found"))
    const json = model.toJSON();
    if (!req.query.includeData && json.data) {
        delete json.data.rows
    }
    res.json(json)
}));

createRestRoutes(router, Model, { getOne: false });

/**
 * @param {{ cols: { name: string }[], rows: any[][] }} data 
 * @param {string} name
 * @param {express.Request} req
 * @param {express.Response} res
 */
function exportData(data, name, req, res)
{
    // format ------------------------------------------------------------------
    const format = req.query.format || "json"
    
    // cols --------------------------------------------------------------------
    let colNames = String(req.query.cols || "").split(",").map(s => s.trim()).filter(Boolean);
    if (!colNames.length) {
        colNames = data.cols.map(c => c.name);
    } else {
        colNames = colNames.filter(x => data.cols.find(c => c.name === x));
    }

    const indexes = colNames.map(name => data.cols.findIndex(c => c.name === name));

    // Delimited ---------------------------------------------------------------
    if (format === "csv" || format === "tsv") {

        const delimiter = format === "tsv" ? "\t" : ",";
        
        let out = [colNames.join(delimiter)];

        data.rows.forEach(row => out.push(
            indexes.map(i => row[i] === null ? "" : JSON.stringify(row[i])).join(delimiter)
        ));

        res.status(200);

        if (req.query.inline) {
            res.set("Content-Type", "text/plain");    
        } else {
            res.setHeader("Content-disposition", `attachment; filename=${slug(name)}.${format}`);
            res.setHeader("Content-Type", "text/" + format);
        }

        return res.send(out.join("\n"));
    }

    // JSON --------------------------------------------------------------------
    if (format === "json") {
        return res.json({
            cols: colNames.map(name => data.cols.find(x => x.name === name)),
            rows: data.rows.map(row => indexes.map(i => row[i]))
        })
    }

    throw new Error(`Unsupported format "${format}"`);
}

/**
 * @param {Model} model
 */
async function fetchData(model) {

    // Will throw if model.dataURL is not valid URL
    const url = new URL(model.getDataValue("dataURL"))

    const { result, response } = await request(url)
    
    const type = response.headers["content-type"];

    if (!type) {
        throw new Error("The data url endpoint does reply with Content-Type header")
    }

    if ((/\bjson\b/i).test(type)) {
        return JSON.parse(result)
    }
    else if ((/\btext\/csv\b/i).test(type)) {
        return parseDelimitedString(result, { separators: [","], stringDelimiter: '"' })
    }
    else if ((/\btext\/tsv\b/i).test(type)) {
        return parseDelimitedString(result, { separators: ["\t"], stringDelimiter: '"' })
    }
    else if ((/\btext\b/i).test(type)) {
        return parseDelimitedString(result, { separators: [",", "\t"], stringDelimiter: '"' })
    }
    
    throw new Error(`Unsupported content type "${type}"`)
}

/**
 * 
 * @param {URL} url 
 * @returns {Promise<{
 *   request : http.ClientRequest
 *   response: http.IncomingMessage
 *   result  : string
 * }>}
 */
async function request(url) {

    return new Promise((resolve, reject) => {

        const requestFn = url.protocol === "https:" ? https.request : http.request;

        const req = requestFn(url, {
            headers: {
                "user-agent": "CumulusApp/0.0.1"
            }
        });

        req.once("error", e => {
            console.error(`problem with request: ${e.message}`);
            reject(e)
        });

        req.once("response", res => {
            // console.log(`STATUS: ${res.statusCode}`);
            // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

            req.once("error", e => {
                console.error(`problem with response: ${e.message}`);
                reject(e)
            });

            res.setEncoding('utf8');
            
            let data = "";
            
            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                console.log("No more data in response.");
                resolve({ request: req, response: res, result: data })
            });
        });

        req.end();

        // Check if it is JSON or Delimited
    })
}

module.exports.fetchData = fetchData;
