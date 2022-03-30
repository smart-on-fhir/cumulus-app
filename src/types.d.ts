
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

    interface ColorOptions {
        saturation: number
        brightness: number
        variety   : number
        opacity   : number
        startColor: number
    }

    interface View {
        id: number
        name: string
        description: string
        DataRequestId: number | null
        screenShot?: string
        settings?: {
            viewType?: string
            showOptions?: boolean
            column: string
            groupBy: string
            filters: Filter[]
            chartOptions?: Partial<Highcharts.Options>
            colorOptions?: ColorOptions
            denominator ?: string
        }
    }

    interface DataRequest {

        /**
         * Unique ID for this request
         */
        id: number

        /**
         * Human-friendly name
         */
        name: string

        /**
         * Short description
         */
        description?: string

        groupId: number

        /**
         * Optional group (used by the UI to render requests in groups)
         */
        group?: RequestGroup

        /**
         * Date when the request has been initially created
         */
        createdAt: string

        updatedAt: string | null

        refresh: "none" | "manually" | "daily" | "weekly" | "monthly" | "yearly"

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

    type supportedDataType = "string" | "integer" | "float" | "boolean" | "date:YYYY-MM-DD" | "date:YYYY-MM" | "date:YYYY"

    interface RequestGroup {
        id         : number
        name       : string
        updatedAt  : string
        createdAt  : string
        description: string
        requests   : DataRequest[]
    }

    interface DataSite {
        id         : number
        name       : string
        description: string | null
        lat        : number | null // 0° to 90°
        long       : number | null // -180° to 180°
        updatedAt  : string | null
        createdAt  : string
    }

    interface Filter {
        left: string
        operator: string
        negated: boolean
        right: {
            type : "column" | "value"
            value?: string | number | Date | null
        },
        join: "and" | "or"
    }

    interface Activity {
        message: string
        createdAt: string
    }
}