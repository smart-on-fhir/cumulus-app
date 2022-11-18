const express                            = require("express")
const HttpError                          = require("../errors");
const Model                              = require("../db/models/View");
const { rw, assert, roundToPrecision }   = require("../lib");
const { logger }                         = require("../logger");
const { requestLineLevelData }           = require("../mail");
const { requireAuth, requestPermission } = require("./Auth");
const createRestRoutes                   = require("./BaseController");

const router = module.exports = express.Router({ mergeParams: true });

createRestRoutes(router, Model, {
    getAll : "views_list",
    getOne : "views_view",
    create : "views_create",
    update : "views_update",
    destroy: "views_delete"
});


router.get("/:id/screenshot", rw(async (req, res) => {

    requestPermission("views_get_screenshot", req)

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

    requestPermission("views_vote", req)

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
    }, { user: req.user });

    res.json(model)
}));

router.put("/:id/reset-rating", requireAuth("admin"), rw(async (req, res) => {

    requestPermission("views_reset_rating", req)

    const model = await Model.findByPk(req.params.id);

    if (!model) {
        throw new HttpError.NotFound("Model not found");
    }

    await model.update({ rating: 0, votes : 0, normalizedRating: 0 }, { user: req.user });

    res.json(model)
}));

router.post("/:id/request-linelevel-data", express.json(), (req, res) => {
    requestPermission("views_request_line_data", req)
    requestLineLevelData(req.body).then(
        () => res.end(),
        e  => {
            logger.error(e, { tags: ["DATA"] })
            res.status(400).json(e)
        }
    )
});
