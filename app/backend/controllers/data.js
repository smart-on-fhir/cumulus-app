const express         = require("express");
const DB              = require("../db/index");
const { rw }          = require("../lib");
const Query           = require("../DataManager/Query");
const ImportJob       = require("../DataManager/ImportJob");
const { requireAuth } = require("./Auth");

const router = module.exports = express.Router({ mergeParams: true });

/**
 * Create (or update?) data by uploading a CSV file in a streaming fashion
 * CURL example:
 * ```sh
 * curl -i -X PUT "http://localhost:4000/api/data/bigdata?types=day,string,string,string,string,integer,integer" --data-binary @./big-data.csv
 * ```
 */
router.put("/:table", requireAuth("admin"), rw(async (req, res) => {
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
    const job = await ImportJob.create();
    await job.handle(req, res);
}));

/**
 * Get data from the given table to feed into the dashboard
 */
router.get("/:table", requireAuth("admin"), rw(async (req, res) => {
    
    const table = "data_" + req.params.table;

    /** @type { string[] } */
    const columns = String(req.query.columns || "").split(/\s*,\s*/).filter(Boolean);

    // OPTIONAL - The name of the stratifier column (if any)
    const stratifier = String(req.query.stratifier || "");

    // Verify that at least one column is requested
    if (columns.length < 1) {
        throw new Error(`No columns requested`)
    }
    
    const db = await DB();

    // Find the dataTypes of the columns
    const allColumns = await new Query()
        .setTable("meta")
        .addColumns("name", "type", "label", "description")
        .where("table", "=", table)
        .execute(db);
    
    // Verify that columns exist
    columns.forEach(c => {
        if (!allColumns.find(x => x.name === c)) {
            throw new Error(`No such column "${c}"`)
        }
    });

    // Verify that stratifier exists
    if (stratifier && !allColumns.find(c => c.name === stratifier)) {
        throw new Error(`No such column "${stratifier}" (used as stratifier)`)
    }

    // All the used columns, including "cnt"
    let colList = [...columns];
    if (!colList.includes("cnt")) {
        colList.push("cnt")
    }

    // FILTERS:
    //  OR: filter=gender:eq:male,age:gt:3
    // AND: filter=gender:eq:male&filter=age:gt:3
    // MIX: filter=gender:eq:male,age:gt:3&filter=year:gt:2022
    let filters = (Array.isArray(req.query.filter) ? req.query.filter : [req.query.filter || ""]).map(String);
    
    

    // ================================================================
    // Simple case: Y = count; X = column.name
    // This applies to pie charts or other charts with single series.
    // Denominator is not applicable here as the value would have to be
    // compared to itself, thus the result will always be 100%!
    // ================================================================
    if (!stratifier) {

        const result = await new Query()
            .setTable(table)
            .addColumns(...colList)
            .order(colList[0], "DESC")
            .filter(...filters)
            .whiteList(allColumns.map(c => c.name))
            .execute(db);

        return res.json(result);
    }

    // ================================================================
    // Complex case:
    //     Y = count or %
    //     X = column.name
    //     X.stratifier = groupBy
    // ================================================================
    const groups = await new Query()
        .setTable(table)
        .addColumns(`DISTINCT "${stratifier}"`)
        .order(stratifier, "DESC")
        .where(stratifier, "IS NOT NULL")
        .filter(...filters)
        .execute(db);

    const result = {};

    for (let rec of groups) {
        result[rec[stratifier]] = await new Query()
            .setTable(table)
            .addColumns(...colList)
            .where(stratifier, "=", rec[stratifier])
            .order(colList[0], "DESC")
            .filter(...filters)
            .whiteList(allColumns.map(c => c.name))
            .execute(db);
    }

    return res.json(result);
}));


