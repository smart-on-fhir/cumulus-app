import { Router }      from "express"
import { Includeable } from "sequelize/types"
import Model           from "../db/models/UserGroup"
import { assert }      from "../lib"
import { route }       from "../lib/route"
import {
    HttpError,
    InternalServerError,
    NotFound
} from "../errors"


const router = Router({ mergeParams: true });


// list ------------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    request: {
        schema: {
            users: {
                in       : ["query"],
                optional : true,
                isBoolean: true,
                toBoolean: true
            }
        }
    },
    async handler(req, res) {
        const rows = await Model.findAll({
            include: req.query.users ? [{
                association: "users",
                attributes: ["id", "name", "email", "role"]
            }] : [],
            user: req.user
        });
        res.json(rows);
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
                isInt: {
                    errorMessage: "The 'id' parameter must be a positive integer",
                    options: {
                        gt: 0
                    }
                },
                toInt: true,
            },

            // If set include the users
            users: {
                in: ["query"],
                optional: true,
                isBoolean: true,
                toBoolean: true
            },
        }
    },
    async handler(req, res) {
        const include: Includeable[] = [];
        if (req.query.users) {
            include.push({
                association: "users",
                attributes: [
                    "id",
                    "name",
                    "email",
                    "role"
                ]
            })
        }
        const model = await Model.findByPk(req.params.id, { include, user: req.user });
        assert(model, NotFound);
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
            },
            users: {
                in      : ['body'],
                optional: true,
                isArray : true,
                toArray : true
            }
        }
    },
    async handler(req, res) {
        const model = await Model.findByPk(req.params.id, { user: req.user });
        assert(model, NotFound);

        const transaction = await model.sequelize.transaction()
        try {
            delete req.body.createdAt
            delete req.body.updatedAt
        
            await model.update(req.body, { transaction, user: req.user })
            
            if (Array.isArray(req.body.users)) {
                await model.setUsers(req.body.users.map((u: any) => u.id), { transaction, user: req.user })
                await model.reload({ include: [{ association: "users" }], transaction, user: req.user })
            }

            await transaction.commit()
            
            res.json(model)
        } catch (ex) {
            await transaction.rollback()
            if (ex instanceof HttpError) {
                ex.data = { tags: ["DATA"] }
                ex.cause = ex.stack
                throw ex
            }
            const { message, stack } = ex as Error
            const error = new InternalServerError(`Updating ${Model.name} failed. ${message}`, { tags: ["DATA"] })
            error.cause = stack
            throw error
        }
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
                exists  : true,
                notEmpty: true,
                isLength: {
                    errorMessage: "The name cannot be longer than 50 characters",
                    options: {
                        max: 50
                    }
                }
            },
            description: {
                in      : ['body'],
                exists  : true,
                notEmpty: true,
                isLength: {
                    errorMessage: "The description cannot be longer than 200 characters",
                    options: {
                        max: 200
                    }
                }
            },
            users: {
                in      : ['body'],
                optional: true,
                isArray : true,
                toArray : true
            }
        }
    },
    async handler(req, res) {
        const transaction = await Model.sequelize!.transaction()
        try {
            const model = await Model.create({ ...req.body }, { transaction, user: req.user })
            if (Array.isArray(req.body.users)) {
                await model.setUsers(req.body.users.map(u => u.id), { transaction, user: req.user })
                await model.reload({ include: [{ association: "users" }], transaction, user: req.user })
            }
            await transaction.commit()
            res.json(model)
        } catch (ex: any) {
            await transaction.rollback()
            throw ex
        }
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
        const model = await Model.findByPk(req.params.id, { user: req.user });
        assert(model, NotFound);
        await model.destroy({ user: req.user })
        res.json(model)
    }
});

export default router
