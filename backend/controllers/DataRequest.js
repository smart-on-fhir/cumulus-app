const http             = require("http");
const https            = require("https");
const { URL }          = require("url");
const express          = require("express");
const slug             = require("slug");
const HttpError        = require("../errors");
const crypto           = require("crypto");
const { QueryTypes }   = require("sequelize");
const Model            = require("../db/models/DataRequest");
const GroupModel       = require("../db/models/RequestGroup").default;
const ViewModel        = require("../db/models/View").default;
const { requireAuth }  = require("./Auth");
const createRestRoutes = require("./BaseController").default;
const ImportJob        = require("../DataManager/ImportJob");
const { logger }       = require("../logger");
const { route }        = require("../lib/route");
const {
    getFindOptions,
    assert,
    rw,
    parseDelimitedString,
    uInt
} = require("../lib");


const router = module.exports = express.Router({ mergeParams: true });

const FilterConfig = {
    
    // Text -------------------------------------------------------------------
    strEq             : col => `"${col}" LIKE ?`,
    strContains       : col => `"${col}" LIKE concat('%', ?, '%')`,
    strStartsWith     : col => `"${col}" LIKE concat(?, '%')`,
    strEndsWith       : col => `"${col}" LIKE concat('%', ?)`,
    matches           : col => `"${col}" ~ ?`, 
    strEqCI           : col => `"${col}" ILIKE ?`,
    strContainsCI     : col => `"${col}" ILIKE concat('%', ?, '%')`,
    strStartsWithCI   : col => `"${col}" ILIKE concat(?, '%')`,
    strEndsWithCI     : col => `"${col}" ILIKE concat('%', ?)`,
    matchesCI         : col => `"${col}" ~* ?`,
    strNotEq          : col => `"${col}" NOT LIKE ?`,
    strNotContains    : col => `"${col}" NOT LIKE concat('%', ?, '%')`,
    strNotStartsWith  : col => `"${col}" NOT LIKE concat(?, '%')`,
    strNotEndsWith    : col => `"${col}" NOT LIKE concat('%', ?)`,
    notMatches        : col => `"${col}" !~ ?`, 
    strNotEqCI        : col => `"${col}" NOT ILIKE ?`,
    strNotContainsCI  : col => `"${col}" NOT ILIKE concat('%', ?, '%')`,
    strNotStartsWithCI: col => `"${col}" NOT ILIKE concat(?, '%')`,
    strNotEndsWithCI  : col => `"${col}" NOT ILIKE concat('%', ?)`,
    notMatchesCI      : col => `"${col}" !~* ?`,
    
    // Dates ------------------------------------------------------------------
    sameDay           : col => `date_trunc('day'  , "${col}") =  date_trunc('day'  , TIMESTAMP ?)`,
    sameMonth         : col => `date_trunc('month', "${col}") =  date_trunc('month', TIMESTAMP ?)`,
    sameYear          : col => `date_trunc('year' , "${col}") =  date_trunc('year' , TIMESTAMP ?)`,
    sameDayOrBefore   : col => `date_trunc('day'  , "${col}") <= date_trunc('day'  , TIMESTAMP ?)`,
    sameMonthOrBefore : col => `date_trunc('month', "${col}") <= date_trunc('month', TIMESTAMP ?)`,
    sameYearOrBefore  : col => `date_trunc('year' , "${col}") <= date_trunc('year' , TIMESTAMP ?)`,
    sameDayOrAfter    : col => `date_trunc('day'  , "${col}") >= date_trunc('day'  , TIMESTAMP ?)`,
    sameMonthOrAfter  : col => `date_trunc('month', "${col}") >= date_trunc('month', TIMESTAMP ?)`,
    sameYearOrAfter   : col => `date_trunc('year' , "${col}") >= date_trunc('year' , TIMESTAMP ?)`,
    beforeDay         : col => `date_trunc('day'  , "${col}") <  date_trunc('day'  , TIMESTAMP ?)`,
    beforeMonth       : col => `date_trunc('month', "${col}") <  date_trunc('month', TIMESTAMP ?)`,
    beforeYear        : col => `date_trunc('year' , "${col}") <  date_trunc('year' , TIMESTAMP ?)`,
    afterDay          : col => `date_trunc('day'  , "${col}") >  date_trunc('day'  , TIMESTAMP ?)`,
    afterMonth        : col => `date_trunc('month', "${col}") >  date_trunc('month', TIMESTAMP ?)`,
    afterYear         : col => `date_trunc('year' , "${col}") >  date_trunc('year' , TIMESTAMP ?)`,

    // Booleans ---------------------------------------------------------------
    isTrue            : col => `"${col}" IS TRUE`,
    isNotTrue         : col => `"${col}" IS NOT TRUE`,
    isFalse           : col => `"${col}" IS FALSE`,
    isNotFalse        : col => `"${col}" IS NOT FALSE`,

    // Any --------------------------------------------------------------------
    isNull            : col => `"${col}" IS NULL`,
    isNotNull         : col => `"${col}" IS NOT NULL`,
    eq                : col => `"${col}" = ?` ,
    ne                : col => `"${col}" != ?`,
    gt                : col => `"${col}" > ?` ,
    gte               : col => `"${col}" >= ?`,
    lt                : col => `"${col}" < ?` ,
    lte               : col => `"${col}" <= ?`,
};


// Views ----------------------------------------------------------------------
router.get("/:id/views", rw(async (req, res) => {
    const options = getFindOptions(req);
    options.where = { DataRequestId: +req.params.id };
    const views = await ViewModel.findAll(options);
    res.json(views);
}));

// Export Data endpoint -------------------------------------------------------
router.get("/:id/data", rw(async (req, res) => {
    const model = await Model.findByPk(req.params.id, getFindOptions(req))
    assert(model, "Model not found", HttpError.NotFound)
    const data = model.get("data")
    const name = model.get("name")
    // @ts-ignore
    exportData(data || { cols: [], rows: [] }, name, req, res)
}));

// Refresh Data endpoint ------------------------------------------------------
router.get("/:id/refresh", requireAuth("admin"), rw(async (req, res) => {
    const model = await Model.findByPk(req.params.id, getFindOptions(req))
    assert(model, "Model not found", HttpError.NotFound)
    const data = await fetchData(model)
    await model.set({ data, completed: new Date() }).save()
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
            out.description = "Contains requests that are not assigned to any specific group"
        }
        return out
    }));
}));

// Import Data endpoint -------------------------------------------------------
/**
 * Create (or update?) data by uploading a CSV file in a streaming fashion
 * CURL example:
 * ```sh
 * curl -i -X PUT "http://localhost:4000/api/data/bigdata?types=day,string,string,string,string,integer,integer" --data-binary @./big-data.csv
 * ```
 */
router.put("/:id/data", rw(async (req, res) => {
    const jobId = String(req.headers["x-job-id"] || "");
    
    // if job is passed in - continue
    if (jobId) {
        const job = ImportJob.find(jobId);
        if (!job) {
            throw new Error(`No such job "${jobId}"`)
        }
        await job.handle(req, res);
    }

    // else use a single-run job
    else {
        const job = await ImportJob.create();
        await job.handle(req, res);
    }
}));

// Data API endpoint ----------------------------------------------------------
router.get("/:id/api", rw(async (req, res) => {

    /** @type {any} */
    const subscription = await Model.findByPk(req.params.id)

    assert(subscription, "Subscription not found", HttpError.NotFound)

    const table = "subscription_data_" + req.params.id;

    const column = String(req.query.column || "");

    const stratifier = String(req.query.stratifier || "");

    const filtersParams = (Array.isArray(req.query.filter) ?
        req.query.filter :
        [req.query.filter || ""]).map(String).filter(Boolean);

    const cacheKey = crypto.createHash("sha1").update([
        table,
        column,
        stratifier,
        filtersParams.join("+"),
        subscription.completed + ""
    ].join("-")).digest("hex");

    res.setHeader('Cache-Control', `max-age=31536000, no-cache`)
    res.setHeader('Vary', 'Origin, ETag')
    res.setHeader('ETag', cacheKey)

    let ifNoneMatchValue = req.headers['if-none-match']
    if (ifNoneMatchValue && ifNoneMatchValue === cacheKey) {
        res.statusCode = 304
        return res.end()
    }

    const allColumns = subscription.metadata.cols;

    // Verify that at least one column is requested
    if (!column) throw new Error(`No column requested`)

    // Verify that column is not "cnt"
    if (column === "cnt") throw new Error(`Must select a column other than "cnt"`)

    // Verify that column exists
    if (!allColumns.find(x => x.name === column)) throw new Error(`No such column "${column}"`)

    // Verify that stratifier exists
    if (stratifier && !allColumns.find(c => c.name === stratifier)) {
        throw new Error(`No such column "${stratifier}" (used as stratifier)`)
    }

    // Replacement values for the SQL query
    const replacements = [];

    // Filters ----------------------------------------------------------------
    //  OR: filter=gender:eq:male,age:gt:3
    // AND: filter=gender:eq:male&filter=age:gt:3
    // MIX: filter=gender:eq:male,age:gt:3&filter=year:gt:2022
    // ------------------------------------------------------------------------
    const filterConditions = [];

    filtersParams.forEach(f => {
        f.split(/\s*,\s*/).filter(Boolean).forEach((cond, i) => {
            const parts = cond.split(":");
            if (parts.length < 2) {
                throw new Error("Each filter must have at least 2 parts");
            }
            
            const [column, operator, right] = parts;
            
            if (typeof FilterConfig[operator] !== "function") {
                throw new Error(`Filter operator "${operator}" is not implemented`);
            }

            filterConditions.push({
                column,
                
                // If i === 0, then this is the first filter in an OR chain,
                // but it means that entire chain must be joined using "AND"
                // to any previous filters
                join: i ? "OR" : "AND",

                sql: FilterConfig[operator](column)
            });

            if (right) {
                replacements.push(right)
            }
        });
    });

    const filterWhere = filterConditions.reduce((prev, cur) => {
        if (cur.join !== prev.join) {
            return {
                sql: prev.sql ? `(${prev.sql}) ${cur.join} ${cur.sql}` : cur.sql,
                join: cur.join
            }
        }
        return { sql: `${prev.sql} ${cur.join} ${cur.sql}`, join: cur.join }
    }, { sql: "", join: "" }).sql;

    // Find which of the columns are already used -----------------------------
    const unusedColumns = allColumns.filter(c => {
        
        // The "cnt" is always used
        if (c.name === "cnt") return false

        // The selected column is used
        if (c.name === column) return false

        // The stratifier is used
        if (stratifier && c.name === stratifier) return false

        // Columns used by filters
        if (filterConditions.some(f => f.column === c.name)) return false

        return true
    });

    // ========================================================================
    // BUILD SQL
    // ========================================================================
    function where() {
        let out = []
        if (stratifier) out.push(`"${stratifier}" IS NOT NULL`)
        out.push(`"${column}" IS NOT NULL`)
        if (unusedColumns.length) {
            out.push(...unusedColumns.map(c => `"${c.name}" IS NULL`))
        }
        return out
    }

    let sql = `SELECT `

    // Select the stratifier if any
    if (stratifier) sql += `"${stratifier}" as stratifier, `

    // Select the column as "x"
    sql += `"${column}" AS x`

    // Select the count as "y"
    sql += `, sum(cnt::float) AS y `

    sql += `FROM "${table}" `

    // The column must not be null
    sql += `WHERE ${where().join(" AND ")} `
    
    // Filters
    if (filterWhere) sql += `AND (${ filterWhere }) `

    if (stratifier) sql += `GROUP BY "${stratifier}", "${column}" `
    else sql += `GROUP BY "${column}" `
    
    // order by stratifier asc, column asc
    if (stratifier) sql += `ORDER BY stratifier, x`
    else sql += `ORDER BY x`

    // Execute the query
    const result = await subscription.sequelize.query(sql, {
        replacements,
        logging: sql => logger.info(sql, { tags: ["SQL", "DATA"] }),
        type: QueryTypes.SELECT
    });

    // Do some post-processing
    let data = [];
    let group;

    result.forEach(row => {
        if (!group || group.stratifier !== row.stratifier) {
            group = {
                stratifier: row.stratifier,
                rows: []
            };
            data.push(group)
        }
        group.rows.push([ row.x, row.y ])
    })

    res.json({
        column,
        stratifier: stratifier || undefined,
        filters   : filtersParams,
        totalCount: subscription.metadata.total,
        rowCount  : result.length,
        data
    });
}));

createRestRoutes(router, Model, {
    destroy: true,
    getAll : true
});

// Get single subscription -----------------------------------------------------
route(router, {
    path: "/:id",
    method: "get",
    request: {
        schema: {
            id: {
                in: ["params"],
                isInt: {
                    errorMessage: "The 'id' parameter must be integer"
                },
                custom: {
                    options: x => x > 0,
                    errorMessage: "The 'id' parameter must be a positive integer"
                },
                toInt: true
            },

            // If set include the group id, name and description
            group: {
                in: ["query"],
                optional: true,
                isBoolean: true
            },

            // If set include related tags with id, name and description
            tags: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            },

            // If set include related Views
            graphs: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            }
        }
    },
    handler: async (req, res) => {

        const include = []

        if (req.query.group) {
            include.push({ association: "group", attributes: ["id", "name", "description"] })
        }

        if (req.query.tags) {
            include.push({ association: "Tags", attributes: ["id", "name", "description"] })
        }

        if (req.query.graphs) {
            include.push({ association: "Views" })
        }

        const model = await Model.findByPk(req.params.id, { include })
        assert(model, HttpError.NotFound)
        res.json(model)
    }
})

// update ----------------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "put",
    request: {
        schema: {
            id: {
                in: ['params'],
                errorMessage: 'ID is wrong',
                isInt: {
                    errorMessage: "The 'id' parameter must be integer"
                },
                custom: {
                    options: x => x > 0,
                    errorMessage: "The 'id' parameter must be a positive integer"
                },
                toInt: true,
            }
        }
    },
    handler: async (req, res) => {
        const model = await Model.findByPk(+req.params?.id, {
            include: {
                association: "Tags",
                attributes: ["id", "name", "description"]
            }
        });
        assert(model, HttpError.NotFound);
        const transaction = await model.sequelize.transaction()
        try {
            await model.update(req.body, { user: req.user, transaction })
            await model.setTags(req.body.Tags.map(t => t.id))
            await transaction.commit()
            res.json(model)
        } catch (ex) {
            await transaction.rollback()
            const error = new HttpError.InternalServerError("Updating subscription failed", { tags: ["DATA"] })
            error.cause = ex.stack
            throw error
        }
    }
});

// create ----------------------------------------------------------------------
route(router, {
    path: "/",
    method: "post",
    request: {
        schema: {
            name: {
                in: ['body'],
                exists: true,
                notEmpty: true,
                isLength: {
                    options: {
                        max: 100
                    }
                },
                custom: {
                    options: x => x.length <= 50,
                    errorMessage: "The name cannot be longer than 50 characters"
                }
            },
            description: {
                in: ['body']
            }
        }
    },
    handler: async (req, res) => {
        const model = await Model.create(req.body)
        await model.setTags(req.body.Tags.map(t => t.id))
        res.json(model)
    }
});

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
        throw new Error("The data url endpoint did not reply with Content-Type header");
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
