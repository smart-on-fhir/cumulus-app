import { useCallback, useReducer } from "react";
import html2canvas                 from "html2canvas";
import { useNavigate, useParams }  from "react-router-dom";
import { HelmetProvider, Helmet }  from "react-helmet-async";
import PowerSet                    from "../../PowerSet";
import { useBackend }              from "../../hooks";
import { views, requests }         from "../../backend"
import { useAuth }                 from "../../auth";
import DataRequestLink             from "../DataRequests/DataRequestLink";
import DataGrid                    from "../DataGrid";
import Breadcrumbs                 from "../Breadcrumbs";
import ColumnSelector              from "./ColumnSelector";
import FilterUI                    from "./FilterUI";
import BarChart                    from "./Charts/BarChart";
import ColumnChart                 from "./Charts/ColumnChart";
import AreaSPLineChart             from "./Charts/AreaSPLineChart";
import SPLineChart                 from "./Charts/SPLineChart";
import PieChart                    from "./Charts/PieChart";
import Alert, { AlertError }       from "../Alert";
import Select                      from "../Select";
import Loader                      from "../Loader";
import { classList }               from "../../utils";
import {
    ChartIcons,
    operators,
    SingleDimensionChartTypes,
    SupportedChartTypes
} from "./config";
import "./Dashboard.scss";




type SupportedChartType = keyof typeof SupportedChartTypes

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
                        <Select
                            value={ state.chartType }
                            onChange={ chartType => onChange({ ...state, chartType })}
                            options={Object.keys(SupportedChartTypes).map((type, i) => ({
                                value: type,
                                label: SupportedChartTypes[type as SupportedChartType],
                                icon: ChartIcons[type as keyof typeof ChartIcons]
                            }))}
                        />
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
                                    onChange={(groupBy: string) => onChange({ ...state, groupBy })}
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
                                        <Select
                                            right
                                            placeholder="Select Column"
                                            value={ state.stratifyBy }
                                            onChange={(stratifyBy: string) => onChange({ ...state, stratifyBy })}
                                            options={[
                                                { value: "", label: "NONE", icon: "fas fa-close color-red" },
                                                ...dataRequest.data.cols.map(col => ({
                                                    value   : col.name,
                                                    label   : col.label || col.name,
                                                    disabled: col.name === "cnt" || col.name === state.groupBy,
                                                    icon    : "/icons/column.png",
                                                    right   : <span className={ col.dataType + " color-muted small right" }> {col.dataType}</span>
                                                }))
                                            ]}
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

    if (loading) return <Loader/>
    if (error) return <AlertError>{`Error fetching view with id "${id}": ${error}`}</AlertError>

    if (!result) {
        return <AlertError>{`Error fetching request with id "${id}": ${error}`}</AlertError>
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
    gridType       : string
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
        const nextState = {
            ...state,
            ...action.payload
        };
        if (nextState.chartType.startsWith("pie") || nextState.chartType.startsWith("donut")) {
            nextState.viewGroupBy = ""
        }
        return checkDirty(nextState);
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
        gridType       : "chart",
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
        isDirty,
        gridType
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
        
        if (!isAdmin) {
            return alert("You don't have permission to save views")
        }

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
    filters.forEach(({ left, operator, negated, right }) => {

        // Skip filters for which left column is not selected in the UI
        if (!left) return;

        // Skip filters for which the right column or value is not set in the UI
        if (operator !== "isNull" && right.value === undefined) return;

        const fn = operators.find(x => x.id === operator)?.fn || (() => true) as any;

        const filterFn = (row: any) => {
            const l = row[left];
            const r = right.type === "column" ? row[right.value + ""] : right.value;
            if (operator !== "isNull" && l === null) return false;
            if (operator === "isNull" && negated && l !== null) return true;
            let result = !!fn(l, r);
            if (negated) return !result;
            return result
        };

        powerSet = powerSet.filter(filterFn)

    })

    // M 583
    // F 568 (+31)
    // - 1151 (+39)
    const chartPowerSet = powerSet.getChartData({
        column : viewColumn,
        groupBy: col2?.name,
        filters
    })
    // console.log("getChartData ==>", powerSet)
    
    return (
        <div className={ saving || deleting ? "grey-out" : undefined }>
            <HelmetProvider>
                <Helmet>
                    <title>{viewName}</title>
                    {viewDescription && <meta name="description" content="Helmet application" />}
                </Helmet>
            </HelmetProvider>
            <h2>{viewName}</h2>
            <div className="color-muted mb-1">{viewDescription}</div>
            <div className="row mb-1 half-gap">
                <div className="col col-5">
                    <div className="toolbar flex">
                        <button
                            className={"btn" + (viewType === "overview" ? " active" : "")}
                            onClick={() => dispatch({ type: "SET_VIEW_TYPE", payload: "overview" })}
                            title="Report View"
                            >
                            <i className="fas fa-chart-pie" /> Overview
                        </button>
                        <button
                            className={"btn" + (viewType === "data"     ? " active" : "")}
                            onClick={() => dispatch({ type: "SET_VIEW_TYPE", payload: "data"})}
                            title="Data View"
                            ><i className="fas fa-th" /> Data</button>
                    </div>
                </div>
                <div className="col"></div>
                <div className="col col-4 right">
                    <div className="toolbar flex">
                        { showOptions && (
                            <button
                                className="btn color-green"
                                onClick={save}
                                disabled={ !!view.id && !isDirty }
                                title="Save Changes">
                                <i className={ saving ? "fas fa-circle-notch fa-spin" : "fas fa-save" } /> Save
                            </button>
                        )}
                        { showOptions && isAdmin && view.id && (
                            <button
                                className="btn color-red"
                                onClick={ destroy }
                                title="Delete this View">
                                <i className={ deleting ? "fas fa-circle-notch fa-spin" : "fas fa-trash-alt" } /> Delete
                            </button>
                        )}
                        <button
                            className={ "btn" + (showOptions ? " active" : "")}
                            onClick={() => dispatch({ type: "TOGGLE_OPTIONS" })}
                            title="Options"
                            ><i className="fas fa-cog" /></button>
                    </div>
                </div>
            </div>
            { showOptions && <ConfigPanel
                dataRequest={dataRequest}
                viewType={viewType}
                state={{
                    groupBy: viewColumn,
                    stratifyBy: col2?.name || "",
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

            { viewType === "data" && <>
                { gridType === "full" && filters.length > 0 && (
                    <Alert className="small mt-1 mb-1" color="orange" icon="fa-solid fa-circle-info">
                        Filters are not applied to the data grid when it is in "Full Data" mode.
                        To view them <button
                        className="small link"
                        onClick={() => dispatch({ type: "UPDATE", payload: {gridType: "chart" }})}
                        >switch to Chart Data mode</button>. 
                    </Alert>
                ) }
                <DataGrid
                    // cols={ chartPowerSet.cols }
                    // rows={ chartPowerSet.rows }
                    cols={ gridType === "chart" ? chartPowerSet.cols : dataRequest.data.cols }
                    rows={ gridType === "chart" ? chartPowerSet.rows : dataRequest.data.rows }
                    offset={0}
                    limit={20}
                    key={gridType}
                    colClassName={col => {
                        // col.name === "cnt" || col.name === "queryid" ? "private" : undefined
                        if (
                            col.name === "cnt" ||
                            (col.name === viewColumn || (col2 && col.name === col2.name)) ||
                            (filters && filters.find(f => f.left === col.name))
                            // chartPowerSet.getColumnByName(col.name) &&
                            // value !== null
                            // col.name
                        ) {
                            return "bg-blue"
                        }
                    }}
                />
                <div className="tab-panel bottom">
                    <button
                        className={ classList({ "small tab": true, active: gridType === "chart" }) }
                        onClick={() => dispatch({ type: "UPDATE", payload: {gridType: "chart" }})}
                    >Chart Data</button>
                    <button
                        className={ classList({ "small tab": true, active: gridType === "full" }) }
                        onClick={() => dispatch({ type: "UPDATE", payload: {gridType: "full" }})}
                    >Full Data</button>
                </div>
            </>}
            
            { !col1 && viewType === "overview" && (
                <AlertError>
                    It looks like the data source has been updated and this view is no longer compatible with the new data.
                    Please create the view again.
                </AlertError>
            ) }
            { col1 && viewType === "overview" && chartType === "pie"           && <PieChart        column={ col1 } dataSet={ chartPowerSet } /> }
            { col1 && viewType === "overview" && chartType === "pie3d"         && <PieChart        column={ col1 } dataSet={ chartPowerSet } use3d /> }
            { col1 && viewType === "overview" && chartType === "donut"         && <PieChart        column={ col1 } dataSet={ chartPowerSet } donut /> }
            { col1 && viewType === "overview" && chartType === "donut3d"       && <PieChart        column={ col1 } dataSet={ chartPowerSet } donut use3d /> }
            
            { col1 && viewType === "overview" && chartType === "spline"        && <SPLineChart     column={ col1 } dataSet={ chartPowerSet } groupBy={ col2 } /> }
            { col1 && viewType === "overview" && chartType === "areaspline"    && <AreaSPLineChart column={ col1 } dataSet={ chartPowerSet } groupBy={ col2 } /> }

            { col1 && viewType === "overview" && chartType === "column"        && <ColumnChart     column={ col1 } dataSet={ chartPowerSet } groupBy={ col2 } /> }
            { col1 && viewType === "overview" && chartType === "column3d"      && <ColumnChart     column={ col1 } dataSet={ chartPowerSet } groupBy={ col2 } use3d /> }
            { col1 && viewType === "overview" && chartType === "columnStack"   && <ColumnChart     column={ col1 } dataSet={ chartPowerSet } groupBy={ col2 } stack /> }
            { col1 && viewType === "overview" && chartType === "columnStack3d" && <ColumnChart     column={ col1 } dataSet={ chartPowerSet } groupBy={ col2 } stack use3d /> }

            { col1 && viewType === "overview" && chartType === "bar"           && <BarChart        column={ col1 } dataSet={ chartPowerSet } groupBy={ col2 } /> }
            { col1 && viewType === "overview" && chartType === "bar3d"         && <BarChart        column={ col1 } dataSet={ chartPowerSet } groupBy={ col2 } use3d /> }
            { col1 && viewType === "overview" && chartType === "barStack"      && <BarChart        column={ col1 } dataSet={ chartPowerSet } groupBy={ col2 } stack /> }
            { col1 && viewType === "overview" && chartType === "barStack3d"    && <BarChart        column={ col1 } dataSet={ chartPowerSet } groupBy={ col2 } stack use3d /> }
        
            <br/>
            <br/>
            <h5>SOURCE DATA { dataRequest.refresh ? "SUBSCRIPTION" : "REFRESH" }</h5>
            <DataRequestLink request={ dataRequest } />
            <br/>
            <button className="btn btn-blue mt-1 mb-2 grey-out"> <b> Request Data </b> </button>
        </div>
    )
}

