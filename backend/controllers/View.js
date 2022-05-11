const express = require("express")
const { HttpError }    = require("httperrors");
const Model            = require("../db/models/View");
const { rw, assert, roundToPrecision }   = require("../lib");
const { requireAuth } = require("./Auth");
const createRestRoutes = require("./BaseController");

const router = module.exports = express.Router({ mergeParams: true });

createRestRoutes(router, Model);


router.get("/:id/screenshot", rw(async (req, res) => {
    const model = await Model.findByPk(req.params.id);

    assert(model, HttpError.NotFound("Model not found"))
    
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
}));

router.put("/:id/vote", express.urlencoded({ extended: false }), rw(async (req, res) => {
    const model = await Model.findByPk(req.params.id);
    
    if (!model) {
        throw new HttpError.NotFound("Model not found");
    }

    const rating = model.getDataValue("rating") + parseFloat(req.body.rating || 0);
    const votes  = model.getDataValue("votes") + 1;

    await model.update({
        rating,
        votes,
        normalizedRating: roundToPrecision(rating / (votes || 1), 2)
    });

    res.json(model)
}));

router.put("/:id/reset-rating", requireAuth("admin"), rw(async (req, res) => {
    const model = await Model.findByPk(req.params.id);

    if (!model) {
        throw new HttpError.NotFound("Model not found");
    }

    await model.update({ rating: 0, votes : 0, normalizedRating: 0 });

    res.json(model)
}));

