
declare module app {

    /**
     * The current user of the app
     */
    interface User {
        id: number
        name: string | null
        email: string
        role: string
        remember: boolean
        password: string | null // null for pending accounts
        sid: string | null // string is logged in
        activationCode: string | null // null for system users
        lastLogin: string | null // Date | null
        invitedBy: number | null // Ref User ID
        createdAt: string // Date
        updatedAt: string // Date
        permissions: string[]
    }

    interface Tag {
        id            : number
        name          : string
        description   : string
        creatorId     : number | null
        updatedAt     : string
        createdAt     : string
        creator      ?: Pick<User, "id" | "email">
        graphs       ?: Pick<View, "id" | "name" | "description" | "DataRequestId">[]
        subscriptions?: Pick<DataRequest, "id" | "name" | "description" | "completed" | "refresh">[]
    }

    type CurrentUser = Omit<User, "password" | "sid">


    interface ColumnDescriptor {
        name: string
        alias?: string
    }
    
    interface TableDescriptor {
        name: string
        columns: ColumnDescriptor[]
    }

    interface ColorOptions {
        // saturation: number
        // brightness: number
        // variety   : number
        opacity   : number
        // startColor: number
        colors    : string[]
    }

    interface View {
        id: number
        name: string
        description: string
        DataRequestId: number | null
        screenShot?: string
        settings?: ViewSettings
        Tags?: Pick<Tag, "id" | "name" | "description">[]
        DataRequest?: Pick<DataRequest, "id" | "name">
        createdAt?: Date
        updatedAt?: Date
    }

    interface ViewSettings {
        column: string
        groupBy: string
        filters: Filter[]
        viewType?: string
        chartOptions?: Partial<Highcharts.Options>
        denominator ?: string
        column2    ?: string // Extra Column
        column2type?: string // Extra Column render as
        caption?: string // HTML chart caption
        seriesVisibility?: Record<string, boolean>
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

        aggDataPackage: string | null

        dataSourceType: "file" | "url" | "aggregator"

        metadata: {
            cols : DataRequestDataColumn[],
            total: number
        } | null

        Tags?: Pick<Tag, "id" | "name" | "description">[]

        Views?: View[]

        transmissions: Transmission[] | null

        Projects?: Project[]
    }

    interface Transmission {
        date     ?: Date
        siteId   ?: number
        comment  ?: string
        failed   ?: boolean
        dataStart?: Date
        dataEnd  ?: Date
    }

    interface RequestedData {
        fields: RequestedDataFields
        dataSites: DataSite[]
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
        id?: string | number
        name: string
        description?: string | null
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
        dataType: supportedDataType

        meta?: any

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
        setting    : string | null
        updatedAt  : string
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

    interface Annotation {

        /**
         * The text, including formatting markup
         * see https://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting
         */
        text?: string;

        point: AnnotationPoint
    }

    interface AnnotationPoint {

        /**
         * The x position of the point.
         * Units can be either in axis or chart pixel coordinates.
         */
        x: number

        /**
         * The y position of the point. Units can be either in axis
         * or chart pixel coordinates.
         */
        y: number

        /**
         * This number defines which xAxis the point is connected to.
         * It refers to either the axis id or the index of the axis in the xAxis array.
         * If the option is not configured or the axis is not found the point's x
         * coordinate refers to the chart pixels.
         */
        xAxis: number | string | null

        /**
         * This number defines which yAxis the point is connected to. It refers to
         * either the axis id or the index of the axis in the yAxis array. If the
         * option is not configured or the axis is not found the point's y coordinate
         * refers to the chart pixels.
         */
        yAxis: number | string | null
    }

    interface Activity {
        message: string
        createdAt: string
    }

    interface Project {
        id         : number
        name       : string
        description: string
        creatorId  : number
        updatedAt  : string
        createdAt  : string
        Subscriptions?: DataRequest[]
    }

    

    namespace ServerResponses {
        
        interface UnStratifiedDataResponse {
            column: string
            stratifier?: string
            filters: string[]
            totalCount: number
            rowCount: number
            data: [{
                rows: [string, number][]
            }]
        }

        interface StratifiedDataResponse extends UnStratifiedDataResponse {
            stratifier: string
            data: ({
                stratifier: string
                rows: [string, number][]
            })[]
        }

        type DataResponse = StratifiedDataResponse | UnStratifiedDataResponse

        interface User {
            id: number
            email: string
            name: string | null
            role: string
            lastLogin: string | null
            createdAt: string | null
            updatedAt: string | null
            activationCode: string | null
            invitedBy: string | null
            
            sid: string | null
            password: string
            
            status: string
            // online: boolean
            // activated: boolean

        }
    }
}