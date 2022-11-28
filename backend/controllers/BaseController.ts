import { Response, Router }       from "express"
import { ModelStatic }            from "sequelize"
import * as HttpError             from "../errors"
import { getFindOptions, assert } from "../lib"
import { route }                  from "../lib/route"
import { AppRequest }             from ".."
import BaseModel                  from "../db/models/BaseModel"


type Actions = {
    getAll ?: any
    getOne ?: any
    create ?: any
    update ?: any
    destroy?: any
}

export default function createRestRoutes(router: Router, modelConstructor: ModelStatic<BaseModel>, {
    getAll,
    getOne,
    create,
    update,
    destroy
}: Actions = {})
{
    if (getAll) {
        route(router, {
            path: "/",
            method: "get",
            async handler(req: AppRequest, res: Response) {
                res.json(await modelConstructor.findAll(getFindOptions(req)));
            }
        })
    }

    if (getOne) {
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
                const model = await modelConstructor.findByPk(+req.params?.id);
                assert(model, HttpError.NotFound);
                res.json(model)
            }
        })
    }

    if (create) {
        route(router, {
            path: "/",
            method: "post",
            async handler(req: AppRequest, res: Response) {
                res.json(await modelConstructor.create(req.body))
            }
        });
    }

    if (update) {
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
            async handler(req: AppRequest, res: Response) {
                const model = await modelConstructor.findByPk(req.params.id);
                assert(model, HttpError.NotFound);
                res.json(await model.update(req.body))
            }
        });
    }

    if (destroy) {
        route(router, {
            path: "/:id",
            method: "delete",
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
                    }
                }
            },
            async handler(req: AppRequest, res: Response) {
                const model = await modelConstructor.findByPk(req.params.id);
                assert(model, HttpError.NotFound);
                await model.destroy()
                res.json(model)
            }
        });
    }
}

