import { InstanceDestroyOptions, Options } from "sequelize"
import { ParsedQs } from "qs"
import {
    Request,
    ParamsDictionary,
    RequestHandler,
    Response,
    NextFunction
} from "express-serve-static-core"

type Role = "guest" | "user" | "manager" | "admin" | "owner" | "system"

declare module 'sequelize' {
    interface Sequelize {
        user: CurrentUser
    }
    interface InstanceUpdateOptions {
        user?: CurrentUser
    }
    interface InstanceDestroyOptions {
        user?: CurrentUser
    }
    interface FindOptions {
        user?: CurrentUser
    }
    interface CreateOptions {
        user?: CurrentUser
    }
    interface DestroyOptions {
        user?: CurrentUser
    }
    interface UpdateOptions {
        user?: CurrentUser
    }    
    interface UpsertOptions {
        user?: CurrentUser
    }
    interface SaveOptions {
        user?: CurrentUser
    }
}

interface ModelDestroyOptions extends InstanceDestroyOptions {
    user?: CurrentUser
}

interface Config {
    port    : number
    host    : string
    throttle: number
    appEmail: string

    // When line-level data is requested, the email is sent to this address.
    // Typically, this would represent a subscription group that handles for
    // example "MA DPH Subscriptions to the Massachusetts regional cluster"
    regionalClusterEmail: string

    // When new data requests (and/or subscriptions) are created, notification
    // emails are sent to this address
    cumulusAdminEmail: string

    userInviteExpireAfterHours: number

    userResetExpireAfterHours: number

    docker: {
        containerName: string
    }

    db: {
        sync: "none" | "normal" | "force" | "alter"
        seed: string
        options: Options
    }

    mailGun: {
        apiKey: string
        domain: string
        [key: string]: any
    }

    aggregator: {
        baseUrl: string
        apiKey : string
        enabled: boolean
    }
}

interface CurrentUser {
    id   : number
    email: string
    role : Role
    permissions: Record<string, boolean>
    [key : string]: any
}

interface AppRequest<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
    user?: CurrentUser
}

interface AppRequestHandler<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    Locals extends Record<string, any> = Record<string, any>
> extends RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> {
    (
        req: AppRequest<P, ResBody, ReqBody, ReqQuery, Locals>,
        res: Response<ResBody, Locals>,
        next: NextFunction,
    ): void;
}

export type AppErrorRequestHandler<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    Locals extends Record<string, any> = Record<string, any>
> = (
    err: any,
    req: AppRequest<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction,
) => void;
