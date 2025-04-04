import express, { Router }        from "express"
import Model                      from "../db/models/StudyArea"
import { route }                  from "../lib/route"
import { NotFound, Unauthorized } from "../errors"
import { assert, getFindOptions } from "../lib"
import View                       from "../db/models/View"


export const router: Router = express.Router({ mergeParams: true });

// List all --------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    handler: async (req, res) => {
        res.json(await Model.findAll({
            ...getFindOptions(req),
            include: [
                {
                    association: "Subscriptions",
                    include: [
                        {
                            association: "Views"
                        }
                    ]
                }
            ],
            user: req.user
        }))
    }
})

// Get one by ID ---------------------------------------------------------------
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
            }
        }
    },
    handler: async (req, res) => {
        // const model = await Model.findByPk(+req.params?.id, getFindOptions(req));
        const model = await Model.findByPk(+req.params?.id, {
            include: [
                {
                    association: "Subscriptions",
                    // attributes: {
                    //     exclude: [""]
                    // },
                    include: [
                        {
                            model: View.scope({ method: ['visible', req.user] }),
                            attributes: [
                                "id","creatorId","name","description","updatedAt","screenShot","isDraft"
                            ]
                        }
                    ]
                }
            ],
            order: [[Model.sequelize!.literal('"Subscriptions.name"'), "asc"]],
            user: req.user
        });
        assert(model, NotFound);
        res.json(model)
    }
})

// Update ----------------------------------------------------------------------
route(router, {
    path: "/:id",
    method: "put",
    request: {
        schema: {
            id: {
                in: 'params',
                isInt: {
                    errorMessage: "The 'id' parameter must be a positive integer",
                    options: {
                        gt: 0
                    }
                },
                toInt: true,
            },
            name: {
                in: 'body',
                optional: true,
                notEmpty: true
            },
            description: {
                in: 'body',
                optional: true,
                notEmpty: true
            },
            Subscriptions: {
                in: "body",
                optional: true,
                isArray: {
                    errorMessage: "Subscriptions should be an array of Subscription IDs",
                }
            }
        }
    },
    handler: async (req, res) => {
        const model = await Model.findByPk(req.params.id, { user: req.user });
        assert(model, NotFound);
        await model.update(req.body, { user: req.user })
        
        if (Array.isArray(req.body.Subscriptions)) {
            await model.setSubscriptions(req.body.Subscriptions, { user: req.user })
            await model.reload({ include: [{ association: "Subscriptions" }], user: req.user })
        }

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
                exists: true,
                notEmpty: true
            },
            Subscriptions: {
                in: "body",
                optional: true,
                isArray: {
                    errorMessage: "Subscriptions should be an array of Subscription IDs",
                }
            }
        }
    },
    handler: async (req, res) => {
        assert(req.user?.id, "Guest cannot create this record", Unauthorized)
        const model = await Model.create({ ...req.body, creatorId: req.user?.id }, { user: req.user })
        if (Array.isArray(req.body.Subscriptions)) {
            await model.setSubscriptions(req.body.Subscriptions, { user: req.user })
            await model.reload({ include: [{ association: "Subscriptions" }], user: req.user })
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

export default router
