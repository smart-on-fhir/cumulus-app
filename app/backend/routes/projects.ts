import express, { Response }      from "express"
import Model                      from "../db/models/Project"
import { route }                  from "../lib/route"
import { NotFound, Unauthorized } from "../errors"
import { assert }                 from "../lib"
import { AppRequest }             from ".."


const router = express.Router({ mergeParams: true });

// List all --------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    handler: async (req: AppRequest, res: Response) => {
        // res.json(await Model.findAll(getFindOptions(req)))
        res.json(await Model.findAll({
            include: [
                {
                    association: "Subscriptions",
                    include: [
                        {
                            association: "Views"
                        }
                    ]
                }
            ]
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
    handler: async (req: AppRequest, res: Response) => {
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
                            association: "Views"
                        }
                    ]
                }
            ]
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
    handler: async (req: AppRequest, res: Response) => {
        const model = await Model.findByPk(req.params.id);
        assert(model, NotFound);
        await model.update(req.body)
        
        if (Array.isArray(req.body.Subscriptions)) {
            await model.setSubscriptions(req.body.Subscriptions)
            await model.reload({ include: [{ association: "Subscriptions" }] })
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
    handler: async (req: AppRequest, res: Response) => {
        assert(req.user?.id, "Guest cannot create projects", Unauthorized)
        const model = await Model.create({ ...req.body, creatorId: req.user?.id })
        if (Array.isArray(req.body.Subscriptions)) {
            await model.setSubscriptions(req.body.Subscriptions)
            await model.reload({ include: [{ association: "Subscriptions" }] })
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

export default router
