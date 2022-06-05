import { Component, createRef, useMemo, useReducer } from "react";
import html2canvas                          from "html2canvas";
import { useNavigate }                      from "react-router-dom";
import { HelmetProvider, Helmet }           from "react-helmet-async";
import Highcharts                           from "highcharts";
import ContentEditable                      from "react-contenteditable";
import PowerSet                             from "../../PowerSet";
import { useBackend }                       from "../../hooks";
import { createOne, updateOne, deleteOne }  from "../../backend";
import { useAuth }                          from "../../auth";
import DataRequestLink                      from "../DataRequests/DataRequestLink";
import DataGrid                             from "../DataGrid";
import Alert, { AlertError }                from "../Alert";
import { classList, defer, generateColors, objectDiff, strip, stripUndefined } from "../../utils";
import ConfigPanel                          from "./ConfigPanel"
import CaptionEditor                        from "./CaptionEditor"

import "./Dashboard.scss";
import { Link } from "react-router-dom";


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
    column2        : string
    column2type    : string
    column2opacity : number
    caption        : string
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
        "denominator",
        "column2",
        "column2type",
        "column2opacity",
        "caption"
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


function getColorsLength({
    stratifier,
    dataSet,
    column2,
    column2type,
    fullDataSet
}: {
    dataSet: PowerSet
    fullDataSet: PowerSet
    stratifier?: app.DataRequestDataColumn | null
    column2    ?: app.DataRequestDataColumn | null
    column2type?: string
}): number {
    let out = stratifier ? dataSet.getUniqueValuesFromColumn(stratifier.name).size : dataSet.rows.length;    

    if (column2 && column2type) {
        out += Array.from(fullDataSet.getUniqueValuesFromColumn(column2.name)).length;
    }

    return out
}

export default function Dashboard({
    view,
    dataRequest
}: {
    /**
     * The view object that we are editing. If this is an empty object
     * or a partial which does not have an `id` property, then the
     * dashboard is in "create mode"
     */
    view: Partial<app.View>

    /**
     * The data subscription that this view is (or is going to be)
     * assigned to.
     */
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
            opacity   : 1,
            colors    : []
        },
        column2: serverColumn2 = "",
        column2type: serverColumn2type = "",
        column2opacity: serverColumn2opacity = 1,
        caption: serverCaption = ""
    } = view.settings || {}

    if (!serverColorOptions.colors || !serverColorOptions.colors.length) {
        serverColorOptions.colors = generateColors(36)
    }

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
        column2        : serverColumn2,
        column2type    : serverColumn2type,
        column2opacity : serverColumn2opacity,
        caption        : serverCaption,
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
        denominator,
        column2,
        column2type,
        column2opacity,
        caption
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

        const chartOptionsToSave = objectDiff(
            strip(chartOptions, ReadOnlyPaths),
            DefaultChartOptions
        );

        // console.log(chartOptions, chartOptionsToSave)
        
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
                    chartOptions: chartOptionsToSave,
                    colorOptions,
                    denominator,
                    column2,
                    column2type,
                    column2opacity,
                    caption
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
                    chartOptions: chartOptionsToSave,
                    colorOptions,
                    denominator,
                    column2,
                    column2type,
                    column2opacity,
                    caption
                }
            }).then(
                v => defer(() => navigate("/views/" + v.id)),
                e => alert(e.message)
            );
        }
    })

    const { execute: takeScreenshot, loading: takingScreenshot } = useBackend(async () => {
        const screenShot = await getScreenShot();
        await updateOne("views", view.id!, { screenShot }).catch(e  => alert(e.message));
    });

    const { execute: destroy, loading: deleting } = useBackend(() => {
        if (window.confirm("Yre you sure you want to delete this view?")) {
            return deleteOne("views", view.id + "").then(() => navigate("/"))
        }
        return Promise.resolve()
    })

    const col1 = dataRequest.data.cols.find(col => col.name === viewColumn) as app.DataRequestDataColumn;
    const stratifier = viewGroupBy ? dataRequest.data.cols.find(col => col.name === viewGroupBy) as app.DataRequestDataColumn : null;

    const col2 = column2 ? dataRequest.data.cols.find(col => col.name === column2) as app.DataRequestDataColumn : null;
    
    const groupBy = stratifier?.name;
    const filterList = filters.map(f => JSON.stringify(f)).join(",");

    let powerSet = useMemo(() => PowerSet.from(dataRequest.data), [dataRequest.data]);

    let { chartPowerSet } = useMemo(function() {

        // let powerSet = PowerSet.from(dataRequest.data);

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

        let chartPowerSet: PowerSet;

        try {
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

                // powerSet = powerSet.filter(filter)
                chartPowerSet = powerSet.filter(filter).getChartData({
                    column : viewColumn,
                    groupBy,
                    filters: usableFilters,
                    column2
                });
            }
            else {
                chartPowerSet = powerSet.getChartData({
                    column : viewColumn,
                    groupBy,
                    filters: usableFilters,
                    column2
                });
            }
        } catch (ex) {
            console.error(ex);
            chartPowerSet = PowerSet.from({ cols: [], rows: []})
        }
        
        return { powerSet, chartPowerSet }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ powerSet, groupBy, viewColumn, filterList ]);

    const onTransitionEnd = () => {
        window.Highcharts.charts.forEach(c => c?.reflow())
    };

    const colorsLength = getColorsLength({
        fullDataSet: powerSet,
        dataSet    : chartPowerSet,
        column2    : col2,
        stratifier,
        column2type
    });

    // Start by building a default options for the given type
    let options = getDefaultChartOptions(chartType as keyof typeof SupportedChartTypes, chartOptions)

    // Now build the final options by adding dynamic properties like series data
    // and function options
    let finalChartOptions = buildChartOptions({
        options     : options,
        column      : col1,
        dataSet     : chartPowerSet,
        fullDataSet : powerSet,
        groupBy     : stratifier,
        type        : options.chart!.type as SupportedNativeChartTypes,
        colorOptions: colorOptions,
        column2     : col2,
        column2type,
        column2opacity,
        denominator
    })
    // console.log("finalChartOptions:", finalChartOptions)

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
                            view={view}
                            colorsLength={colorsLength}
                            state={{
                                groupBy   : viewColumn,
                                stratifyBy: stratifier?.name || "",
                                filters   : [...filters],
                                xCol      : col1,

                                // @ts-ignore
                                chartType,
                                viewName,
                                viewDescription,
                                chartOptions: stripUndefined(finalChartOptions),
                                // chartOptions: finalChartOptions,
                                colorOptions,
                                denominator,
                                column2,
                                column2type,
                                column2opacity
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
                                    denominator    : state.denominator,
                                    column2        : state.column2,
                                    column2type    : state.column2type,
                                    column2opacity : state.column2opacity
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
                                    { showOptions && isAdmin && view.id && (
                                        <button
                                            className="btn color-blue"
                                            onClick={ takeScreenshot }
                                            title="Update Screenshot">
                                            <i className={ takingScreenshot ? "fas fa-circle-notch fa-spin" : "fa-solid fa-camera" } />
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
                                        (col.name === viewColumn || (stratifier && col.name === stratifier.name)) ||
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
                                Please edit this view or delete it and create new one.
                            </AlertError>
                        ) }
                        { col1 && viewType === "overview" && <BaseChart
                            options={ finalChartOptions }
                            key={ [
                                chartType,
                                col1.name,
                                stratifier || "",
                                finalChartOptions.annotations?.length || "",
                                column2,
                                column2type
                            ].join("-") }
                        /> }
                        <br/>
                        <CaptionEditor html={caption} onChange={caption => dispatch({ type: "UPDATE", payload: { caption }})}/>
                        <br/>
                        <div className="row mb-1 wrap middle half-gap">
                            <div className="col" style={{ minWidth: "15em" }}>
                                <DataRequestLink request={ dataRequest } />
                            </div>
                            <div className="col col-0">
                                <div className="row half-gap nowrap">
                                    <div className="col col-0" style={{ minWidth: "17em" }}>
                                        <a
                                            className={ "btn btn-blue" + (process.env.REACT_APP_BACKEND_HOST ? " grey-out" : "") }
                                            href={`https://cumulusdemo.notebook.us-east-1.sagemaker.aws/notebooks/cumulus/demo.ipynb?fileLoc=${
                                                encodeURIComponent(
                                                    // dataRequest.data.src ||
                                                    window.location.origin + "/api/requests/" + dataRequest.id + "/data?format=csv"
                                                )
                                            }`}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                        >
                                            <b> Open in Analytic Environment </b>
                                        </a>
                                    </div>
                                    <div className="col col-0" style={{ minWidth: "14em" }}>
                                        
                                        <Link to="./request-data" className="btn btn-blue"><b> Request Line-level Data </b></Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface CaptionEditorProps {
    html: string | null
    disabled?: boolean
    onChange: (html: string) => void
}

interface CaptionEditorState {
    html: string
}

class CaptionEditor extends Component<CaptionEditorProps, CaptionEditorState> {
    
    contentEditable: React.RefObject<HTMLDivElement>;

    constructor(props: CaptionEditorProps) {
        super(props);
        this.contentEditable = createRef();
        this.state = { html: String(props.html || "").trim() };
    };
  
    handleChange = (evt: any) => {
        const { onChange } = this.props
        this.setState({ html: evt.target.value });
        onChange && onChange(evt.target.value)
    };
  
    render() {
        return <ContentEditable
            innerRef={this.contentEditable}
            html={this.state.html}
            disabled={!!this.props.disabled}
            onChange={this.handleChange}
            className="chart-caption"
            tagName='div'
        />
    }
}
