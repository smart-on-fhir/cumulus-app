import { Response, Router } from "express"
import { Includeable }      from "sequelize/types"
import Tag                  from "../db/models/Tag"
import * as lib             from "../lib"
import * as auth            from "../controllers/Auth"
import { NotFound }         from "../errors"
import { assert }           from "../lib"
import { route }            from "../lib/route"
import { AppRequest }       from ".."

const router = Router({ mergeParams: true });


// list ------------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    permission: ["tags_list"],
    handler: async (req: AppRequest, res: Response) => {
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

            // If set include the creator id and email
            creator: {
                in: ["query"],
                optional: true,
                isBoolean: true
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
    handler: async (req: AppRequest, res: Response) => {
        
        const permissions = ["tags_view"];

        const include: Includeable[] = [];

        if (req.query.creator) {
            include.push({ association: "creator", attributes: ["id", "email"] })
        }

        if (req.query.graphs) {
            permissions.push("views_list")
            include.push({
                association: "graphs",
                attributes: [
                    "id",
                    "name",
                    "description",
                    "rating",
                    "votes",
                    "normalizedRating",
                    "DataRequestId"
                ]
            })
        }

        if (req.query.subscriptions) {
            permissions.push("data_request_list")
            include.push({
                association: "subscriptions",
                attributes: [
                    "id",
                    "name",
                    "description",
                    "completed",
                    "refresh"
                ]
            })
        }

        const model = await Tag.findByPk(req.params.id, { include });
        assert(model, NotFound);
        permissions.forEach(p => auth.requestPermission(p as any, req, req.user?.id === model.creatorId))
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
                notEmpty: true,
                custom: {
                    options: x => x.length <= 50,
                    errorMessage: "The name cannot be longer than 50 characters"
                }
            },
            description: {
                in: ['body'],
                exists: true,
                notEmpty: true,
                custom: {
                    options: x => x.length <= 200,
                    errorMessage: "The description cannot be longer than 200 characters"
                }
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

// @ts-ignore
export = router
