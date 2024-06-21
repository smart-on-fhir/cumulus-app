import { useAuth }    from "../../auth"
import CommandButton  from "../../commands/CommandButton"
import { app }        from "../../types"
import { requestPermission } from "../../utils"
import { DashboardState, ViewAction } from "../Dashboard2/types"
import { SaveChartButton } from "./SaveChartButton"

export function GraphToolbar({
    state,
    dispatch,
    graph,
    save,
    saving,
    copyCommand,
    shareCommand,
    deleteCommand
}: {
    state: Pick<DashboardState, "inspection"|"viewType"|"showOptions">
    dispatch: (action: ViewAction) => void
    graph: Partial<app.View>
    save: () => Promise<void>
    saving: boolean
    copyCommand: any
    shareCommand: any
    deleteCommand: any
}) {
    const auth = useAuth()

    const isOwner = graph.creatorId && graph.creatorId === auth.user!.id
    const canSave = isOwner || requestPermission({
        user    : auth.user,
        resource: "Graphs",
        action  : graph.id ? "update" : "create"
    })

    return (
        <div className="row wrap">
            <div className="col col-0 mb-1">
                <div className="toolbar flex">
                    <button
                        className={ "btn" + (state.showOptions ? " active" : "")}
                        onClick={() => dispatch({ type: "TOGGLE_OPTIONS" })}
                        data-tooltip={state.showOptions ? "Hide Options" : "Show Options"}>
                        <i className="fas fa-cog" />
                    </button>
                    { state.inspection && <button
                        className={ "btn" + (state.inspection.enabled ? " active" : "") }
                        data-tooltip="Inspect elements by click"
                        onClick={() => dispatch({
                            type: "MERGE",
                            payload: {
                                inspection: {
                                    // match: [],
                                    // context: {},
                                    ...state.inspection!,
                                    enabled: !state.inspection!.enabled,
                                    // match  : [],
                                    // context: {}
                                }
                            } 
                        })}>
                        <i className="fa-solid fa-crosshairs"/>
                    </button> }
                    <CommandButton { ...copyCommand } label={ "" } />
                    <CommandButton { ...shareCommand } label={ "" } />
                    <CommandButton { ...deleteCommand } label={ "" } />
                    { canSave && <SaveChartButton graph={graph} saving={saving} save={save} /> }
                </div>
            </div>
            <div className="col mb-1" />
            <div className="col col-0 mb-1">
                <ViewTypeSelector value={state.viewType} onChange={payload => dispatch({ type: "SET_VIEW_TYPE", payload })} />
            </div>
        </div>
    )
}

export function ViewTypeSelector({ value, onChange }: { value: DashboardState["viewType"]; onChange: (value: DashboardState["viewType"]) => void }) {
    return (
        <div className="toolbar flex">
            <button
                className={"btn" + (value === "overview" ? " active" : "")}
                onClick={() => onChange("overview")}
                data-tooltip="Show the Chart"
                style={{ minWidth: "7em" }}
                >
                <i className="fas fa-chart-pie" /> Overview
            </button>
            <button
                className={"btn" + (value === "data"     ? " active" : "")}
                onClick={() => onChange("data")}
                data-tooltip="Show the Input Data"
                style={{ minWidth: "7em" }}
                ><i className="fas fa-th" /> Data
            </button>
        </div>
    )
}