import express, { NextFunction, Response, Router } from "express"
import { checkSchema, Schema, validationResult }   from "express-validator"
import * as logger                                 from "../services/logger"
import { AppRequest, AppRequestHandler }           from "../types"


export function route(router: Router, options: {
    path: string
    method: "get" | "post" | "put" | "delete"
    // handler: AppRequestHandler
    handler: (req: AppRequest, res: Response, next: NextFunction) => Promise<any>
    permission?: string[]
    request?: {
        schema?: Schema
    }
})
{
    const middlewares: AppRequestHandler[] = [];

    // body parsing --------------------------------------------------------
    middlewares.push(
        express.raw({ limit: "5MB" }),
        express.json({ limit: "5MB" }),
        express.urlencoded({ extended: true, limit: "5MB" }),
        express.text({ limit: "5MB" })
    )
    
    // Request validation --------------------------------------------------
    if (options.request?.schema) {
        middlewares.push(
            // @ts-ignore
            checkSchema(options.request.schema),
            (req, res, next) => {
                // const errors = validationResult(req);
                // if (!errors.isEmpty()) {
                //   return res.status(400).json({ errors: errors.array() });
                // }
                // handle the request as usual

                const errors = validationResult(req).formatWith(({ location, msg, param, value, nestedErrors }) => {
                    // Build your resulting errors however you want! String, object, whatever - it works!
                    return `${param}: ${msg}`;
                });
        
                if (errors.isEmpty()) {
                    return next()
                }
        
                const array = errors.array()
                if (array.length === 1) {
                    logger.error("Request validation error: " + array[0], errors)
                } else {
                    logger.error("Multiple request validation errors", errors)
                }
        
                res.status(400).json({ errors: array });
            }
        )
    }

    // Handler -------------------------------------------------------------
    middlewares.push((req, res, next) => {
        Promise.resolve(options.handler(req, res, next)).catch(error => {
            return next(error)
        })
    })

    router[options.method](options.path, middlewares)
}
