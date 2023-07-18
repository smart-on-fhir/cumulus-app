import { useCallback, useEffect, useReducer }    from "react"
import { useNavigate }                           from "react-router-dom"
import { HelmetProvider, Helmet }                from "react-helmet-async"
import Highcharts, { Chart }                     from "highcharts"
import { Link }                                  from "react-router-dom"
import { useBackend, useCommand }                from "../../hooks"
import { createOne, updateOne, request }         from "../../backend"
import { useAuth }                               from "../../auth"
import { AlertError }                            from "../generic/Alert"
import ConfigPanel                               from "./ConfigPanel"
import {buildChartOptions, default as BaseChart} from "./Charts/Chart"
import CaptionEditor                             from "./CaptionEditor"
import EditInPlace                               from "../generic/EditInPlace"
import { defer, Json, strip }                    from "../../utils"
import { getDefaultChartOptions }                from "./Charts/DefaultChartOptions"
import Tag                                       from "../Tags/Tag"
import Grid                                      from "../generic/Grid"
import { getScreenShot }                         from "../../commands/lib"
import CommandButton                             from "../../commands/CommandButton"
import { DownloadScreenshotAsPNG }               from "../../commands/Graphs/DownloadScreenshotAsPNG"
import { DownloadScreenshotAsJPG }               from "../../commands/Graphs/DownloadScreenshotAsJPG"
import { ToggleFullscreen }                      from "../../commands/Graphs/ToggleFullscreen"
import { CopyGraph }                             from "../../commands/Graphs/CopyGraph"
import { PrintChart }                            from "../../commands/Graphs/PrintChart"
import { DeleteGraph }                           from "../../commands/Graphs/DeleteGraph"
import { RequestLineLevelData }                  from "../../commands/Graphs/RequestLineLevelData"
import { GenerateCaption }                       from "../../commands/Graphs/GenerateCaption"
import { OpenInAnalyticEnvironment }             from "../../commands/Subscriptions/OpenInAnalyticEnvironment"
import {
    ReadOnlyPaths,
    SupportedChartTypes,
    SupportedNativeChartTypes,
    TURBO_THRESHOLD
} from "./config"

import "./Dashboard.scss"


// =============================================================================

export interface ViewState
{
    viewType        : "overview" | "data",
    showOptions     : boolean
    viewName        : string
    viewDescription : string
    viewColumn      : app.DataRequestDataColumn
    viewGroupBy    ?: app.DataRequestDataColumn
    filters         : app.Filter[]
    chartType       : string
    chartOptions    : Partial<Highcharts.Options>
    denominator     : "" | "local" | "global"
    cleanState     ?: ViewState
    column2        ?: app.DataRequestDataColumn
    column2type     : keyof typeof SupportedChartTypes
    caption         : string
    data            : app.ServerResponses.DataResponse | null
    data2           : app.ServerResponses.StratifiedDataResponse | null
    loadingData     : boolean
    fullChartOptions: Partial<Highcharts.Options>
    dataTabIndex    : number
    tags            : Pick<app.Tag, "id"|"name"|"description">[]
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

function getViewReducer({ onSeriesToggle }: { onSeriesToggle: (s: Record<string, boolean>) => void })
{
    const chartable = [
        "chartType",
        "chartOptions",
        "denominator",
        "data",
    ];

    function computeChartOptions(nextState: ViewState) {
        try {
            if (nextState.data) {
                if (nextState.chartType.startsWith("pie") || nextState.chartType.startsWith("donut")) {
                    nextState.viewGroupBy = undefined
                    nextState.data2 = null
                }

                const options = getDefaultChartOptions(
                    nextState.chartType as keyof typeof SupportedChartTypes,
                    nextState.chartOptions
                );

                // Now build the final options by adding dynamic properties
                // like series data and function options
                nextState.fullChartOptions = buildChartOptions({
                    options,
                    type            : options.chart!.type as SupportedNativeChartTypes,
                    data            : nextState.data,
                    data2           : nextState.data2,
                    column          : nextState.viewColumn,
                    groupBy         : nextState.viewGroupBy,
                    denominator     : nextState.denominator,
                    column2type     : nextState.column2type,
                    onSeriesToggle
                })
            }
        } catch {
            // Errors might happen due to partially incompatible state properties.
            // For example if a stratifier is added to un-stratified data and the
            // stratified data is not yet available
        }

        return nextState
    }

    return function viewReducer(state: ViewState, action: ViewAction): ViewState
    {
        if (action.type === "SET_CHART_OPTIONS") {
            const nextState = {
                ...state,
                chartOptions: Highcharts.merge(state.chartOptions, action.payload)
            };
            return computeChartOptions(nextState);
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
                nextState.viewGroupBy = undefined
                nextState.denominator = ""
            }

            // @ts-ignore
            if (Object.keys(action.payload).some(key => chartable.includes(key) && action.payload[key] !== state[key])) {
                computeChartOptions(nextState);
            }

            return nextState;
        }

        return state
    }
}

function isTurbo(primaryData: app.ServerResponses.DataResponse, secondaryData?: app.ServerResponses.StratifiedDataResponse | null) {
    let out = false

    if (!primaryData.stratifier) {
        out = primaryData.data?.[0]?.rows?.length > TURBO_THRESHOLD
    } else {
        out = (primaryData as app.ServerResponses.StratifiedDataResponse).data.some(g => g.rows.length > TURBO_THRESHOLD)
    }

    if (!out && secondaryData) {
        out = secondaryData.data.some(g => g.rows.length > TURBO_THRESHOLD)
    }
    
    return out
}

export default function Dashboard({
    view,
    dataRequest,
    copy
}: {
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
}) {

    const navigate = useNavigate();
    const auth     = useAuth();
    const isAdmin  = auth.user?.role === "admin"

    const { cols = [] } = dataRequest.metadata ?? {}

    const viewSettings = view.settings || {} as Partial<app.ViewSettings>

    const [ state, dispatch ] = useReducer(getViewReducer({ onSeriesToggle }), {
        
        // Chart or grid view? start with chart
        viewType: "overview",

        // Whether sidebar and save/delete buttons are visible. True in create mode
        showOptions: !view.id,

        // View name
        viewName: view.name || "Untitled Graph",

        // View description
        viewDescription: view.description || "",

        // Line chart seems to be most universal so begin with it
        chartType: viewSettings.viewType || "spline",

        // If column is not set pick the firs one other than "cnt"
        viewColumn: cols.find(c => c.name === viewSettings.column || "") || cols.find(c => c.name !== "cnt")!,

        // The stratifier if any (groupBy is its legacy name)
        viewGroupBy: cols.find(c => c.name === viewSettings.groupBy),

        // The filters if any
        filters: viewSettings.filters || [],

        // any custom chart options
        chartOptions: viewSettings.chartOptions || {},

        // the denominator option
        denominator: viewSettings.denominator || "",
        
        // secondary column
        column2: cols.find(c => c.name === viewSettings.column2 || ""),

        // secondary data type
        column2type: viewSettings.column2type || "",

        // View caption if any
        caption: viewSettings.caption || "",
        
        // The chart data (to be fetched later)
        data: null,

        // The secondary chart data (to be fetched later)
        data2: null,

        // True while chart data is loaded
        loadingData: false,

        // The final chart options that are rendered in the chart
        fullChartOptions: {},

        // Which is the active tab in the data view
        dataTabIndex: 0,

        tags: (view.Tags || []).map(tag => {
            // @ts-ignore
            if (copy) delete tag.ViewsTags
            return tag
        })

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
        denominator,
        column2,
        column2type,
        caption,
        data,
        data2,
        fullChartOptions,
        loadingData,
        dataTabIndex,
        tags
    } = state;

    function onSeriesToggle(map: Record<string, boolean>) {
        const next = {
            chartOptions: {
                series: (fullChartOptions.series || []).map(s => {
                    return { ...s, visible: map[s.id + ""] !== false }
                })
            }
        }
        dispatch({ type: "UPDATE", payload: next})
    }

    const onTransitionEnd = () => {
        window.Highcharts.charts.forEach(c => c?.reflow())
    };

    // Save
    const { execute: save, loading: saving } = useBackend(async () => {
        
        if (!isAdmin) {
            return alert("You don't have permission to save graphs")
        }

        const screenShot = viewType === "overview" ?
            await getScreenShot() :
            undefined;

        // const chartOptionsToSave = objectDiff(
        //     strip(fullChartOptions, ReadOnlyPaths),
        //     DefaultChartOptions
        // );
        const chartOptionsToSave = strip(fullChartOptions, ReadOnlyPaths);

        // console.log(chartOptions, chartOptionsToSave)
        
        // Update
        if (view.id) {
            await updateOne("views", view.id, {
                ...view,
                name: viewName,
                description: viewDescription,
                screenShot,
                Tags: tags,
                settings: {
                    ...view.settings,
                    groupBy: viewGroupBy?.name,
                    column : viewColumn.name,
                    filters,
                    viewType: chartType,
                    chartOptions: chartOptionsToSave,
                    denominator,
                    column2: column2?.name,
                    column2type,
                    caption
                }
            }).catch(e => alert(e.message));
        }

        // Create
        else {
            await createOne("views", {
                ...view,
                name: viewName,
                description: viewDescription,
                DataRequestId: dataRequest.id,
                screenShot,
                Tags: tags,
                settings: {
                    ...view.settings,
                    groupBy: viewGroupBy?.name,
                    column : viewColumn.name,
                    filters,
                    viewType: chartType,
                    chartOptions: chartOptionsToSave,
                    denominator,
                    column2: column2?.name,
                    column2type,
                    caption
                }
            }).then(
                v => defer(() => navigate("/views/" + v.id)),
                e => alert(e.message)
            );
        }
    });

    // Take Screenshot
    const { execute: takeScreenshot, loading: takingScreenshot } = useBackend(async () => {
        const screenShot = await getScreenShot();
        await updateOne("views", view.id!, { screenShot }).catch(e  => alert(e.message));
    });

    // Convert filters to search parameters
    const noRightOps = ["isNull", "isNotNull", "isTrue", "isFalse", "isNotTrue", "isNotFalse"];
    const filterParams: string[] = []
    let chain: string[] = [];
    filters.forEach(filter => {
        const { left, operator, right, join } = filter
        // Skip incomplete filters
        if (left && operator && (right.value !== undefined || noRightOps.includes(operator))) {
            if (join === "and" && chain.length) {
                filterParams.push(chain.join(","))
                chain = []
            }
            chain.push([left, operator, right.value].join(":"))
        }
    })
    if (chain.length) filterParams.push(chain.join(","))

    // Variables that control if new data needs to be fetched
    const stratifierName = viewGroupBy?.name
    const secColumnName  = column2?.name || ""
    const viewColumnName = viewColumn.name
    const requestId      = dataRequest.id
    const filter         = filterParams.map(encodeURIComponent).join("&filter=")

    const loadData = useCallback(() => {
        dispatch({ type: "UPDATE", payload: {
            loadingData: true,
            loadingDataError: null,
            data : null,
            data2: null,
        }})

        const base = `/api/requests/${requestId}/api?`

        const fetchPrimaryData = async () => {
            const params = new URLSearchParams()
            params.set("column", viewColumnName)
            if (stratifierName) params.set("stratifier", stratifierName)
            let url = base + params
            if (filter) url += "&filter=" + filter
            return request(url)
        };

        const fetchSecondaryData = async () => {
            if (!secColumnName) return null
            const params = new URLSearchParams()
            params.set("column"    , viewColumnName)
            params.set("stratifier", secColumnName )
            let url = base + params
            if (filter) url += "&filter=" + filter
            return request(url)
        };

        return Promise.all([
            fetchPrimaryData(),
            fetchSecondaryData()
        ]).then(
            ([
                primaryData,
                secondaryData
            ]) => {
                dispatch({ type: "UPDATE", payload: {
                    data : primaryData,
                    data2: secondaryData,
                    loadingData: false
                }})
            },
            error => {
                dispatch({ type: "UPDATE", payload: {
                    loadingDataError: error,
                    loadingData: false
                }})
            }
        )
    }, [requestId, stratifierName, viewColumnName, filter, secColumnName]);

    useEffect(() => { loadData() }, [loadData])

    useEffect(() => {
        if (copy) {
            const el = document.getElementById("view-name") as HTMLTextAreaElement;
            if (el) {
                el.focus()
                el.select()
            }
        }
    }, [copy])

    const turbo = data && isTurbo(data, data2);

    function annotatePoints(chart: Chart) {
    
        const points = chart.getSelectedPoints()

        const labels: any[] = [];

        points.forEach((point, i) => {
            const text = prompt(
                `Enter the text of the annotation for selected point ${points.length> 1 ? `(#${i + 1})` : ""}` +
                "\nYou can edit this annotation later in the options sidebar.",
                point.name
            );

            if (text) {
                labels.push({
                    text,
                    overflow: "allow",
                    style: {
                        textAlign: "center",
                        fontFamily: "inherit",
                    },
                    point: {
                        x: point.x,
                        y: point.y,
                        xAxis: 0,
                        yAxis: 0
                    }
                })
            }
        });

        if (labels.length) {
            dispatch({
                type: "UPDATE",
                payload: {
                    chartOptions: {
                        ...fullChartOptions,
                        annotations: [{
                            visible: true,
                            draggable: '',
                            crop: false,
                            labelOptions: {
                                overflow: "justify",
                                allowOverlap: true,
                                className: "chart-annotation"
                            },
                            labels: [
                                ...(fullChartOptions.annotations?.[0]?.labels || []),
                                ...labels
                            ]
                        }]
                    }
                }
            })
        }
    }

    const deleteCommand    = useCommand(new DeleteGraph(view.id || 0, auth.user, navigate));
    const copyCommand      = useCommand(new CopyGraph(view.id || 0, auth.user, navigate));
    const downloadPNG      = useCommand(new DownloadScreenshotAsPNG(view));
    const downloadJPG      = useCommand(new DownloadScreenshotAsJPG(view));
    const toggleFullscreen = useCommand(new ToggleFullscreen());
    const printChart       = useCommand(new PrintChart());
    const requestLineData  = useCommand(new RequestLineLevelData(view.id || 0, auth.user, navigate))
    const openInAE         = useCommand(new OpenInAnalyticEnvironment(view.DataRequestId || 0, auth.user))
    const generateCaption  = useCommand(new GenerateCaption(fullChartOptions, state, c => dispatch({ type: "UPDATE", payload: { caption: c }})))

    return (
        <div className={ saving || deleteCommand.working ? "grey-out" : undefined }>
            <HelmetProvider>
                <Helmet>
                    <title>{viewName}</title>
                    {viewDescription && <meta name="description" content="Helmet application" />}
                </Helmet>
            </HelmetProvider>
            <div className="row">
                <div className="col col-0">
                    <div onTransitionEnd={onTransitionEnd} className="dashboard-sidebar" style={{
                        position     : "relative",
                        width        : showOptions ? 330 : 0,
                        opacity      : showOptions ? 1 : 0,
                        pointerEvents: showOptions ? "all" : "none",
                        zIndex       : showOptions ? "unset" : -1,
                        transition   : "all 0.2s ease-in-out",
                        marginRight  : showOptions ? "1rem" : 0
                    }}>
                        <ConfigPanel
                            dataRequest={dataRequest}
                            viewType={viewType}
                            view={view}
                            state={{
                                groupBy   : viewColumn.name,
                                stratifyBy: viewGroupBy?.name || "",
                                filters   : [...filters],
                                xCol      : viewColumn,

                                // @ts-ignore
                                chartType,
                                viewName,
                                viewDescription,
                                chartOptions: fullChartOptions,
                                // chartOptions: finalChartOptions,
                                denominator,
                                column2: column2?.name || "",
                                column2type,
                                tags
                            }}
                            onChange={state => {
                                dispatch({ type: "UPDATE", payload: {
                                    viewName       : state.viewName,
                                    viewDescription: state.viewDescription,
                                    chartType      : state.chartType,
                                    viewColumn     : cols.find(c => c.name === state.groupBy),
                                    viewGroupBy    : cols.find(c => c.name === state.stratifyBy),
                                    filters        : [...state.filters],
                                    chartOptions   : state.chartOptions,
                                    denominator    : state.denominator,
                                    column2        : cols.find(c => c.name === state.column2),
                                    column2type    : state.column2type,
                                    tags           : state.tags
                                }});
                            }}
                        />
                    </div>
                </div>
                <div className="col" style={{ zIndex: 2, position: "relative", justifySelf: "flex-start", minWidth: "32rem" }}>
                    <div style={{ position: "sticky", top: 2 }}>
                        <h2 style={{ margin: "0 0 0.5ex", lineHeight: 1.2 }}>
                            <EditInPlace
                                required
                                maxLength={100}
                                text={state.viewName}
                                onChange={ viewName => dispatch({ type: "UPDATE", payload: { viewName }}) }
                                id="view-name"
                            />
                        </h2>
                        <hr/>
                        <div className="color-muted" style={{ margin: "1ex 0 2ex", lineHeight: 1.2 }}>
                            <EditInPlace
                                maxLength={500}
                                text={viewDescription || "no description provided"}
                                onChange={ viewDescription => dispatch({ type: "UPDATE", payload: { viewDescription }}) }
                            />
                        </div>
                        <div className="row wrap">
                            <div className="col col-0 mb-1">
                                <div className="toolbar flex">
                                    <button
                                        className={"btn" + (viewType === "overview" ? " active" : "")}
                                        onClick={() => dispatch({ type: "SET_VIEW_TYPE", payload: "overview" })}
                                        title="Report View"
                                        style={{ minWidth: "7em" }}
                                        >
                                        <i className="fas fa-chart-pie" /> Overview
                                    </button>
                                    <button
                                        className={"btn" + (viewType === "data"     ? " active" : "")}
                                        onClick={() => dispatch({ type: "SET_VIEW_TYPE", payload: "data"})}
                                        title="Data View"
                                        style={{ minWidth: "7em" }}
                                        ><i className="fas fa-th" /> Data</button>
                                </div>
                            </div>
                            <div className="col mb-1"></div>
                            <div className="col col-0 mb-1">
                                <div className="toolbar flex">
                                    <button
                                        className="btn"
                                        onClick={save}
                                        title="Save Changes">
                                        <i className={ saving ? "fas fa-circle-notch fa-spin" : "fas fa-save" } /> Save
                                    </button>
                                    <CommandButton { ...copyCommand } label={ "" } />
                                    <CommandButton { ...deleteCommand } label={ "" } />
                                    <button
                                        className="btn"
                                        onClick={ takeScreenshot }
                                        title="Update Screenshot"
                                        disabled={!view.id || !isAdmin || viewType !== "overview" }>
                                        <i className={ takingScreenshot ? "fas fa-circle-notch fa-spin" : "fa-solid fa-camera" } />
                                    </button>
                                    <button
                                        className={ "btn" + (showOptions ? " active" : "")}
                                        onClick={() => dispatch({ type: "TOGGLE_OPTIONS" })}
                                        title="Options"
                                        ><i className="fas fa-cog" /></button>
                                </div>
                            </div>
                        </div>

                        { viewType === "data" && <>
                            <div className="tab-panel mt-1">
                                <span onClick={() => dispatch({ type: "UPDATE", payload: { dataTabIndex: 0 }})} className={"tab" + (dataTabIndex === 0 ? " active" : "")}>Primary Data</span>
                                <span onClick={() => dispatch({ type: "UPDATE", payload: { dataTabIndex: 1 }})} className={"tab" + (dataTabIndex === 1 ? " active" : "")}>Secondary Data</span>
                            </div>
                            { viewType === "data" && dataTabIndex === 0 && <div className="data-view">{ Json(data ) }</div> }
                            { viewType === "data" && dataTabIndex === 1 && <div className="data-view">{ Json(data2) }</div> }
                        </> }

                        { !viewColumn && viewType === "overview" && (
                            <AlertError>
                                It looks like the data source has been updated and this view is no longer compatible
                                with the new data. Please edit this view or delete it and create new one.
                            </AlertError>
                        ) }
                        { viewType === "overview" && turbo && (
                            <AlertError>
                                The data is too big to render properly in the chart view. We did our best but there might be some issues.
                                Please change your settings and perhaps add some filters to reduce the data size.
                            </AlertError>
                        ) }
                        { viewColumn && viewType === "overview" && <BaseChart
                            loading={ loadingData }
                            options={ fullChartOptions }
                            contextMenuItems={[
                                {
                                    label: "Save Changes",
                                    execute: save,
                                    icon: <i className="fas fa-save" />
                                },
                                deleteCommand,
                                copyCommand,
                                {
                                    label: "Update Graph Thumbnail",
                                    execute: takeScreenshot,
                                    enabled: !!view.id,
                                    icon: <i className="fa-solid fa-camera" />,
                                    description: "Take new screenshot of this graph as it currently looks"
                                },
                                // {
                                //     label: showOptions ? "Hide Chart Options" : "Show Chart Options",
                                //     execute: () => dispatch({ type: "TOGGLE_OPTIONS" }),
                                //     icon: <i className="fas fa-cog" />
                                // },
                                "-",
                                {
                                    label: "Show Chart Data",
                                    execute: () => dispatch({ type: "SET_VIEW_TYPE", payload: "data"}),
                                    icon: <i className="fas fa-th" />
                                },
                                downloadPNG,
                                downloadJPG,
                                toggleFullscreen,
                                printChart,
                                "-",
                                {
                                    label: "Annotate Selected Points ...",
                                    icon: <i className="fa-regular fa-comment"/>,
                                    // @ts-ignore
                                    enabled: e => e.context?.chart.getSelectedPoints().length > 0,
                                    // @ts-ignore
                                    execute: e => annotatePoints(e.context?.chart),
                                    available: !chartType.startsWith("pie") && !chartType.startsWith("donut")
                                },
                                generateCaption
                            ]}
                            // This key controls in which cases the chart should be re-created rather than updated!
                            key={ [
                                chartType,
                                viewColumn.name,
                                viewGroupBy?.name || "no_stratifier",
                                // finalChartOptions.annotations?.length || "",
                                column2?.name || "no_secondary",
                                column2type || "no_second_type",
                                // Date.now()
                            ].join(":") }
                        /> }
                        <br/>
                        <CaptionEditor html={caption} onChange={caption => dispatch({ type: "UPDATE", payload: { caption }})}/>
                        <br/>
                        <Grid cols="24em" gap="2em">
                        
                            <div className="col">
                                <b>Subscription</b>
                                <hr className="small"/>
                                <Link className="link mt-05" to={`/requests/${dataRequest.id}`}>
                                    <i className="fa-solid fa-database color-brand-2" /> { dataRequest.name }
                                </Link>
                            </div>
                        
                            <div className="col">
                                <b>Subscription Group</b>
                                <hr className="small"/>
                                { dataRequest.group ?
                                    <Link className="link mt-05 ellipsis" to={`/groups/${dataRequest.group.id}`} title={ dataRequest.group.description }>
                                        <i className="fa-solid fa-folder color-brand-2" /> { dataRequest.group.name }
                                    </Link> :
                                    <span className="color-muted">GENERAL</span> }
                            </div>

                            <div className="col">
                                <b>Study Areas</b>
                                <hr className="small"/>
                                <div className="mt-05">
                                { dataRequest.Projects?.length ?
                                    dataRequest.Projects.map((p, i) => (
                                        <div key={i} className="ellipsis">
                                            <Link className="link" to={`/projects/${p.id}`}>
                                                <i className="fa-solid fa-book color-brand-2" /> { p.name }
                                            </Link>
                                        </div>
                                    )) :
                                    <span className="color-muted">None</span>
                                }
                                </div>
                            </div>

                            <div className="col">
                                <b>Tags</b>
                                <hr className="small"/>
                                <div className="mt-05">{ tags.length ? 
                                    tags.map((t, i) => <Tag tag={t} key={i} />) :
                                    <span className="color-muted">None</span>
                                }</div>
                            </div>
                        </Grid>
                        <br/>
                        
                        <div className="row mb-1 mt-2 middle half-gap wrap">
                            <div className="col col-5 mb-1 ml-2 mr-2 responsive bold">
                                <CommandButton { ...openInAE } className="btn-blue"/>
                            </div>
                            <div className="col col-5 mb-1 ml-2 mr-2 responsive bold">
                                <CommandButton { ...requestLineData } className="btn-blue"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
