import express                    from "express"
import Model                      from "../db/models/DataSite"
import { route }                  from "../lib/route"
import { NotFound, Unauthorized } from "../errors"
import { assert, getFindOptions } from "../lib"


export const router = express.Router({ mergeParams: true });

// List all --------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    async handler(req, res) {
        res.json(await Model.findAll({ ...getFindOptions(req), user: req.user }))
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
    async handler(req, res) {
        const model = await Model.findByPk(+req.params?.id, { ...getFindOptions(req), user: req.user })
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
                optional: {
                    options: {
                        checkFalsy: true,
                        nullable: true
                    }
                },
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
                optional: {
                    options: {
                        checkFalsy: true,
                        nullable: true
                    }
                },
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
    async handler(req, res) {
        const model = await Model.findByPk(req.params.id, { user: req.user });
        assert(model, NotFound);
        await model.update(req.body, { user: req.user })
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
                in: ['body']
            },
            lat: {
                in: [ "body" ],
                optional: {
                    options: {
                        checkFalsy: true,
                        nullable: true
                    }
                },
                isInt: {
                    errorMessage: "'lat' must be an integer",
                    options: {
                        min: 0,
                        max: 90,
                    }
                }
            },
            long: {
                in: [ "body" ],
                optional: {
                    options: {
                        checkFalsy: true,
                        nullable: true
                    }
                },
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
    async handler(req, res) {
        assert(req.user?.id, "Guest cannot create projects", Unauthorized)
        const model = await Model.create({ ...req.body, creatorId: req.user?.id }, { user: req.user })
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
    async handler(req, res) {
        const model = await Model.findByPk(+req.params?.id, { user: req.user });
        assert(model, NotFound);
        await model.destroy({ user: req.user })
        res.json(model)
    }
})

export default router
