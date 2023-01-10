import Path                              from "path"
import { Response, Router }              from "express"
import { FindOptions }                   from "sequelize"
import { AppRequest }                    from ".."
import { NotFound, InternalServerError, HttpError } from "../errors"
import Model                             from "../db/models/View"
import { route }                         from "../lib/route"
import { assert, roundToPrecision }      from "../lib"
import { logger }                        from "../logger"
import { requestLineLevelData }          from "../mail"
import { requestPermission }             from "../acl"


const router = Router({ mergeParams: true });


// list ------------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    request: {
        schema: {
            order: {
                in: ["query"],
                optional: true,
                matches: {
                    errorMessage: "Invalid order parameter",
                    options: /^\w+\:(asc|desc)(,\w+\:asc|desc)*$/i
                }
            },
            limit: {
                in: ["query"],
                optional: {
                    options: {
                        checkFalsy: true
                    }
                },
                toInt: true,
                isInt: {
                    errorMessage: "'limit' must be an integer",
                    options: {
                        min: 1
                    }
                }
            }
        }
    },
    async handler(req: AppRequest, res: Response) {

        const options: FindOptions = {
            include: [
                { association: "Tags", attributes: ["id", "name", "description"] },
                { association: "DataRequest", attributes: ["id", "name"] }
            ]
        };

        if (req.query.order) {
            options.order = [];
            String(req.query.order).split(",").forEach(x => {
                (options.order as any).push(x.split(":"))
            });
        }

        if (req.query.limit) {
            options.limit = +req.query.limit
        }

        res.json(await Model.findAll(options))
    }
})

// view ------------------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "get",
    request: {
        schema: {
            id: {
                in   : [ "params" ],
                toInt: true,
                isInt: {
                    errorMessage: "The 'id' parameter must be integer",
                    options: {
                        min: 1
                    }
                }
            },

            // If set include related tags with id, name and description
            tags: {
                in       : [ "query" ],
                optional : true,
                isBoolean: true,
                toBoolean: true
            },

            // TODO: If set include the subscription
            subscription: {
                in       : [ "query" ],
                optional : true,
                isBoolean: true,
                toBoolean: true
            }
        }
    },
    async handler(req: AppRequest, res: Response) {

        const include: any[] = []

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
    request: {
        schema: {
            id: {
                in   : ['params'],
                toInt: true,
                isInt: {
                    errorMessage: "The 'id' parameter must be integer",
                    options: {
                        min: 1
                    }
                }
            },
            name: {
                in: ['body'],
                optional: true,
                isLength: {
                    errorMessage: "The name cannot be longer than 100 characters",
                    options: {
                        max: 100
                    }
                }
            },
            description: {
                in: ['body'],
                optional: true,
                isLength: {
                    errorMessage: "The description cannot be longer than 500 characters",
                    options: {
                        max: 500
                    }
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
    async handler(req: AppRequest, res: Response) {
        const model = await Model.findByPk(+req.params?.id, {
            include: {
                association: "Tags",
                attributes: ["id", "name", "description"]
            }
        });

        assert(model, NotFound);

        // @ts-ignore
        const transaction = await model.sequelize.transaction()

        try {
            delete req.body.rating
            delete req.body.normalizedRating
            delete req.body.votes
            delete req.body.DataRequestId
            delete req.body.createdAt
            delete req.body.updatedAt

            await model.update(req.body, { transaction, user: req.user })
            if (Array.isArray(req.body.Tags)) {
                await model.setTags(req.body.Tags.map((t: any) => t.id))
            }
            await transaction.commit()
            res.json(model)
        } catch (ex) {
            await transaction.rollback()
            if (ex instanceof HttpError) {
                ex.data = { tags: ["DATA"] }
                ex.cause = ex.stack
                throw ex
            }
            const { message, stack } = ex as Error
            const error = new InternalServerError("Updating graph failed. " + message, { tags: ["DATA"] })
            error.cause = stack
            throw error
        }
    }
});

// create ----------------------------------------------------------------------
route(router, {
    path: "/",
    method: "post",
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
    async handler(req: AppRequest, res: Response) {
        const model = await Model.create(req.body)
        if (Array.isArray(req.body.Tags)) {
            await model.setTags(req.body.Tags)
            await model.reload({ include: [{ association: "Tags" }] })
        }
        res.json(model)
    }
});

// Delete ----------------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "delete",
    request: {
        schema: {
            id: {
                in: ['params'],
                isInt: {
                    errorMessage: "The 'id' parameter must be a positive integer",
                    options: {
                        gt: 0
                    }
                },
                toInt: true,
            }
        }
    },
    handler: async (req: AppRequest, res: Response) => {
        const model = await Model.findByPk(+req.params?.id);
        assert(model, NotFound);
        await model.destroy()
        res.json(model)
    }
});

// Get screenshot --------------------------------------------------------------
route(router, {
    method: "get",
    path  : "/:id/screenshot",
    request: {
        schema: {
            id: {
                in: ['params'],
                isInt: {
                    errorMessage: "The 'id' parameter must be a positive integer",
                    options: {
                        gt: 0
                    }
                },
                toInt: true,
            }
        }
    },
    async handler(req: AppRequest, res: Response) {

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

        res.append("Last-Modified" , new Date(model.updatedAt).toUTCString());
        res.append("Content-Type"  , match[1])
        res.append("Content-Length", file.length + "")

        res.send(file);
    }
});

// Vote (rate) a graph ---------------------------------------------------------
route(router, {
    method: "put",
    path  : "/:id/vote",
    request: {
        schema: {
            id: {
                in: ['params'],
                isInt: {
                    errorMessage: "The 'id' parameter must be a positive integer",
                    options: {
                        gt: 0
                    }
                },
                toInt: true,
            },
            rating: {
                in: ["body"],
                isInt: {
                    options: {
                        min: 0,
                        max: 5
                    }
                },
                toInt: true
            }
        }
    },
    async handler(req: AppRequest, res: Response) {

        const model = await Model.findByPk(req.params.id);
        
        if (!model) {
            throw new NotFound("Model not found");
        }

        const rating = model.getDataValue("rating") + req.body.rating;
        const votes  = model.getDataValue("votes") + 1;

        await model.update({
            rating,
            votes,
            normalizedRating: roundToPrecision(rating / (votes || 1), 2)
        });

        res.json(model)
    }
});

// Reset graph rating ----------------------------------------------------------
route(router, {
    method: "put",
    path  : "/:id/reset-rating",
    async handler(req: AppRequest, res: Response) {
        const model = await Model.findByPk(req.params.id);
        if (!model) {
            throw new NotFound("Model not found");
        }
        await model.update({ rating: 0, votes : 0, normalizedRating: 0 });
        res.json(model)
    }
});

// Request line-level data -----------------------------------------------------
route(router, {
    method: "post",
    path  : "/:id/request-linelevel-data",
    async handler(req: AppRequest, res: Response) {
        requestPermission(req.user?.role || "guest", "DataRequests.requestLineLevelData")
        requestLineLevelData(req.body).then(
            () => res.end(),
            (e: any) => {
                logger.error(e, { tags: ["DATA"] })
                res.status(400).json(e)
            }
        )
    }
});

export default router;
