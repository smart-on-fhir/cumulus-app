
declare module app {

    interface User {
        username: string
        role: string
        remember: boolean
    }

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
        dataSourceId: string
        screenShot?: string
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
        group?: RequestGroup

        /**
         * Date when the request has been initially created
         */
        createdAt: string

        updatedAt: string | null

        refresh: null | "daily" | "weekly" | "monthly" | "yearly"

        /**
         * Subscriptions are like normal requests but are refreshed automatically
         * based on pre-defined schedule
         */
        // type: "SUBSCRIPTION" | "REQUEST"
        
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
    }

    interface DataRequestData {

        cols: DataRequestDataColumn[]

        rows: any[][]
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

    interface RequestGroup {
        id  : string
        name: string
        requests: DataRequest[]
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