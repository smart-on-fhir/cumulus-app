import { Request } from "express";

declare module app {

    function assert(condition: any, error: Error | string): asserts condition;

    interface UserRequest extends Request {
        user?: User
    }

    interface User {
        username: string
        role: UserRole
    }

    type UserRole = "admin" | "user"

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
        DataRequestId: number | null
        settings?: {
            viewType?: string
            showOptions?: boolean
            column: string
            groupBy: string
            filters: Filter[]
        }
    }

    interface DataRequest {

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
        
        data: DataRequestData

        requestedData: RequestedData | null

        dataURL: string | null

        dataSourceType: "file" | "url"
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

    interface DataRequestData {

        cols: DataRequestDataColumn[]

        rows: any[][]

        src?: string
    }

    interface DataRequestDataColumn {

        /**
         * The name as it appears in the first CSV row
         */
        name: string

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
        dataType: "string" | "integer" | "float" | "boolean" | "date:YYYY-MM-DD" | "date:YYYY-MM" | "date:YYYY"

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