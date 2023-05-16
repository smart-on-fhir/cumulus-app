const express            = require("express");
const { Op }             = require("sequelize");
const Model              = require("../db/models/Activity");
const { getFindOptions } = require("../lib");


const router = module.exports = express.Router({ mergeParams: true });


// get all ---------------------------------------------------------------------
router.get("/", (req, res) => {
    Model.findAll(getFindOptions(req))
    .then(data  => res.json(data))
    .catch(error => res.status(400).end(error.message));
});

router.get("/browse", (req, res) => {
    
    const options = getFindOptions(req);

    const tags = String(req.query.tags || "").split(",").filter(Boolean);
    if (tags.length) {
        options.where = {
            [Op.or]: tags.map(tag => ({ tags: { [Op.like]: tag } }))
        }
    }

    Model.findAndCountAll(options)
    .then(data  => res.json(data))
    .catch(error => res.status(400).end(error.message));
});
