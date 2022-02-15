const express            = require("express");
const slug               = require("slug");
const Model              = require("../db/models/DataRequest");
const { requireAuth }    = require("./Auth");
const { getFindOptions } = require("../lib");


const router = module.exports = express.Router({ mergeParams: true });


// get all ---------------------------------------------------------------------
router.get("/", (req, res) => {
    Model.findAll(getFindOptions(req))
    .then(data  => res.json(data))
    .catch(error => res.status(400).end(error.message));
});

// get one ---------------------------------------------------------------------
router.get("/:id", (req, res) => {
    Model.findByPk(req.params.id, getFindOptions(req))
    .then(data  => res.json(data))
    .catch(error => res.status(400).end(error.message))
});

// Create ----------------------------------------------------------------------
router.post("/", requireAuth("admin"), express.json(), (req, res) => {
    Model.create(req.body)
    .then(data  => res.json(data))
    .catch(error => res.status(400).end(error.message))
});

// Update ----------------------------------------------------------------------
router.put("/:id", requireAuth("admin"), express.json(), async (req, res) => {
    const model = await Model.findByPk(req.params.id);
    if (!model) {
        res.sendStatus(404).end(`${Model.name} not found`);
    } else {
        await model.update(req.body);
        res.json(model);
    }
});

// Delete ----------------------------------------------------------------------
router.delete("/:id", requireAuth("admin"), async (req, res) => {
    const model = await Model.findByPk(req.params.id);
    if (!model) {
        res.sendStatus(404).end(`${Model.name} not found`);
    } else {
        await model.destroy();
        res.json(model);
    }
});

// Views -----------------------------------------------------------------------
router.get("/:id/views", (req, res) => {
    Model.findByPk(req.params.id, getFindOptions(req))
    // @ts-ignore
    .then(data  => data.getViews())
    .then(data  => res.json(data))
    .catch(error => res.status(400).end(error.message))
});

// Export Data endpoint --------------------------------------------------------
router.get("/:id/data", (req, res) => {
    Model.findByPk(req.params.id, getFindOptions(req))
    // @ts-ignore
    .then(model => {
        const data = model?.get("data")
        const name = model?.get("name")
        // @ts-ignore
        exportData(data || { cols: [], rows: [] }, name, req, res)
    })
    .catch(error => res.status(400).end(error.message))
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

