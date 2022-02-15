import { ChangeEvent, useCallback, useReducer } from "react";
import html2canvas                              from "html2canvas";
import { useNavigate, useParams }               from "react-router-dom";
import PowerSet                                 from "../../PowerSet";
import { useBackend }                           from "../../hooks";
import { views, requests }                      from "../../backend"
import { useAuth }                              from "../../auth";
import DataRequestLink                          from "../DataRequests/DataRequestLink";
import DataGrid                                 from "../DataGrid";
import Breadcrumbs                              from "../Breadcrumbs";
import ColumnSelector                           from "./ColumnSelector";
import FilterUI                                 from "./FilterUI";
import BarChart                                 from "./Charts/BarChart";
import ColumnChart                              from "./Charts/ColumnChart";
import AreaSPLineChart                          from "./Charts/AreaSPLineChart";
import SPLineChart                              from "./Charts/SPLineChart";
import PieChart                                 from "./Charts/PieChart";

import "./Dashboard.scss";



const SupportedChartTypes = {
    pie         : "Pie Chart",
    pie3d       : "Pie Chart 3D",
    donut       : "Donut Chart",
    donut3d     : "Donut Chart 3D",
    
    spline      : "Line Chart",
    areaspline  : "Area Chart",
    
    column      : "Column Chart",
    column3d    : "Column Chart 3D",
    
    bar         : "Bar Chart",
    bar3d       : "Bar Chart 3D"
}

type SupportedChartType = keyof typeof SupportedChartTypes
const SingleDimensionChartTypes: SupportedChartType[] = ["pie", "pie3d", "donut", "donut3d"]

interface ChartConfigPanelState {
    groupBy        : string
    stratifyBy     : string
    sortBy         : string
    filters        : any[]
    chartType      : SupportedChartType
    viewName       : string
    viewDescription: string
} 

function ConfigPanel({
    dataRequest,
    state,
    onChange,
    viewType
} : {
    dataRequest: app.DataRequest
    state: ChartConfigPanelState
    viewType: "overview" | "data"
    onChange: (state: ChartConfigPanelState) => void
}) {
    let auth = useAuth();
    return (
        <div>
            { viewType === "overview" && (<>
                <hr />
                { auth.user?.role === "admin" && (
                    <div className="row half-gap">
                        <div className="col">
                            <label>Title</label>
                            <input type="text" value={state.viewName} onChange={ e => onChange({ ...state, viewName: e.target.value })} required />
                        </div>
                    </div>
                )}
                { auth.user?.role === "admin" && (
                    <div className="row half-gap">
                        <div className="col">
                            <label>Short Description</label>
                            <textarea rows={2} value={state.viewDescription} onChange={ e => onChange({ ...state, viewDescription: e.target.value })}></textarea>
                        </div>
                    </div>
                )}
                <div className="row half-gap">
                    <div className="col col-3">
                        <label>Chart Type</label>
                        <select value={ state.chartType } onChange={ e => onChange({ ...state, chartType: e.target.value as SupportedChartType })}>
                        { Object.keys(SupportedChartTypes).map((type, i) => (
                            <option key={i} value={type}>{SupportedChartTypes[type as SupportedChartType]}</option>
                        )) }
                        </select>
                    </div>
                    <div className="col nowrap">
                        <div className="row nowrap">
                            <div className="col">
                                <label>Visualize&nbsp;Column</label>
                                <ColumnSelector
                                    cols={ dataRequest.data.cols }
                                    value={ state.groupBy }
                                    filter={col => {
                                        if (col.name === "cnt") return false
                                        if (SingleDimensionChartTypes.includes(state.chartType)) {
                                            return true
                                        }
                                        return col.name !== state.stratifyBy
                                    } }
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                        state.groupBy = e.target.value
                                        onChange(state)
                                    }}
                                />
                            </div>
                            { 
                                !SingleDimensionChartTypes.includes(state.chartType) && (
                                <>
                                    <div className="col bottom col-0">
                                        <button
                                            className="btn"
                                            disabled={!state.stratifyBy}
                                            onClick={() => {
                                                onChange({
                                                    ...state,
                                                    groupBy: state.stratifyBy,
                                                    stratifyBy: state.groupBy
                                                })
                                            }}
                                            style={{ margin: "0 2px" }}
                                        >
                                            <i className="fas fa-exchange-alt"></i>
                                        </button>
                                    </div>
                                    <div className="col">
                                        <label>Group&nbsp;By</label>
                                        <ColumnSelector
                                            addEmptyOption="start"
                                            cols={ dataRequest.data.cols }
                                            value={ state.stratifyBy }
                                            filter={col => {
                                                if (col.name === "cnt") return false
                                                if (SingleDimensionChartTypes.includes(state.chartType)) {
                                                    return true
                                                }
                                                return col.name !== state.groupBy
                                            }}
                                            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                                state.stratifyBy = e.target.value
                                                onChange(state)
                                            }}
                                        />
                                    </div>
                                </>
                            ) }
                        </div>
                    </div>
                </div>
            </>)}
            <FilterUI
                onChange={filters => onChange({ ...state, filters })}
                current={ state.filters }
                cols={ dataRequest.data.cols }
            />
        </div>
    )
}

export function CreateView()
{
    const { id } = useParams();

    const { loading, error, result } = useBackend(
        useCallback(() => requests.getOne(id + ""), [id]),
        true
    );

    if (loading) {
        return <div>Loading Request...</div>
    }

    if (error) {
        return <pre>{`Error fetching request with id "${id}": ${error}`}</pre>
    }

    if (!result) {
        return <pre>{`Error fetching request with id "${id}": ${error}`}</pre>
    }

    return (
        <>
            <Breadcrumbs links={[
                { name: "Home" , href: "/" },
                { name: "Create New View" }
            ]}/>
            {/* <pre>{JSON.stringify(result, null, 4)}</pre> */}
            {/* <pre>{JSON.stringify(requestData, null, 4)}</pre> */}
            <Dashboard view={{}} dataRequest={result as app.DataRequest} />
        </>
    )
}

export default function ViewWrapper()
{
    const { id } = useParams()

    // console.log("ID:", id)

    // if (id === "new") {
    //     return <Dashboard view={{
    //         dataSourceId: "",
    //         description: "",
    //         id: "",
    //         name: "",
    //         settings: undefined
    //     }} dataRequest={{
    //         completed: null,
    //         created: "",
    //         data: { cols: [], rows: []},
    //         id: "",
    //         name: "",
    //         status: "pending",
    //         type: "REQUEST"
    //     }} />
    // }

    const { loading, error, result } = useBackend(
        useCallback(() => views.getOne(id + "", true), [id]),
        true
    );

    if (loading) return <div>Loading...</div>
    if (error) return <pre>{`Error fetching view with id "${id}": ${error}`}</pre>

    if (!result) {
        return <pre>{`Error fetching request with id "${id}": ${error}`}</pre>
    }

    // const { status, viewData, requestData, error } = useDataLoader(id + "");

    // if (status === "pending") return <div>Loading...</div>
    // if (status === "error") return <pre>{JSON.stringify(error, null, 4)}</pre>
    if (!result) {
        return <b>Failed to fetch data!</b>
    }

    return (
        <>
            <Breadcrumbs links={[
                { name: "Home" , href: "/" },
                { name: result.view.name }
            ]}/>
            {/* <pre>{JSON.stringify(viewData, null, 4)}</pre> */}
            {/* <pre>{JSON.stringify(requestData, null, 4)}</pre> */}
            <Dashboard view={ result.view } dataRequest={result.request} />
        </>
    )
}

// =============================================================================
interface ViewState
{
    viewType       : "overview" | "data",
    showOptions    : boolean
    viewName       : string
    viewDescription: string
    viewColumn     : string
    viewGroupBy    : string
    filters        : app.Filter[]
    chartType      : string
    isDirty        : boolean
    cleanState    ?: ViewState
}

interface ViewAction
{
    type: string
    payload?: any
}

function initViewState(initialState: ViewState): ViewState
{
    return { ...initialState, cleanState: { ...initialState } }
}

function viewReducer(state: ViewState, action: ViewAction): ViewState
{
    const preservable: (keyof ViewState)[] = [
        "viewName",
        "viewDescription",
        "viewGroupBy",
        "viewColumn",
        "chartType",
        "filters"
    ];

    function checkDirty(nextState: ViewState) {
        nextState.isDirty = preservable.some(key => (
            JSON.stringify(nextState[key]) !== JSON.stringify(state.cleanState?.[key])
        ));
        return nextState
    }

    if (action.type === "SET_VIEW_TYPE") {
        return {
            ...state,
            viewType: action.payload
        };
    }

    if (action.type === "TOGGLE_OPTIONS") {
        return {
            ...state,
            showOptions: !state.showOptions
        };
    }

    if (action.type === "UPDATE") {
        return checkDirty({
            ...state,
            ...action.payload
        });
    }

    if (action.type === "CLEAN") {
        return {
            ...state,
            cleanState: { ...state },
            isDirty: false
        };
    }

    return state
}
// =============================================================================

export function Dashboard({
    view,
    dataRequest
}: {
    view: Partial<app.View>
    dataRequest: app.DataRequest
}) {

    const {
        viewType: serverViewType = "column",
        column = dataRequest.data.cols[0].name,
        groupBy: serverGroupBy = "",
        filters: serverFilters = []
    } = view.settings || {}

    const navigate = useNavigate();
    const auth     = useAuth();
    
    const [ state, dispatch ] = useReducer(viewReducer, {
        viewType       : "overview",
        showOptions    : !view.id,
        viewName       : view.name || "",
        viewDescription: view.description || "",
        chartType      : serverViewType,
        viewColumn     : column,
        viewGroupBy    : serverGroupBy,
        filters        : serverFilters,
        isDirty        : false
    } as ViewState, initViewState);

    const {
        viewType,
        showOptions,
        viewName,
        viewDescription,
        chartType,
        viewColumn,
        viewGroupBy,
        filters,
        isDirty
    } = state;

    const isAdmin = auth.user?.role === "admin"

    async function getScreenShot()
    {
        const el = document.querySelector("#chart .highcharts-container") as HTMLElement;
        const canvas: any = await html2canvas(el, {
            scale: 1,
            ignoreElements: el => el.classList.contains("highcharts-exporting-group"),
            logging: false
        });
        return canvas.toDataURL();
    }

    const { execute: save, loading: saving } = useBackend(async () => {
        
        const screenShot = viewType === "overview" ?
            await getScreenShot() :
            undefined;

        // Update
        if (view.id) {
            await views.update(view.id, {
                ...view,
                name: viewName,
                description: viewDescription,
                screenShot,
                settings: {
                    ...view.settings,
                    groupBy: viewGroupBy,
                    column : viewColumn,
                    filters,
                    viewType: chartType
                }
            }).then(
                () => dispatch({ type: "CLEAN" }),
                e  => alert(e.message)
            );
        }

        // Create
        else {
            await views.create({
                ...view,
                name: viewName,
                description: viewDescription,
                dataSourceId: dataRequest.id,
                screenShot,
                settings: {
                    ...view.settings,
                    groupBy: viewGroupBy,
                    column : viewColumn,
                    filters,
                    viewType: chartType
                }
            }).then(
                v => navigate("/views/" + v.id),
                e => alert(e.message)
            );
        }
    })

    const { execute: destroy, loading: deleting } = useBackend(() => {
        if (window.confirm("Yre you sure you want to delete this view?")) {
            return views.delete(view.id + "").then(() => navigate("/"))
        }
        return Promise.resolve()
    })


    let powerSet = PowerSet.from(dataRequest.data)

    const col1 = dataRequest.data.cols.find(col => col.name === viewColumn) as app.DataRequestDataColumn
    const col2 = viewGroupBy ? dataRequest.data.cols.find(col => col.name === viewGroupBy) as app.DataRequestDataColumn : null

    

    // FILTERS
    // -------------------------------------------------------------------------
    filters.forEach(({ left, operator, right }) => {

        // Skip filters that are not yet fully configured in the UI
        if (
            !left ||
            (right.type === "column" && !right.value) ||
            (right.type === "date" && !right.value) ||
            (right.type === "number" && !right.value)
        ) { 
            return
        }

        function createFilter() {
            if (right.type === "column") {
                // eslint-disable-next-line
                return new Function(
                    'col',
                    `return col["${left}"] ${operator} col["${right.value}"]`
                )
            }
            if (right.type === "string") {
                // eslint-disable-next-line
                return new Function(
                    'col',
                    `return col["${left}"] ${operator} ${JSON.stringify(right.value)}`
                )
            }
            if (right.type === "number") {
                // eslint-disable-next-line
                return new Function(
                    'col',
                    // @ts-ignore
                    `return col["${left}"] ${operator} ${+right.value}`
                )
            }
            if (right.type === "date") {
                // eslint-disable-next-line
                return new Function(
                    'col',
                    // @ts-ignore
                    `return col["${left}"] ${operator} new Date("${right.value}")`
                )
            }
            if (right.type === "null" || right.type === "true" || right.type ===  "false") {
                // eslint-disable-next-line
                return new Function('col', `return col["${left}"] ${operator} ${right.type}`)
            }

            throw new Error(`Unsupported right type of filer condition "${right.type}"`)
        }

        // @ts-ignore
        powerSet = powerSet.filter(createFilter())
        
    })
    
    return (
        <div className={ saving || deleting ? "grey-out" : undefined }>
            <h2>{viewName}</h2>
            <div className="color-muted mb-1">{viewDescription}</div>
            <div className="row mb-1">
                <div className="col col-6">
                    <div className="row">
                        <div className="toolbar">
                            <button className={"btn" + (viewType === "overview" ? " active" : "")} onClick={() => dispatch({ type: "SET_VIEW_TYPE", payload: "overview" })}><i className="fas fa-chart-line" /> Overview</button>
                            <button className={"btn" + (viewType === "data"     ? " active" : "")} onClick={() => dispatch({ type: "SET_VIEW_TYPE", payload: "data"     })}><i className="fas fa-th" /> Data</button>
                        </div>
                    </div>
                </div>
                <div className="col col-4 right">
                    <div className="row">
                        <div className="toolbar">
                            { showOptions && (
                                <button className="btn color-green" onClick={save} disabled={ !isDirty }>
                                    <i className={ saving ? "fas fa-circle-notch fa-spin" : "fas fa-save" } /> Save
                                </button>
                            )}
                            { showOptions && isAdmin && view.id && (
                                <button className="btn color-red" onClick={ destroy }>
                                    <i className={ deleting ? "fas fa-circle-notch fa-spin" : "fas fa-trash-alt" } /> Delete
                                </button>
                            )}
                            <button className={ "btn" + (showOptions ? " active" : "")} onClick={() => dispatch({ type: "TOGGLE_OPTIONS" })}><i className="fas fa-cog" /></button>
                        </div>
                    </div>
                </div>
            </div>
            { showOptions && <ConfigPanel
                dataRequest={dataRequest}
                viewType={viewType}
                state={{
                    groupBy: viewColumn,
                    stratifyBy: viewGroupBy,
                    filters: [...filters],

                    // @ts-ignore
                    chartType,
                    viewName,
                    viewDescription
                }}
                onChange={state => {
                    dispatch({ type: "UPDATE", payload: {
                        viewName       : state.viewName,
                        viewDescription: state.viewDescription,
                        chartType      : state.chartType,
                        viewColumn     : state.groupBy,
                        viewGroupBy    : state.stratifyBy,
                        filters        : [...state.filters]
                    }});
                }}
            /> }

            { viewType === "data" && <DataGrid cols={ powerSet.cols } rows={ powerSet.rows } offset={0} limit={20} /> }
            
            { viewType === "overview" && chartType === "pie"        && <PieChart        column={ col1 } dataSet={ powerSet } /> }
            { viewType === "overview" && chartType === "pie3d"      && <PieChart        column={ col1 } dataSet={ powerSet } use3d /> }
            { viewType === "overview" && chartType === "donut"      && <PieChart        column={ col1 } dataSet={ powerSet } donut /> }
            { viewType === "overview" && chartType === "donut3d"    && <PieChart        column={ col1 } dataSet={ powerSet } donut use3d /> }
            
            { viewType === "overview" && chartType === "spline"     && <SPLineChart     column={ col1 } dataSet={ powerSet } groupBy={ col2 } /> }
            { viewType === "overview" && chartType === "areaspline" && <AreaSPLineChart column={ col1 } dataSet={ powerSet } groupBy={ col2 } /> }

            { viewType === "overview" && chartType === "column"     && <ColumnChart     column={ col1 } dataSet={ powerSet } groupBy={ col2 } /> }
            { viewType === "overview" && chartType === "column3d"   && <ColumnChart     column={ col1 } dataSet={ powerSet } groupBy={ col2 } use3d /> }

            { viewType === "overview" && chartType === "bar"        && <BarChart        column={ col1 } dataSet={ powerSet } groupBy={ col2 } /> }
            { viewType === "overview" && chartType === "bar3d"      && <BarChart        column={ col1 } dataSet={ powerSet } groupBy={ col2 } use3d /> }
        
            <br/>
            <h5>SOURCE DATA { dataRequest.refresh ? "SUBSCRIPTION" : "REFRESH" }</h5>
            <DataRequestLink request={ dataRequest } />
            <br/>
            <button className="btn btn-blue mt-1 mb-2 grey-out"> <b> Request Data </b> </button>
        </div>
    )
}

