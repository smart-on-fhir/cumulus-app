const express                            = require("express")
const Path                               = require("path")
const { NotFound, InternalServerError }  = require("../errors");
const Model                              = require("../db/models/View");
const { rw, assert, roundToPrecision }   = require("../lib");
const { logger }                         = require("../logger");
const { requestLineLevelData }           = require("../mail");
const { requireAuth, requestPermission } = require("./Auth");
const createRestRoutes                   = require("./BaseController");
const { route }                          = require("../lib/route");

const router = module.exports = express.Router({ mergeParams: true });

createRestRoutes(router, Model, {
    getAll : "views_list",
    destroy: "views_delete"
});

route(router, {
    path: "/:id",
    method: "get",
    permission: "views_view",
    request: {
        schema: {
            id: {
                in: ["params"],
                isInt: {
                    errorMessage: "The 'id' parameter must be integer"
                },
                custom: {
                    options: x => x > 0,
                    errorMessage: "The 'id' parameter must be a positive integer"
                },
                toInt: true
            },

            // // If set include the group id, name and description
            // group: {
            //     in: ["query"],
            //     optional: true,
            //     isBoolean: true
            // },

            // If set include related tags with id, name and description
            tags: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            },

            // TODO: If set include the subscription
            subscription: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            }
        }
    },
    handler: async (req, res) => {

        const include = []

        // if (req.query.group) {
        //     include.push({ association: "group", attributes: ["id", "name", "description"] })
        // }

        if (req.query.tags) {
            include.push({ association: "Tags", attributes: ["id", "name", "description"] })
        }

        // if (req.query.graphs) {
        //     include.push({ association: "Views" })
        // }

        const model = await Model.findByPk(req.params.id, { include })
        assert(model, NotFound)
        res.json(model)
    }
})

// update ----------------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "put",
    permission: "views_update",
    request: {
        schema: {
            id: {
                in: ['params'],
                isInt: {
                    errorMessage: "The 'id' parameter must be integer"
                },
                custom: {
                    options: x => x > 0,
                    errorMessage: "The 'id' parameter must be a positive integer"
                },
                toInt: true,
            },
            name: {
                in: ['body'],
                optional: true,
                custom: {
                    options: x => x.length <= 100,
                    errorMessage: "The name cannot be longer than 100 characters"
                }
            },
            description: {
                in: ['body'],
                optional: true,
                custom: {
                    options: x => x.length <= 500,
                    errorMessage: "The description cannot be longer than 500 characters"
                }
            },
            screenShot: {
                in: ['body'],
                optional: true,
                isString: true
            },
            Tags: {
                in: ['body'],
                optional: true,
                isArray: true,
                toArray: true
            },
            settings: {
                in: ['body'],
                optional: true,
                isObject: true
            }
        }
    },
    handler: async (req, res) => {
        const model = await Model.findByPk(+req.params?.id, {
            include: {
                association: "Tags",
                attributes: ["id", "name", "description"]
            }
        });
        assert(model, NotFound);

        const transaction = await model.sequelize.transaction()
        try {
            delete req.body.rating
            delete req.body.normalizedRating
            delete req.body.votes
            delete req.body.DataRequestId
            delete req.body.createdAt
            delete req.body.updatedAt

            await model.update(req.body, { transaction, user: req.user })
            await model.setTags(req.body.Tags.map(t => t.id))
            await transaction.commit()
            res.json(model)
        } catch (ex) {
            await transaction.rollback()
            const error = new InternalServerError("Updating graph failed", { tags: ["DATA"] })
            error.cause = ex
            throw error
        }
    }
});

// create ----------------------------------------------------------------------
route(router, {
    path: "/",
    method: "post",
    permission: "views_create",
    request: {
        schema: {
            name: {
                in: ['body'],
                exists: true,
                notEmpty: true,
                isLength: {
                    options: {
                        max: 100
                    }
                }
            },
            description: {
                in: ['body'],
                isLength: {
                    options: {
                        max: 100
                    }
                }
            },
            screenShot: {
                in: ['body']
            },
            settings: {
                in: ['body'],
                isObject: true
            },
            DataRequestId: {
                in: ['body'],
                isInt: {
                    options: {
                        min: 1
                    }
                }
            },
            Tags: {
                in: ['body'],
                optional: true,
                isArray: true,
                toArray: true
            }
        }
    },
    handler: async (req, res) => {
        const model = await Model.create(req.body, { user: req.user })
        await model.setTags(req.body.Tags.map(t => t.id))
        res.json(model)
    }
});


router.get("/:id/screenshot", rw(async (req, res) => {

    requestPermission("views_get_screenshot", req)

    const model = await Model.findByPk(req.params.id);

    assert(model, "Model not found", NotFound)
    
    const data  = model.getDataValue("screenShot");

    if (!data) {
        return res.sendFile("view.png", { root: Path.join(__dirname, "../../public") })
    }

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
        throw new NotFound("Model not found");
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
        throw new NotFound("Model not found");
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
