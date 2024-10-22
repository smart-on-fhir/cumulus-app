import express         from "express"
import { Includeable } from "sequelize"
import Subscription    from "../db/models/Subscription"
import Model           from "../db/models/SubscriptionGroup"
import * as HttpError  from "../errors"
import { assert }      from "../lib"
import { route }       from "../lib/route"


export const router = express.Router({ mergeParams: true })


// getAll ----------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    request: {
        schema: {
            subscriptions: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            }
        }
    },
    handler: async (req, res) => {
        const include: Includeable[] = [];
        
        if (req.query.subscriptions) {
            include.push({
                association: "requests",
                attributes: [
                    "id",
                    "name",
                    "completed",
                    "metadata",
                    "dataURL"
                ],
                include: [
                    { association: "Views", attributes: ["name"] }
                ]
            })
        }
        
        const models = await Model.findAll({ include, user: req.user });
        const general = await Subscription.findAll({
            where: {
                "groupId": null
            },
            attributes: [
                "id",
                "name",
                "completed",
                "metadata",
                "dataURL"
            ],
            include: [
                { association: "Views", attributes: ["name"] }
            ],
            user: req.user
        });

        res.json([ ...models, {
            name: "GENERAL",
            requests: general
        }]);
    }
});

// getOne ----------------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "get",
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
            subscriptions: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            }
        }
    },
    handler: async (req, res) => {
        const include: Includeable[] = [];
        if (req.query.subscriptions) {
            include.push({
                association: "requests",
                attributes: [
                    "id",
                    "name",
                    "completed",
                    "metadata",
                    "dataURL",
                    // Subquery to count graphs for each request
                    [
                        Model.sequelize!.literal(`(
                            SELECT COUNT(*)::int
                            FROM "Views" AS "graphs"
                            WHERE "graphs"."subscriptionId" = "requests"."id"
                        )`),
                        "graphCount"
                    ]
                ]
            })
        }
        const model = await Model.findByPk(+req.params.id, { include, user: req.user });
        assert(model, HttpError.NotFound);
        res.json(model)
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
                notEmpty: true
            },
            description: {
                in: ['body'],
                optional: true,
                notEmpty: true,
            }
        }
    },
    handler: async (req, res) => res.json(await Model.create(req.body, { user: req.user }))
});

// update ----------------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "put",
    request: {
        schema: {
            id: {
                in: ['params'],
                errorMessage: 'ID is wrong',
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
                exists: true,
                notEmpty: true
            },
            description: {
                in: ['body'],
                optional: true,
                notEmpty: true,
            }
        }
    },
    handler: async (req, res) => {
        const model = await Model.findByPk(req.params.id, { user: req.user });
        assert(model, HttpError.NotFound);
        res.json(await model.update(req.body, { user: req.user }))
    }
});

// destroy ---------------------------------------------------------------------
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
                        min: 1
                    }
                },
                toInt: true,
            }
        }
    },
    handler: async (req, res) => {
        const model = await Model.findByPk(req.params.id, { user: req.user });
        assert(model, HttpError.NotFound);
        await model.destroy({ user: req.user })
        res.json(model)
    }
});


export default router
