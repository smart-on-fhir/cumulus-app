import express         from "express"
import { Includeable } from "sequelize/types"
import DataRequest     from "../../db/models/DataRequest"
import Model           from "../../db/models/RequestGroup"
import * as HttpError  from "../../errors"
import { assert }      from "../../lib"
import { route }       from "../../lib/route"


const router = express.Router({ mergeParams: true })


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
                    "completed"
                ],
                include: [
                    { association: "Views", attributes: ["name"] }
                ]
            })
        }
        
        try {
            const models = await Model.findAll({ include });
            const general = await DataRequest.findAll({
                where: {
                    "groupId": null
                },
                attributes: [
                    "id",
                    "name",
                    "completed"
                ],
                include: [
                    { association: "Views", attributes: ["name"] }
                ]
            });
            res.json([ ...models, {
                name: "GENERAL",
                requests: general
            } ]);
        } catch(error) {
            throw new HttpError.InternalServerError(`Error reading ${Model.name} models`);
        }
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
                    "completed"
                ]
            })
        }
        const model = await Model.findByPk(req.params.id, { include });
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
    handler: async (req, res) => res.json(await Model.create(req.body))
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
        const model = await Model.findByPk(req.params.id);
        assert(model, HttpError.NotFound);
        res.json(await model.update(req.body))
    }
});

// destroy ---------------------------------------------------------------------
// "request_groups_delete"
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
        const model = await Model.findByPk(req.params.id);
        assert(model, HttpError.NotFound);
        await model.destroy()
        res.json(model)
    }
});


export default router
