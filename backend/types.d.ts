import { InstanceDestroyOptions, Options, QueryInterface } from "sequelize"
import { ParsedQs } from "qs"
import {
    Request,
    ParamsDictionary,
    RequestHandler,
    Response,
    NextFunction
} from "express"

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
    regionalClusterEmail: string

    // When new subscriptions are created, notification emails are sent to this address
    cumulusAdminEmail: string

    userInviteExpireAfterHours: number

    userResetExpireAfterHours: number

    docker: {
        containerName: string
    }

    db: {
        sync: "none" | "normal" | "force" | "alter"
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

export type MigrationContext = {
    /** Full path to the migration file */
    path: string
    
    /** The name of the migration file */
    name: string

    /** The QueryInterface */
    context: QueryInterface
}

export type MigrationFunction = (ctx: MigrationContext) => Promise<void>

declare namespace app {

    function assert(condition: any, error: Error | string): asserts condition;

    interface UserRequest extends Request {
        user?: User
    }

    interface AuthenticatedRequest extends Request {
        user: User
    }

    interface User {
        id: number
        email: string
        name: string
        role: UserRole
        password: string | null
        createdAt: Date
    }

    type UserRole = "admin" | "manager" | "owner" | "user" | "guest"

    type CsvDataType =
        "string" |
        "integer" |
        "float" |
        "boolean" |
        "day" |
        "week" |
        "month" |
        "year" |
        "date:YYYY wk W" |
        "date:YYYY-MM-DD" |
        "date:YYYY-MM" |
        "date:YYYY" | 
        "hidden"

    interface ColumnDescriptor {
        name: string
        alias?: string
    }
    
    interface TableDescriptor {
        name: string
        columns: ColumnDescriptor[]
    }

    interface View {
        id: string
        name: string
        description: string
        subscriptionId: number | null
        settings?: {
            viewType?: string
            showOptions?: boolean
            column: string
            groupBy: string
            filters: Filter[]
        }
    }

    interface Subscription {

        /**
         * Unique ID for this request
         */
        id: string

        /**
         * Human-friendly name
         */
        name: string

        /**
         * Short description
         */
        description?: string

        /**
         * Optional group (used by the UI to render requests in groups)
         */
        group?: string

        /**
         * Date when the request has been initially created
         */
        created: string

        /**
         * Subscriptions are like normal requests but are refreshed automatically
         * based on pre-defined schedule
         */
        type: "SUBSCRIPTION" | "REQUEST"
        
        /**
         * - `pending`   - Created but not resolved yet
         * - `loading`   - Currently waiting for response
         * - `completed` - Created and resolved
         * - `errored`   - Marked as invalid  or otherwise failed
         */
        status: "pending" | "completed" | "loading" | "errored"

        /**
         * Timestamp showing when the data has been generated (or last refreshed in
         * case of subscriptions)
         */
        completed: string | null

        metadata: SubscriptionMetaData | null

        requestedData: RequestedData | null

        dataURL: string | null

        dataSourceType: "file" | "url"
    }

    interface SubscriptionMetaData {
        cols : SubscriptionDataColumn[]
        total: number
    }

    interface RequestedData {
        fields: RequestedDataFields
        dataSites: DataListItem[]
    }

    interface RequestedDataFields {
        labs         : DataListItem[]
        diagnoses    : DataListItem[]
        immunizations: DataListItem[]
        medications  : DataListItem[]
        procedures   : DataListItem[]
        phenotypes   : DataListItem[]
        demographics : DataListItem[]
    }

    interface DataListItem {
        name: string
        description: string
        label?: string
    }

    interface SubscriptionDataColumn {

        /**
         * The name as it appears in the first CSV row
         */
        name: string | String

        /**
         * Human-readable name
         */
        label: string

        /**
         * Short description
         */
        description: string

        /**
         * The type of data this column is supposed to contain. Used for
         * formatting in the UI
         */
        dataType: CsvDataType

    }

    interface Filter {
        left: string
        operator: string
        right: {
            type : "column" | "string" | "number" | "date" | "null" | "true" | "false"
            value: string | number | Date | null
        }
    }
}
