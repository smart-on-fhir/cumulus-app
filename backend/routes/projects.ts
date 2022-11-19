import express                    from "express"
import auth                       from "../controllers/Auth"
import Model                      from "../db/models/Project"
import { route }                  from "../lib/route"
import { NotFound }               from "../errors"
import { assert, getFindOptions } from "../lib"


const router = module.exports = express.Router({ mergeParams: true });

// List all --------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    permission: "projects_list",
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
                errorMessage: 'ID is wrong',
                isInt: {
                    errorMessage: "The 'id' parameter must be integer"
                },
                custom: {
                    options: x => x > 0,
                    errorMessage: "The 'id' parameter must be a positive integer"
                },
                toInt: true,
            }
        }
    },
    handler: async (req, res) => {
        const model = await Model.findByPk(+req.params?.id);
        assert(model, NotFound);
        auth.requestPermission("projects_view", req, req.user?.id === model.creatorId)
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
        const model = await Model.findByPk(+req.params?.id);
        assert(model, NotFound);
        auth.requestPermission("projects_update", req, req.user?.id === model.creatorId)
        res.json(await model.update(req.body, { user: req.user }))
    }
});

// create ----------------------------------------------------------------------
route(router, {
    path: "/",
    method: "post",
    permission: "projects_create",
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
    handler: async (req, res) => {
        const attributes = { ...req.body, creatorId: req.user?.id }
        res.json(await Model.create(attributes, { user: req.user } as any))
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
                errorMessage: 'ID is wrong',
                isInt: {
                    errorMessage: "The 'id' parameter must be integer"
                },
                custom: {
                    options: x => x > 0,
                    errorMessage: "The 'id' parameter must be a positive integer"
                },
                toInt: true,
            }
        }
    },
    handler: async (req, res) => {
        const model = await Model.findByPk(+req.params?.id);
        assert(model, NotFound);
        auth.requestPermission("projects_delete", req, req.user?.id === model.creatorId)
        await model.destroy({ user: req.user })
        res.json(model)
    }
});
