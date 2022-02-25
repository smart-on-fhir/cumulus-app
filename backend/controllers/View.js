const express         = require("express");
const Model           = require("../db/models/View");
const { requireAuth } = require("./Auth");
const { getFindOptions, rw } = require("../lib");


const router = module.exports = express.Router({ mergeParams: true });


// get all --------------------------------------------------------------------
router.get("/", (req, res) => {
    Model.findAll(getFindOptions(req))
    .then(data  => res.json(data))
    .catch(error => res.status(400).end(error.message));
});

// get one --------------------------------------------------------------------
router.get("/:id", (req, res) => {
    Model.findByPk(req.params.id, getFindOptions(req))
    .then(data  => res.json(data))
    .catch(error => res.status(400).end(error.message))
});

// Create ---------------------------------------------------------------------
router.post("/", requireAuth("admin"), express.json({ limit: "2MB" }), (req, res) => {
    Model.create(req.body)
    .then(data  => res.json(data))
    .catch(error => res.status(400).end(error.message))
});

// Update ---------------------------------------------------------------------
router.put("/:id", requireAuth("admin"), express.json({ limit: "2MB" }), async (req, res) => {
    const model = await Model.findByPk(req.params.id);
    if (!model) {
        res.sendStatus(404).end(`${Model.name} not found`);
    } else {
        await model.update(req.body);
        res.json(model);
    }
});

// Delete ---------------------------------------------------------------------
router.delete("/:id", requireAuth("admin"), async (req, res) => {
    const model = await Model.findByPk(req.params.id);
    if (!model) {
        res.sendStatus(404).end(`${Model.name} not found`);
    } else {
        await model.destroy();
        res.json(model);
    }
});


// Get screenshot -------------------------------------------------------------
router.get("/:id/screenshot", rw(async (req, res) => {
    const model = await Model.unscoped().findByPk(req.params.id);

    if (!model) {
        res.sendStatus(404).end(`${Model.name} not found`);
    }
    else {
        const data  = model.getDataValue("screenShot");
        const match = (/^data:(.+?);base64,(.+)$/).exec(data || "");

        if (!match) {
            return res.sendStatus(400).end(`Invalid base64 image data`);
        }

        const file = Buffer.from(match[2], "base64");

        res.append("Last-Modified" , new Date(model.getDataValue("updatedAt")).toUTCString());
        res.append("Content-Type"  , match[1])
        res.append("Content-Length", file.length + "")

        res.send(file);
    }
}));

