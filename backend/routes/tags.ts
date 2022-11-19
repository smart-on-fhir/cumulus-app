import { Router }      from "express"
import Tag             from "../db/models/Tag"
import * as lib        from "../lib"
import * as auth       from "../controllers/Auth"
import { NotFound } from "../errors"
import { assert } from "../lib"
import { route } from "../lib/route"

const router = module.exports = Router({ mergeParams: true });


// list ------------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    permission: ["tags_list"],
    handler: async (req, res) => {
        res.json(await Tag.findAll(lib.getFindOptions(req)));
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
        const model = await Tag.findByPk(+req.params?.id);
        assert(model, NotFound);
        auth.requestPermission("tags_view", req, req.user?.id === model.creatorId)
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
        const model = await Tag.findByPk(+req.params?.id);
        assert(model, NotFound);
        auth.requestPermission("tags_update", req, req.user?.id === model.creatorId)
        res.json(await model.update(req.body, { user: req.user }))
    }
});

// create ----------------------------------------------------------------------
route(router, {
    path: "/",
    method: "post",
    permission: "tags_create",
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
        const model = await Tag.create(attributes, { user: req.user } as any)
        res.json(model)
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
        const model = await Tag.findByPk(+req.params?.id);
        assert(model, NotFound);
        auth.requestPermission("tags_delete", req, req.user?.id === model.creatorId)
        await model.destroy({ user: req.user })
        res.json(model)
    }
});

