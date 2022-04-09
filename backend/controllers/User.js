const express            = require("express");
const Model              = require("../db/models/User");
const { requireAuth }    = require("./Auth");
const { getFindOptions } = require("../lib");


const router = module.exports = express.Router({ mergeParams: true });


// get all ---------------------------------------------------------------------
router.get("/", requireAuth("admin"), (req, res) => {
    Model.findAll(getFindOptions(req))
    .then(data  => res.json(data))
    .catch(error => res.status(400).end(error.message));
});

// get one ---------------------------------------------------------------------
router.get("/:id", requireAuth("admin"), (req, res) => {
    Model.findByPk(req.params.id, getFindOptions(req))
    .then(data  => res.json(data))
    .catch(error => res.status(400).end(error.message))
});

// Create ----------------------------------------------------------------------
router.post("/", express.json(), requireAuth("admin"), (req, res) => {
    Model.create(req.body)
    .then(data  => res.json(data))
    .catch(error => res.status(400).end(error.message))
});

// Update ----------------------------------------------------------------------
router.put("/:id", express.json(), requireAuth("admin"), async (req, res) => {
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
