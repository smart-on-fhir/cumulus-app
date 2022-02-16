const express         = require("express");
const slug            = require("slug");
const { HttpError }   = require("httperrors");
const Model           = require("../db/models/DataRequest");
const { requireAuth } = require("./Auth");
const {
    getFindOptions,
    assert,
    rw
} = require("../lib");


const router = module.exports = express.Router({ mergeParams: true });


// get all ---------------------------------------------------------------------
router.get("/", rw(async (req, res) => {
    const models = await Model.findAll(getFindOptions(req));
    res.json(models);
}));

// get one ---------------------------------------------------------------------
router.get("/:id", rw(async (req, res) => {
    const model = await Model.findByPk(req.params.id, getFindOptions(req))
    assert(model, HttpError.NotFound("Model not found"))
    res.json(model)
}));

// Create ----------------------------------------------------------------------
router.post("/", requireAuth("admin"), express.json(), rw(async (req, res) => {
    const model = await Model.create(req.body);
    res.json(model)
}));

// Update ----------------------------------------------------------------------
router.put("/:id", requireAuth("admin"), express.json(), rw(async (req, res) => {
    const model = await Model.findByPk(req.params.id);
    assert(model, HttpError.NotFound("Model not found"))
    await model.update(req.body);
    res.json(model);
}));

// Delete ----------------------------------------------------------------------
router.delete("/:id", requireAuth("admin"), rw(async (req, res) => {
    const model = await Model.findByPk(req.params.id);
    assert(model, HttpError.NotFound("Model not found"))
    await model.destroy();
    res.json(model);
}));

// Views -----------------------------------------------------------------------
router.get("/:id/views", rw(async (req, res) => {
    const model = await Model.findByPk(req.params.id, getFindOptions(req))
    assert(model, HttpError.NotFound("Model not found"))
    // @ts-ignore
    const views = await model.getViews()
    res.json(views)
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

