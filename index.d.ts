import { Request } from "express-serve-static-core";

declare module app {

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
        "date:YYYY"

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