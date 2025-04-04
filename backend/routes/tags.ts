import { Router }      from "express"
import { Includeable } from "sequelize"
import Model           from "../db/models/Tag"
import * as lib        from "../lib"
import { NotFound }    from "../errors"
import { assert }      from "../lib"
import { route }       from "../lib/route"
import View            from "../db/models/View"

export const router: Router = Router({ mergeParams: true });


// list ------------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    async handler(req, res) {
        res.json(await Model.findAll({ ...lib.getFindOptions(req), user: req.user }));
    }
})

// view ------------------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "get",
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

            // If set include the creator id and email
            creator: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            },

            // If set include the graphs count
            graphs: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            },

            // If set include the subscriptions count
            subscriptions: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            }
        }
    },
    async handler(req, res) {
        
        const include: Includeable[] = [];

        if (req.query.creator) {
            include.push({ association: "creator", attributes: ["id", "email"] })
        }

        if (req.query.graphs) {
            include.push({
                model: View.scope({ method: ['visible', req.user] }),
                as: "graphs",
                required: false,
                attributes: [
                    "id",
                    "name",
                    "description",
                    "subscriptionId",
                    "isDraft",
                    "updatedAt"
                ]
            })
        }

        if (req.query.subscriptions) {
            include.push({
                association: "subscriptions",
                attributes: [
                    "id",
                    "name",
                    "description",
                    "completed",
                    "refresh",
                    "dataURL",
                    "metadata",
                    // Subquery to count graphs for each request
                    [
                        Model.sequelize!.literal(`(
                            SELECT COUNT(*)::int
                            FROM "Views" AS "graphs"
                            WHERE "graphs"."subscriptionId" = "subscriptions"."id"
                        )`),
                        "graphCount"
                    ]
                ]
            })
        }

        const model = await Model.findByPk(req.params.id, { include, user: req.user });
        assert(model, NotFound);
        res.json(model)
    }
});

// update ----------------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "put",
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
            name: {
                in: ['body'],
                optional: true,
                notEmpty: true,
                custom: {
                    options: x => x.length <= 50,
                    errorMessage: "The name cannot be longer than 50 characters"
                }
            },
            description: {
                in: ['body'],
                optional: true,
                notEmpty: true,
                custom: {
                    options: x => x.length <= 200,
                    errorMessage: "The description cannot be longer than 200 characters"
                }
            }
        }
    },
    async handler(req, res) {
        const model = await Model.findByPk(req.params.id, { user: req.user });
        assert(model, NotFound);
        res.json(await model.update(req.body, { user: req.user }))
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
                    errorMessage: "The name cannot be longer than 50 characters",
                    options: {
                        max: 50
                    }
                }
            },
            description: {
                in: ['body'],
                exists: true,
                notEmpty: true,
                isLength: {
                    errorMessage: "The description cannot be longer than 200 characters",
                    options: {
                        max: 200
                    }
                }
            }
        }
    },
    async handler(req, res) {
        res.json(await Model.create({ ...req.body, creatorId: req.user?.id }, { user: req.user }))
    }
});

// delete ----------------------------------------------------------------------
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
    async handler(req, res) {
        const model = await Model.findByPk(req.params.id, { user: req.user });
        assert(model, NotFound);
        await model.destroy({ user: req.user })
        res.json(model)
    }
});

export default router
