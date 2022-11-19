import express                                   from "express"
import { Router }                                from "express-serve-static-core"
import { checkSchema, Schema, validationResult } from "express-validator"
import { logger }                                from "../logger"
import { HttpError, BadRequest }                 from "../errors"
import { requirePermission }                     from "../controllers/Auth"
import { ACL }                                   from "../acl"
import { AppRequestHandler }                     from ".."


export function route(router: Router, options: {
    path: string
    method: "get" | "post" | "put" | "delete"
    handler: AppRequestHandler
    permission?: keyof typeof ACL | (keyof typeof ACL)[]
    request?: {
        schema?: Schema
    }
})
{
    const middlewares: AppRequestHandler[] = [];

    // body parsing --------------------------------------------------------
    middlewares.push(
        express.raw(),
        express.json(),
        express.urlencoded({ extended: true }),
        express.text()
    )

    // Authentication ------------------------------------------------------
    if (options.permission) {
        if (Array.isArray(options.permission)) {
            options.permission.forEach(permission => {
                middlewares.push(requirePermission(permission))
            })
        } else {
            middlewares.push(requirePermission(options.permission))
        }
    }

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
            if (error instanceof HttpError) {
                return next(error)
            }
            logger.error(error, { tags: ["DATA"] })
            const finalError = new BadRequest()
            finalError.cause = error.stack
            next(finalError)
        })
    })

    router[options.method](options.path, middlewares)
}
