import express, { NextFunction, Response, Router } from "express"
import { checkSchema, Schema, validationResult }   from "express-validator"
import * as logger                                 from "../services/logger"
import { AppRequest, AppRequestHandler }           from "../types"
import { BadRequest } from "../errors"


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
                    next(new BadRequest("Request validation failed: " + array[0]));
                } else {
                    next(new BadRequest("Multiple request validation errors: " + array.map(e => "\n - " + e).join("")));
                }
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
