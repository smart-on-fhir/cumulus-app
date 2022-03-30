import { useMemo, useReducer }     from "react";
import html2canvas                 from "html2canvas";
import { useNavigate }             from "react-router-dom";
import { HelmetProvider, Helmet }  from "react-helmet-async";
import Highcharts                  from "highcharts";
import PowerSet                    from "../../PowerSet";
import { useBackend }              from "../../hooks";
import { createOne, updateOne, deleteOne } from "../../backend";
import { useAuth }                 from "../../auth";
import DataRequestLink             from "../DataRequests/DataRequestLink";
import DataGrid                    from "../DataGrid";
import BarChart                    from "./Charts/BarChart";
import ColumnChart                 from "./Charts/ColumnChart";
import AreaSPLineChart             from "./Charts/AreaSPLineChart";
import SPLineChart                 from "./Charts/SPLineChart";
import PieChart                    from "./Charts/PieChart";
import Alert, { AlertError }       from "../Alert";
import { classList, defer }        from "../../utils";
import ConfigPanel                 from "./ConfigPanel"
import { operators }               from "./config";

import "./Dashboard.scss";






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
    chartOptions   : Partial<Highcharts.Options>
    colorOptions   : app.ColorOptions
    denominator    : string
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
        "filters",
        "chartOptions",
        "colorOptions",
        "denominator"
    ];

    function checkDirty(nextState: ViewState) {
        nextState.isDirty = preservable.some(key => (
            JSON.stringify(nextState[key]) !== JSON.stringify(state.cleanState?.[key])
        ));
        return nextState
    }

    if (action.type === "SET_CHART_OPTIONS") {
        return {
            ...state,
            chartOptions: Highcharts.merge(state.chartOptions, action.payload)
        };
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
        const nextState = Highcharts.merge(state, action.payload);
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

export default function Dashboard({
    view,
    dataRequest
}: {
    view: Partial<app.View>
    dataRequest: app.DataRequest
}) {
    const {
        viewType: serverViewType = "column",
        column = dataRequest.data.cols[0].name === "cnt" ? dataRequest.data.cols[1].name : dataRequest.data.cols[0].name,
        groupBy: serverGroupBy = "",
        filters: serverFilters = [],
        chartOptions: serverChartOptions = {},
        denominator: serverDenominator = "",
        colorOptions: serverColorOptions = {
            saturation: 75,
            brightness: 60,
            variety   : 1,
            opacity   : 1,
            startColor: 0
        }
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
        chartOptions   : serverChartOptions,
        colorOptions   : serverColorOptions,
        denominator    : serverDenominator,
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
        gridType,
        chartOptions,
        colorOptions,
        denominator
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
            await updateOne("views", view.id, {
                ...view,
                name: viewName,
                description: viewDescription,
                screenShot,
                settings: {
                    ...view.settings,
                    groupBy: viewGroupBy,
                    column : viewColumn,
                    filters,
                    viewType: chartType,
                    chartOptions,
                    colorOptions,
                    denominator
                }
            }).then(
                () => dispatch({ type: "CLEAN" }),
                e  => alert(e.message)
            );
        }

        // Create
        else {
            await createOne("views", {
                ...view,
                name: viewName,
                description: viewDescription,
                DataRequestId: dataRequest.id,
                screenShot,
                settings: {
                    ...view.settings,
                    groupBy: viewGroupBy,
                    column : viewColumn,
                    filters,
                    viewType: chartType,
                    chartOptions,
                    colorOptions,
                    denominator
                }
            }).then(
                v => defer(() => navigate("/views/" + v.id)),
                e => alert(e.message)
            );
        }
    })

    const { execute: destroy, loading: deleting } = useBackend(() => {
        if (window.confirm("Yre you sure you want to delete this view?")) {
            return deleteOne("views", view.id + "").then(() => navigate("/"))
        }
        return Promise.resolve()
    })


    

    const col1 = dataRequest.data.cols.find(col => col.name === viewColumn) as app.DataRequestDataColumn;
    const col2 = viewGroupBy ? dataRequest.data.cols.find(col => col.name === viewGroupBy) as app.DataRequestDataColumn : null;
    
    const groupBy = col2?.name;
    const filterList = filters.map(f => JSON.stringify(f)).join(",");

    let powerSet = useMemo(() => PowerSet.from(dataRequest.data), [dataRequest.data]);

    let { chartPowerSet } = useMemo(function() {

        // console.log("CREATE POWERSETS")

        let powerSet = PowerSet.from(dataRequest.data);

        // FILTERS
        // -------------------------------------------------------------------------
        // filters.forEach(({ left, operator, negated, right }) => {

        //     // Skip filters for which left column is not selected in the UI
        //     if (!left) return;

        //     // Skip filters for which the right column or value is not set in the UI
        //     if (operator !== "isNull" && right.value === undefined) return;

        //     const fn = operators.find(x => x.id === operator)?.fn || (() => true) as any;

        //     const filterFn = (row: any) => {
        //         const l = row[left];
        //         const r = right.type === "column" ? row[right.value + ""] : right.value;
        //         if (operator !== "isNull" && l === null) return false;
        //         if (operator === "isNull" && negated && l !== null) return true;
        //         let result = !!fn(l, r);
        //         if (negated) return !result;
        //         return result
        //     };

        //     powerSet = powerSet.filter(filterFn)
        // })

        // --------------------------------------------------------------------
        function createFilter(filter: app.Filter): false | ((row: any, index?: number) => boolean)
        {
            const { left, operator, negated, right } = filter;

            const fn = operators.find(x => x.id === operator)!.fn;

            return (row: any) => {
                const l = row[left];
                const r = right.type === "column" ? row[right.value + ""] : right.value;
                if (operator !== "isNull" && l === null) return false;
                if (operator === "isNull" && negated && l !== null) return true;
                let result = !!fn(l, r);
                if (negated) return !result;
                return result
            };
        }

        const usableFilters = filters.filter(f => {
            // Skip filters for which left column is not selected in the UI
            if (!f.left) return false;

            // Skip filters for which the right column or value is not set in the UI
            if (f.operator !== "isNull" && f.right.value === undefined) return false;

            return true;
        });

        if (usableFilters.length) {
            // @ts-ignore
            const filter = usableFilters.reduce((prev: (row: any) => boolean, cur: app.Filter) => {
                const next = createFilter(cur);
                if (!next) {
                    return prev;
                }
                return cur.join === "and" ?
                    (row: any) => prev(row) && next(row) :
                    (row: any) => prev(row) || next(row) ;
            }, createFilter(usableFilters[0])) as (row: any, index?: number) => boolean;

            powerSet = powerSet.filter(filter)
        }
        // --------------------------------------------------------------------

        const chartPowerSet = powerSet.getChartData({
            column : viewColumn,
            groupBy,
            filters: usableFilters
        });
        
        return { powerSet, chartPowerSet }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ powerSet, groupBy, viewColumn, filterList ]);
    
    // FILTERS
    // -------------------------------------------------------------------------
    // filters.forEach(({ left, operator, negated, right }) => {

    //     // Skip filters for which left column is not selected in the UI
    //     if (!left) return;

    //     // Skip filters for which the right column or value is not set in the UI
    //     if (operator !== "isNull" && right.value === undefined) return;

    //     const fn = operators.find(x => x.id === operator)?.fn || (() => true) as any;

    //     const filterFn = (row: any) => {
    //         const l = row[left];
    //         const r = right.type === "column" ? row[right.value + ""] : right.value;
    //         if (operator !== "isNull" && l === null) return false;
    //         if (operator === "isNull" && negated && l !== null) return true;
    //         let result = !!fn(l, r);
    //         if (negated) return !result;
    //         return result
    //     };

    //     powerSet = powerSet.filter(filterFn)

    // })
    

    const onTransitionEnd = () => {
        window.Highcharts.charts.forEach(c => c?.reflow())
    }

    
    
    return (
        <div className={ saving || deleting ? "grey-out" : undefined }>
            <HelmetProvider>
                <Helmet>
                    <title>{viewName}</title>
                    {viewDescription && <meta name="description" content="Helmet application" />}
                </Helmet>
            </HelmetProvider>
            <div className="row">
                <div className="col col-0">
                    <div onTransitionEnd={onTransitionEnd} style={{
                        position: "relative",
                        width   : showOptions ? 330 : 0,
                        // overflow: showOptions ? "auto" : "hidden",
                        opacity : showOptions ? 1 : 0,
                        pointerEvents: showOptions ? "all" : "none",
                        zIndex: showOptions ? 1 : -1,
                        transition: "all 0.2s ease-in-out"
                    }}>
                        <ConfigPanel
                            dataRequest={dataRequest}
                            viewType={viewType}
                            state={{
                                groupBy   : viewColumn,
                                stratifyBy: col2?.name || "",
                                filters   : [...filters],

                                // @ts-ignore
                                chartType,
                                viewName,
                                viewDescription,
                                chartOptions,
                                colorOptions,
                                denominator
                            }}
                            onChange={state => {
                                dispatch({ type: "UPDATE", payload: {
                                    viewName       : state.viewName,
                                    viewDescription: state.viewDescription,
                                    chartType      : state.chartType,
                                    viewColumn     : state.groupBy,
                                    viewGroupBy    : state.stratifyBy,
                                    filters        : [...state.filters],
                                    chartOptions   : state.chartOptions,
                                    colorOptions   : state.colorOptions,
                                    denominator    : state.denominator
                                }});
                            }}
                        />
                    </div>
                </div>
                <div className="col" style={{ zIndex: 2, position: "relative", justifySelf: "flex-start" }}>
                    <div style={{ position: "sticky", top: 2 }}>
                        <h2 style={{ marginTop: 0 }}>{viewName}</h2>
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
                        
                        { col1 && viewType === "overview" && chartType === "pie"           && <PieChart        column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} /> }
                        { col1 && viewType === "overview" && chartType === "pie3d"         && <PieChart        column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} use3d /> }
                        { col1 && viewType === "overview" && chartType === "donut"         && <PieChart        column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} donut /> }
                        { col1 && viewType === "overview" && chartType === "donut3d"       && <PieChart        column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} donut use3d /> }
                        
                        { col1 && viewType === "overview" && chartType === "spline"        && <SPLineChart     column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} groupBy={ col2 } /> }
                        { col1 && viewType === "overview" && chartType === "areaspline"    && <AreaSPLineChart column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} groupBy={ col2 } /> }

                        { col1 && viewType === "overview" && chartType === "column"        && <ColumnChart     column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} groupBy={ col2 } /> }
                        { col1 && viewType === "overview" && chartType === "column3d"      && <ColumnChart     column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} groupBy={ col2 } use3d /> }
                        { col1 && viewType === "overview" && chartType === "columnStack"   && <ColumnChart     column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} groupBy={ col2 } stack /> }
                        { col1 && viewType === "overview" && chartType === "columnStack3d" && <ColumnChart     column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} groupBy={ col2 } stack use3d /> }

                        { col1 && viewType === "overview" && chartType === "bar"           && <BarChart        column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} groupBy={ col2 } /> }
                        { col1 && viewType === "overview" && chartType === "bar3d"         && <BarChart        column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} groupBy={ col2 } use3d /> }
                        { col1 && viewType === "overview" && chartType === "barStack"      && <BarChart        column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} groupBy={ col2 } stack /> }
                        { col1 && viewType === "overview" && chartType === "barStack3d"    && <BarChart        column={ col1 } fullDataSet={ powerSet } dataSet={ chartPowerSet } options={ chartOptions } colorOptions={colorOptions} denominator={denominator} groupBy={ col2 } stack use3d /> }

                        <br/>
                        <div className="row mb-1">
                            <div className="col top">
                                {/* <h6>SOURCE DATA { dataRequest.refresh ? "SUBSCRIPTION" : "REQUEST" }</h6> */}
                                <DataRequestLink request={ dataRequest } />
                            </div>
                            <div className="col col-0 top">
                                <button className="btn btn-blue mt-1 small grey-out"> <b> Request Line-level Data </b> </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
