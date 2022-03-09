const express = require("express")
const { HttpError }    = require("httperrors");
const Model            = require("../db/models/View");
const { rw, assert }   = require("../lib");
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

