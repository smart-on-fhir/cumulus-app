import { DashStyleValue } from "highcharts"

export type JSONScalar = string | number | boolean | null;
export type JSONArray  = JSONValue[];
// export type JSONObject = { [ key: string ]: JSONValue };
export type JSONObject = Record<string, JSONValue>;
export type JSONValue  = JSONScalar | JSONArray | JSONObject;

export declare module app {

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
        status?: string
    }

    interface UserGroup {
        id          : number
        name        : string
        description : string
        updatedAt   : string
        createdAt   : string
        users      ?: Pick<User, "id" | "name" | "email" | "role">[]
    }

    interface Tag {
        id            : number
        name          : string
        description   : string
        creatorId     : number | null
        updatedAt     : string
        createdAt     : string
        creator      ?: Pick<User, "id" | "email">
        graphs       ?: Pick<View, "id" | "name" | "description" | "subscriptionId">[]
        subscriptions?: Pick<Subscription, "id" | "name" | "description" | "completed" | "refresh">[]
    }

    interface Permission {
        id           : number
        user_id      : number | null
        role         : "admin" | "manager" | "user" | "guest" | null
        resource     : string
        attribute    : string | null
        resource_id  : number | null
        user_group_id: number | null
        action       : string
        permission   : boolean
        comment      : string
        createdAt    : string
        updatedAt    : string
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
        subscriptionId: number | null
        screenShot?: string
        settings?: ViewSettings
        creatorId?: number | null
        Tags?: Pick<Tag, "id" | "name" | "description">[]
        Subscription?: Pick<Subscription, "id" | "name">
        isDraft?: boolean
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
        ranges?: RangeOptions
        sortBy?: string
        limit ?: number
        offset?: number
    }

    interface VisualOverridesState {
        enabled    : boolean
        brightness : number
        contrast   : number
        saturation : number
        fontColor ?: string
        fontColorEnabled ?: boolean
    }

    interface Subscription {

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
        group?: SubscriptionGroup

        /**
         * Date when the request has been initially created
         */
        createdAt: string

        updatedAt: string | null

        /** @deprecated */
        refresh: "none" | "manually" | "daily" | "weekly" | "monthly" | "yearly"

        /**
         * - `pending`   - Created but not resolved yet
         * - `loading`   - Currently waiting for response
         * - `completed` - Created and resolved
         * - `errored`   - Marked as invalid  or otherwise failed
         */
        /** @deprecated */
        status: "pending" | "completed" | "loading" | "errored"

        /**
         * Timestamp showing when the data has been generated (or last refreshed in
         * case of subscriptions)
         */
        completed: string | null

        /** @deprecated */
        requestedData: RequestedData | null

        dataURL: string | null

        dataSourceType: "file" | "url" | "aggregator"

        metadata: {
            cols  : SubscriptionDataColumn[],
            total?: number
            type ?: "cube" | "flat"
        } | null

        Tags?: Pick<Tag, "id" | "name" | "description">[]

        Views?: View[]

        /** @deprecated */
        transmissions: Transmission[] | null

        StudyAreas?: StudyArea[]

        graphCount?: number
    }

    interface SubscriptionWithPackage extends app.Subscription {
        dataPackage: DataPackage | null
    }

    interface StudyArea {
        id: number
        name: string
        description: string
        creatorId: number
        createdAt: string
        updatedAt: string
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

    interface SubscriptionData {

        cols: SubscriptionDataColumn[]

        rows: any[][]

        src?: string
    }

    interface SubscriptionDataColumn {

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

    type supportedDataType = "string" | "integer" | "float" | "boolean" | "date:YYYY-MM-DD" | "date:YYYY-MM" | "date:YYYY" | "hidden"

    interface SubscriptionGroup {
        id         : number
        name       : string
        updatedAt  : string
        createdAt  : string
        description: string
        requests   : Subscription[]
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

    type RangeOptions = {
        type?: "errorbar" | "areasplinerange" | "column" | ""
        enabled?: boolean
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

    interface StudyArea {
        id         : number
        name       : string
        description: string
        creatorId  : number
        updatedAt  : string
        createdAt  : string
        Subscriptions?: Subscription[]
    }

    interface Inspection {
        enabled: boolean
        match  : string[]
        context: InspectionContext
    }

    interface InspectionContext {
        selectedAnnotationIndex: number
        selectedPlotLineId     : string
        selectedPlotLineAxis   : "x" | "y" | ""
        selectedSeriesId       : string
    }

    type DenominatorType = "global" | "count" | "local" | ""

    namespace ServerResponses {
        
        type DataResponseRow = [string, number] | [string, number, number, number]

        interface UnStratifiedDataResponse {
            column: string
            stratifier?: string
            filters: string[]
            totalCount: number
            rowCount: number
            data: [{
                rows: DataResponseRow[]
            }]
        }

        interface StratifiedDataResponse extends UnStratifiedDataResponse {
            stratifier: string
            counts: Record<string, number>
            data: ({
                stratifier: string
                rows: DataResponseRow[]
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

    interface DashboardProps {
        /**
         * The view object that we are editing. If this is an empty object
         * or a partial which does not have an `id` property, then the
         * dashboard is in "create mode"
         */
        view: Partial<View>
    
        /**
         * The subscription that this view is (or is going to be)
         * assigned to.
         */
        subscription: Subscription,
        
        copy?: boolean
    }
    
    interface DashboardState {
        graph            : Partial<View>
        viewType         : "overview" | "data"
        showOptions      : boolean
        chartOptions     : Partial<Highcharts.Options>
        data            ?: Record<string, JSONScalar>[] | null
        loadingData     ?: boolean
        loadingDataError?: Error | string | null
        subscription     : Subscription
        xAxisColumn     ?: string | null
        saving          ?: boolean
        savingError     ?: Error | string | null
        inspection      ?: Inspection
        visualOverrides  : VisualOverridesState
    }
    
    type ToggleOptionsAction   = { type: "TOGGLE_OPTIONS" }
    type SetViewTypeAction     = { type: "SET_VIEW_TYPE"    , payload: DashboardState["viewType"]  }
    type MergeAction           = { type: "MERGE"            , payload: Partial<DashboardState>     }
    type SetChartOptionsAction = { type: "SET_CHART_OPTIONS", payload: Partial<Highcharts.Options> }
    type SetXAxisAction        = { type: "SET_X_AXIS"       , payload: string                      }
    
    type ViewAction = ToggleOptionsAction | SetViewTypeAction | MergeAction | SetChartOptionsAction | SetXAxisAction
}