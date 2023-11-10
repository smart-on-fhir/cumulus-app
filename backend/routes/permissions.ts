import { Router }   from "express"
import Model        from "../db/models/Permission"
import * as lib     from "../lib"
import { NotFound } from "../errors"
import { assert }   from "../lib"
import { route }    from "../lib/route"

const router = Router({ mergeParams: true });


// list ------------------------------------------------------------------------
route(router, {
    path: "/",
    method: "get",
    async handler(req, res) {
        res.json(await Model.findAll({ ...lib.getFindOptions(req), user: req.user }));
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
        const model = await Model.findByPk(+req.params?.id, { user: req.user })
        assert(model, NotFound)
        res.json(model)
    }
})


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
            }
        }
    },
    async handler(req, res) {
        const model = await Model.findByPk(req.params.id, { user: req.user });
        assert(model, NotFound);
        res.json(await model.update(req.body, { user: req.user }))
    }
});


export default router
