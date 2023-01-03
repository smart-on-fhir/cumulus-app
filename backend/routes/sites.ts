import express, { Response }      from "express"
import Model                      from "../db/models/DataSite"
import { route }                  from "../lib/route"
import { NotFound, Unauthorized } from "../errors"
import { assert, getFindOptions } from "../lib"
import { AppRequest }             from ".."


const router = express.Router({ mergeParams: true });

// List all --------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    async handler(req: AppRequest, res: Response) {
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
    async handler(req: AppRequest, res: Response) {
        const model = await Model.findByPk(+req.params?.id, getFindOptions(req))
        assert(model, NotFound)
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
            lat: {
                in: [ "body" ],
                optional: true,
                isInt: {
                    errorMessage: "'lat' must be an integer",
                    options: {
                        min: 0,
                        max: 90
                    }
                }
            },
            long: {
                in: [ "body" ],
                optional: true,
                isInt: {
                    errorMessage: "'long' must be an integer",
                    options: {
                        min: -180,
                        max: 180
                    }
                }
            }
            // TODO: Add "setting" ?
        }
    },
    async handler(req: AppRequest, res: Response) {
        const model = await Model.findByPk(req.params.id);
        assert(model, NotFound);
        await model.update(req.body)
        res.json(model)
    }
})

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
            lat: {
                in: [ "body" ],
                optional: true,
                isInt: {
                    errorMessage: "'lat' must be an integer",
                    options: {
                        min: 0,
                        max: 90
                    }
                }
            },
            long: {
                in: [ "body" ],
                optional: true,
                isInt: {
                    errorMessage: "'long' must be an integer",
                    options: {
                        min: -180,
                        max: 180
                    }
                }
            }
            // TODO: Add "setting" ?
        }
    },
    async handler(req: AppRequest, res: Response) {
        assert(req.user?.id, "Guest cannot create projects", Unauthorized)
        const model = await Model.create({ ...req.body, creatorId: req.user?.id })
        res.json(model)
    }
})

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
    async handler(req: AppRequest, res: Response) {
        const model = await Model.findByPk(+req.params?.id);
        assert(model, NotFound);
        await model.destroy()
        res.json(model)
    }
})

export default router
