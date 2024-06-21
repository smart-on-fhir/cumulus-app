import { JSONScalar, app } from "../../types"

interface DashboardProps {
    /**
     * The view object that we are editing. If this is an empty object
     * or a partial which does not have an `id` property, then the
     * dashboard is in "create mode"
     */
    view: Partial<app.View>

    /**
     * The subscription that this view is (or is going to be)
     * assigned to.
     */
    dataRequest: app.DataRequest,
    
    copy?: boolean
}

export interface DashboardState {
    graph            : Partial<app.View>
    viewType         : "overview" | "data"
    showOptions      : boolean
    chartOptions     : Partial<Highcharts.Options>
    data            ?: Record<string, JSONScalar>[] | null
    loadingData     ?: boolean
    loadingDataError?: Error | string | null
    subscription     : app.DataRequest
    xAxisColumn     ?: string | null
    saving          ?: boolean
    savingError     ?: Error | string | null
    inspection      ?: app.Inspection
    visualOverrides  : app.VisualOverridesState
}

export type ToggleOptionsAction   = { type: "TOGGLE_OPTIONS" }
export type SetViewTypeAction     = { type: "SET_VIEW_TYPE"    , payload: DashboardState["viewType"]  }
export type MergeAction           = { type: "MERGE"            , payload: Partial<DashboardState>     }
export type SetChartOptionsAction = { type: "SET_CHART_OPTIONS", payload: Partial<Highcharts.Options> }
export type SetXAxisAction        = { type: "SET_X_AXIS"       , payload: string                      }

export type ViewAction = ToggleOptionsAction |
                         SetViewTypeAction |
                         MergeAction |
                         SetChartOptionsAction |
                         SetXAxisAction