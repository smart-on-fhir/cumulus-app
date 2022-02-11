const express            = require("express");
const Model              = require("../db/models/RequestGroup");
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
