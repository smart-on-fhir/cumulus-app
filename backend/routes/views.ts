import Path                     from "path"
import { Router }               from "express"
import { FindOptions, Op }      from "sequelize"
import crypto                   from "crypto"
import Model                    from "../db/models/View"
import { route }                from "../lib/route"
import { assert }               from "../lib"
import { logger }               from "../logger"
import { requestLineLevelData } from "../mail"
import { requestPermission }    from "../acl"
import SystemUser               from "../SystemUser"
import {
    NotFound,
    InternalServerError,
    HttpError,
    Unauthorized
} from "../errors"


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
            },
            offset: {
                in: ["query"],
                optional: true,
                toInt: true,
                isInt: {
                    errorMessage: "'offset' must be an integer",
                    options: {
                        min: 0
                    }
                }
            },
            attributes: {
                in: ["query"],
                optional: true,
            }
        }
    },
    async handler(req, res) {

        const options: FindOptions = {
            include: [
                { association: "Tags", attributes: ["id", "name", "description"] },
                { association: "DataRequest", attributes: ["id", "name"] }
            ],
            user: SystemUser
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

        if (req.query.offset) {
            options.offset = +req.query.offset
        }

        if (req.query.attributes) {
            options.attributes = String(req.query.attributes).split(",")
        }

        res.json(await Model.scope({ method: ['visible', req.user] }).findAll(options))
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

            // If set include the subscription
            subscription: {
                in       : [ "query" ],
                optional : true,
                isBoolean: true,
                toBoolean: true
            },

            // If set include the subscription and its group
            group: {
                in       : [ "query" ],
                optional : true,
                isBoolean: true,
                toBoolean: true
            },

            // If set include the subscription and its projects
            projects: {
                in       : [ "query" ],
                optional : true,
                isBoolean: true,
                toBoolean: true
            }
        }
    },
    async handler(req, res) {

        const include: any[] = []

        if (req.query.tags) {
            include.push({ association: "Tags", attributes: ["id", "name", "description"] })
        }

        if (req.query.subscription || req.query.group || req.query.projects) {
            const subscriptionIncludes: any[] = [];

            if (req.query.group) {
                subscriptionIncludes.push({ association: "group" })
            }
            if (req.query.projects) {
                subscriptionIncludes.push({ association: "Projects" })
            }

            const association: any = { association: "DataRequest" }
            if (subscriptionIncludes.length) {
                association.include = subscriptionIncludes
            }

            include.push(association)
        }

        const model = await Model.findByPk(req.params.id, { include, user: req.user })
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
    async handler(req, res) {
        const model = await Model.findByPk(+req.params?.id, {
            include: {
                association: "Tags",
                attributes: ["id", "name", "description"]
            },
            user: req.user
        });

        assert(model, NotFound);

        // @ts-ignore
        const transaction = await model.sequelize.transaction()

        try {
            delete req.body.DataRequestId
            delete req.body.createdAt
            delete req.body.updatedAt

            await model.update(req.body, { transaction, user: req.user })
            if (Array.isArray(req.body.Tags)) {
                await model.setTags(req.body.Tags.map((t: any) => t.id), { transaction, user: req.user })
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
                        max: 500
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
    async handler(req, res) {
        assert(req.user?.id, "Guest cannot create graphs", Unauthorized)
        const model = await Model.create({ ...req.body, creatorId: req.user.id }, { user: req.user })
        if (Array.isArray(req.body.Tags)) {
            await model.setTags(req.body.Tags.map(t => t.id), { user: req.user })
            await model.reload({ include: [{ association: "Tags" }], user: req.user })
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
    handler: async (req, res) => {
        const model = await Model.findByPk(+req.params?.id, { user: req.user });
        assert(model, NotFound);
        await model.destroy({ user: req.user })
        res.json(model)
    }
});

// Bulk Delete -----------------------------------------------------------------
route(router, {
    path: "/",
    method: "delete",
    request: {
        schema: {
            id: {
                in: ['query'],
                isString: {
                    errorMessage: "The 'id' parameter must be a comma-separated list of IDs to delete"
                }
            }
        }
    },
    handler: async (req, res) => {

        const ids = String(req.query.id).trim().split(",").map(parseFloat)

        const result = await Model.destroy({
            where: {
                id: {
                  [Op.in]: ids,
                },
            },
            user: req.user
        });

        res.json({ message: `Deleted ${result} graphs` })
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
    async handler(req, res) {

        const model = await Model.findByPk(req.params.id, { user: req.user });

        assert(model, "Model not found", NotFound)
        
        const data  = model.getDataValue("screenShot");

        if (!data) {
            return res.sendFile("view.png", { root: Path.join(__dirname, "../../public") })
        }

        const match = (/^data:(.+?);base64,(.+)$/).exec(data || "");

        if (!match) {
            return res.status(400).end(`Invalid base64 image data`);
        }

        const file = Buffer.from(match[2], "base64");

        const cacheKey = crypto.createHash("sha1").update(file).digest("hex");

        res.setHeader('Cache-Control', `max-age=31536000, no-cache`)
        res.setHeader('Vary', 'Origin, ETag')
        res.setHeader('ETag', cacheKey)

        let ifNoneMatchValue = req.headers['if-none-match']
        if (ifNoneMatchValue && ifNoneMatchValue === cacheKey) {
            res.statusCode = 304
            return res.end()
        }

        // res.append("Last-Modified" , new Date(model.updatedAt).toUTCString());
        res.append("Content-Type"  , match[1])
        res.append("Content-Length", file.length + "")

        res.send(file);
    }
});

// Request line-level data -----------------------------------------------------
route(router, {
    method: "post",
    path  : "/:id/request-linelevel-data",
    async handler(req, res) {
        requestPermission({ user: req.user, resource: "Subscription", action: "requestLineLevelData" })
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
