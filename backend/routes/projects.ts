import express                    from "express"
import Model                      from "../db/models/Project"
import { route }                  from "../lib/route"
import { NotFound, Unauthorized } from "../errors"
import { assert, getFindOptions } from "../lib"
import { AppRequest } from ".."


const router = express.Router({ mergeParams: true });

// List all --------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    handler: async (req, res) => {
        res.json(await Model.findAll(getFindOptions(req)))
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
        const model = await Model.findByPk(+req.params?.id);
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
                notEmpty: true
            },
            description: {
                in: ['body'],
                optional: true,
                notEmpty: true
            }
        }
    },
    handler: async (req, res) => {
        const model = await Model.findByPk(req.params.id);
        assert(model, NotFound);
        res.json(await model.update(req.body))
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
            }
        }
    },
    handler: async (req: AppRequest, res) => {
        assert(req.user?.id, "Guest cannot create projects", Unauthorized)
        res.json(await Model.create({
            ...req.body,
            creatorId: req.user?.id
        }))
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
        const model = await Model.findByPk(+req.params?.id);
        assert(model, NotFound);
        await model.destroy()
        res.json(model)
    }
});

export default router
