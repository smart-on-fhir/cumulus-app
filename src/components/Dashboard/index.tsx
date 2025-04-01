import { useCallback, useEffect, useReducer }    from "react"
import { useNavigate, Link }                     from "react-router-dom"
import { buildChartOptions }                     from "./Charts/lib"
import ConfigPanel                               from "./ConfigPanel"
import { default as BaseChart }                  from "./Charts/Chart"
import CaptionEditor                             from "./CaptionEditor"
import { getDefaultChartOptions }                from "./Charts/DefaultChartOptions"
import { GraphBreadcrumbs }                      from "./GraphBreadcrumbs"
import { GraphTitle }                            from "./GraphTitle"
import { GraphDescription }                      from "./GraphDescription"
import { GraphToolbar }                          from "./GraphToolbar"
import Tag                                       from "../Tags/Tag"
import Alert, { AlertError }                     from "../generic/Alert"
import Loader                                    from "../generic/Loader"
import Grid                                      from "../generic/Grid"
import { app }                                   from "../../types"
import { createOne, updateOne, fetchChartData }  from "../../backend"
import { useBackend, useCommand }                from "../../hooks"
import Highcharts, { Chart }                     from "../../highcharts"
import { useAuth }                               from "../../auth"
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
import { ShareGraph }                            from "../../commands/Graphs/Share/ShareGraph"
import { ManagePermissions }                     from "../../commands/Graphs/Share/ManagePermissions"
import { OpenInAnalyticEnvironment }             from "../../commands/Subscriptions/OpenInAnalyticEnvironment"
import Terminology                               from "../../Terminology"
import aggregator, { DataPackage }               from "../../Aggregator"
import {
    assert,
    defer,
    humanizeColumnName,
    Json,
    requestPermission,
    strip
} from "../../utils"
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
    viewType         : "overview" | "data",
    showOptions      : boolean
    viewName         : string
    viewDescription  : string
    viewColumn       : app.SubscriptionDataColumn
    viewGroupBy     ?: app.SubscriptionDataColumn
    filters          : app.Filter[]
    chartType        : string
    chartOptions     : Partial<Highcharts.Options>
    denominator      : app.DenominatorType
    column2         ?: app.SubscriptionDataColumn
    column2type     ?: keyof typeof SupportedChartTypes
    caption          : string
    data             : app.ServerResponses.DataResponse | null
    data2            : app.ServerResponses.StratifiedDataResponse | null
    loadingData      : boolean
    dataTabIndex     : number
    tags             : Pick<app.Tag, "id"|"name"|"description">[]
    ranges           : app.RangeOptions
    visualOverrides  : app.VisualOverridesState
    inspection       : app.Inspection
    isDraft          : boolean
    loadingDataError?: Error | string | null 
    sortBy           : string
    limit            : number
    offset           : number
}

interface ViewAction
{
    type: string
    payload?: any
}


export function getViewReducer({
    onSeriesToggle,
    onInspectionChange
}: {
    onSeriesToggle: (s: Record<string, boolean>) => void
    onInspectionChange: (inspection: string[], context: any) => void
}) 
{


    return function viewReducer(state: ViewState, action: ViewAction): ViewState
    {
        function updateChartOptions(currentState: ViewState) {
            if (currentState.data) {
                currentState.chartOptions = buildChartOptions({
                    options         : currentState.chartOptions,
                    type            : currentState.chartOptions.chart!.type as SupportedNativeChartTypes,
                    data            : currentState.data,
                    data2           : currentState.data2,
                    column          : currentState.viewColumn,
                    groupBy         : currentState.viewGroupBy,
                    denominator     : currentState.denominator,
                    column2type     : currentState.column2type,
                    ranges          : currentState.ranges,
                    inspection      : currentState.inspection,
                    sortBy          : currentState.sortBy,
                    limit           : currentState.limit,
                    offset          : currentState.offset,
                    onSeriesToggle,
                    onInspectionChange,
                })
            }
            return currentState
        }

        if (action.type === "SET_CHART_OPTIONS") {
            if (state.data) {
                const chartOptions = action.payload

                // const chartOptions = stripValue(action.payload, "__DELETED__")

                const options = getDefaultChartOptions(
                    state.chartType as any,
                    Highcharts.merge(state.chartOptions, chartOptions)
                )

                return {
                    ...state,
                    chartOptions: buildChartOptions({
                        options,
                        type            : options.chart!.type as SupportedNativeChartTypes,
                        data            : state.data,
                        data2           : state.data2,
                        column          : state.viewColumn,
                        groupBy         : state.viewGroupBy,
                        denominator     : state.denominator,
                        column2type     : state.column2type,
                        ranges          : state.ranges,
                        inspection      : state.inspection,
                        sortBy          : state.sortBy,
                        limit           : state.limit,
                        offset          : state.offset,
                        onSeriesToggle,
                        onInspectionChange,
                    })
                };
            }
        }

        if (action.type === "SET_RANGE_OPTIONS") {
            const out = { ...state, ranges: action.payload }
            if (state.data) {
                updateChartOptions(out)
            }
            return out
        }

        if (action.type === "SET_SECONDARY_DATA_OPTIONS") {
            const out = { ...state, column2: action.payload.column, column2type: action.payload.type }
            if (state.data) {
                updateChartOptions(out)
            }
            return out
        }

        if (action.type === "SET_CHART_TYPE") {

            const chartType = action.payload

            const nextState = { ...state, chartType };

            if (chartType.startsWith("pie") || chartType.startsWith("donut")) {
                nextState.viewGroupBy = undefined
                nextState.data2 = null
            }

            if (nextState.data) {
                const options = getDefaultChartOptions(chartType, nextState.chartOptions, true)

                nextState.chartOptions = buildChartOptions({
                    options,
                    type            : options.chart!.type as SupportedNativeChartTypes,
                    data            : nextState.data,
                    data2           : nextState.data2,
                    column          : nextState.viewColumn,
                    groupBy         : nextState.viewGroupBy,
                    denominator     : nextState.denominator,
                    column2type     : nextState.column2type,
                    ranges          : nextState.ranges,
                    inspection      : nextState.inspection,
                    sortBy          : nextState.sortBy,
                    limit           : nextState.limit,
                    offset          : nextState.offset,
                    onSeriesToggle,
                    onInspectionChange,
                })
            }

            return nextState;
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
            
            if (nextState.inspection.enabled && nextState.inspection.match.length) {
                nextState.showOptions = true
            }

            const chartable = [
                // "chartOptions",
                "denominator",
                "data",
                "data2",
                // "column"
                "inspection",
                "sortBy",
                "limit",
                "offset"
            ];

            // @ts-ignore
            if (nextState.data && Object.keys(action.payload).some(key => chartable.includes(key) && action.payload[key] !== state[key])) {
                // computeChartOptions(state, nextState);
                const options = getDefaultChartOptions(
                    nextState.chartType as keyof typeof SupportedChartTypes,
                    nextState.chartOptions
                );

                nextState.chartOptions = buildChartOptions({
                    options         : options,
                    type            : options.chart!.type as SupportedNativeChartTypes,
                    data            : nextState.data!,
                    data2           : nextState.data2,
                    column          : nextState.viewColumn,
                    groupBy         : nextState.viewGroupBy,
                    denominator     : nextState.denominator,
                    column2type     : nextState.column2type,
                    ranges          : nextState.ranges,
                    inspection      : nextState.inspection,
                    sortBy          : nextState.sortBy,
                    limit           : nextState.limit,
                    offset          : nextState.offset,
                    onSeriesToggle,
                    onInspectionChange,
                })
            }

            return nextState;
        }

        if (action.type === "MERGE") {
            return {
                ...state,
                ...action.payload
            };
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

function hasRanges(data: app.ServerResponses.DataResponse | null, data2: app.ServerResponses.StratifiedDataResponse | null) {
    return (
        (data?.data?.some(group => group.rows.some(row => row.length >= 4))) ||
        (data2?.data?.some(group => group.rows.some(row => row.length >= 4)))
    );
}

function validateData(data: any, { column, stratifier }: { column: string, stratifier?: string, filters?: string[] }) {

    type Point = [string | number, number] | [string | number, number, number, number];

    // response data type
    assert(data && typeof data === "object", `Invalid data response received: type "${typeof data}"`)
    
    // column
    assert(data.column === column, `Invalid data response received: Expected the "column" property to equal "${column}".`)

    // stratifier
    if (stratifier) {
        assert(data.stratifier === stratifier, `Invalid data response received: Expected the "stratifier" property to equal "${stratifier}".`)
    }
    
    // totalCount
    assert(typeof data.totalCount === "number", `Invalid data response received: Expected numeric "totalCount" property.`)
    
    // rowCount
    assert(typeof data.rowCount === "number", `Invalid data response received: Expected numeric "rowCount" property.`)

    // filters
    assert(Array.isArray(data.filters), `Invalid data response received: Expected "filters" to be array.`)

    // data
    assert(Array.isArray(data.data), `Invalid data response received: Expected "data" to be array.`)

    // Singular response
    if (!stratifier) {
        assert(data.data.length === 1, `Invalid data response received: Expected the "data" array to contain one entry.`)
        assert(typeof data.data[0] === "object", `Invalid data response received: Expected the "data" array to contain one object.`)
        assert(Array.isArray(data.data[0].rows), `Invalid data response received: Expected data[0].rows to be array.`)
        assert(data.data[0].rows.length === data.rowCount, `Invalid data response received: Expected data[0].rows to have length equal to "rowCount".`)

        data.data[0].rows.forEach((row: Point, i: number) => {
            // assert(typeof row[0] === "string" || typeof row[0] === "number", `Invalid data response received: data[0].rows[${i}][0] must be a string or number`)
            assert(typeof row[1] === "number", `Invalid data response received: data[0].rows[${i}][1] must be a number`)
            assert(row.length === 2 || typeof row[2] === "number", `Invalid data response received: data[0].rows[${i}][2] must be a number`)
            assert(row.length === 2 || typeof row[3] === "number", `Invalid data response received: data[0].rows[${i}][3] must be a number`)
            if (i > 0 && typeof row[0] === "number") {
                assert(
                    row[0] > data.data[0].rows[i-1][0],
                    `Invalid data response received: Data is not sorted: ${row[0]} > ${data.data[0].rows[i-1][0]}`
                )
            }
        })
    }

    // Stratified response
    else {
        const stratifiers: Record<string, boolean> = {}

        data.data.forEach((group: any, g: number) => {
            assert(group && typeof group === "object", `Invalid data response received: data[${g}] is not an object.`)
            // assert(typeof group.stratifier === "string" || typeof group.stratifier === "number", `Invalid data response received: data[${g}].stratifier is not a string or number.`)
            assert(Array.isArray(group.rows), `Invalid data response received: data[${g}].rows is not an array.`)
            assert(!stratifiers[group.stratifier], `Invalid data response received: Duplicate stratifier "${group.stratifier}".`)
            stratifiers[group.stratifier] = true;

            group.rows.forEach((row: Point, i: number) => {
                // assert(typeof row[0] === "string", `Invalid data response received: data[${g}].rows[${i}][0] must be a string`)
                assert(typeof row[1] === "number", `Invalid data response received: data[${g}].rows[${i}][1] must be a number`)
                assert(row.length === 2 || typeof row[2] === "number", `Invalid data response received: data[${g}].rows[${i}][2] must be a number`)
                assert(row.length === 2 || typeof row[3] === "number", `Invalid data response received: data[${g}].rows[${i}][3] must be a number`)
                if (i > 0 && typeof row[0] === "number") {
                    assert(row[0] >= group.rows[i-1][0], `Invalid data response received: data[${g}].rows is not sorted`)
                }
            })
        })
    }
}

export interface DashboardProps {
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
    subscription?: app.Subscription

    dataPackage?: DataPackage
    
    copy?: boolean
}

export default function Dashboard({ view, subscription, dataPackage, copy }: DashboardProps) {
    const navigate  = useNavigate();
    const auth      = useAuth();
    const isOwner   = auth.user && view.creatorId === auth.user.id;
    const canUpdate = isOwner || requestPermission({ user: auth.user, resource: "Graphs", resource_id: view.id, action: "update" })
    const canCreate = requestPermission({ user: auth.user, resource: "Graphs", action: "create" })

    assert(subscription || dataPackage, "Either subscription or dataPackage prop must be provided");

    const metadata = subscription ? subscription.metadata! : aggregator.getPackageMetadata(dataPackage!)

    const cols = metadata.cols;

    const viewSettings = view.settings || {} as Partial<app.ViewSettings>

    const [ state, dispatch ] = useReducer(getViewReducer({ onSeriesToggle, onInspectionChange }), {
        
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
        viewColumn: cols.find(c => c.name === viewSettings.column || "") ||
                    cols.find(c => c.name !== "cnt" && c.name !== "cnt_min" && c.name !== "cnt_max" && c.dataType !== "hidden")!,

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
        column2type: viewSettings.column2type,

        // View caption if any
        caption: viewSettings.caption || "",
        
        // The chart data (to be fetched later)
        data: null,

        // The secondary chart data (to be fetched later)
        data2: null,

        // True while chart data is loaded
        loadingData: true,

        // Error from the server
        loadingDataError: null,

        // Which is the active tab in the data view
        dataTabIndex: 0,

        tags: (view.Tags || []).map(tag => {
            // @ts-ignore
            if (copy) delete tag.ViewsTags
            return tag
        }),

        ranges: viewSettings.ranges || {},

        visualOverrides: {
            enabled    : false,
            brightness : 100, // 0 - 200%
            contrast   : 100, // 0 - 200%
            saturation : 100, // 0 - 200%
            fontColor  : "#000000"
        },
        
        inspection: {
            enabled: false,
            match: [],
            context: {
                selectedAnnotationIndex: -1,
                selectedPlotLineId     : "",
                selectedPlotLineAxis   : "",
                selectedSeriesId       : ""
            }
        },

        isDraft: !!view.isDraft,

        sortBy: viewSettings.sortBy || "x:asc",

        limit: viewSettings.limit || 0,

        offset: viewSettings.offset || 0

    } as ViewState);

    // console.log(state)

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
        loadingData,
        dataTabIndex,
        tags,
        ranges,
        isDraft,
        loadingDataError,
        sortBy,
        limit,
        offset
    } = state;

    const stratifierName = viewGroupBy?.name
    const secColumnName  = column2?.name || ""
    const viewColumnName = viewColumn.name
    const requestId      = subscription?.id || dataPackage?.id

    const runtimeView: Partial<app.View> = {
        id         : view.id,
        name       : viewName,
        description: viewDescription,
        Tags       : tags,
        isDraft    : isDraft,
        settings: {
            ...view.settings,
            groupBy: stratifierName || "",
            column : viewColumnName,
            filters,
            viewType: chartType,
            // @ts-ignore
            chartOptions: strip(state.chartOptions, ReadOnlyPaths),
            denominator,
            column2: secColumnName,
            column2type,
            caption,
            ranges,
            sortBy,
            limit,
            offset
        }
    }

    function onSeriesToggle(map: Record<string, boolean>) {
        const next = {
            chartOptions: {
                series: (state.chartOptions.series || []).map(s => {
                    return { ...s, visible: map[s.id + ""] !== false }
                })
            }
        }
        dispatch({ type: "UPDATE", payload: next})
    }

    function onInspectionChange(match: string[], context: any) {
        dispatch({
            type: "UPDATE",
            payload: {
                inspection: {
                    ...state.inspection,
                    match,
                    context: {
                        selectedAnnotationIndex: -1,
                        selectedPlotLineId     : "",
                        selectedPlotLineAxis   : "",
                        selectedSeriesId       : "",
                        ...context
                    }
                }
            }
        })
        
    }

    const onTransitionEnd = () => {
        Highcharts.charts.forEach(c => c?.reflow())
    };

    // Save
    const { execute: saveChart, loading: saving } = useBackend(async () => {
        
        // Update
        if (view.id) {
            if (!canUpdate) {
                return alert("You don't have permission to update graphs")
            }
            const screenShot = viewType === "overview" ? await getScreenShot() : undefined;
            const result = await updateOne("views", view.id, { ...runtimeView, screenShot }).catch(e => alert(e.message));

            dispatch({ type: "MERGE", payload: { isDraft: result ? result.isDraft : false }})
        }

        // Create
        else {
            if (!canCreate) {
                return alert("You don't have permission to create graphs")
            }
            const screenShot = viewType === "overview" ? await getScreenShot() : undefined;
            await createOne("views", { ...runtimeView, subscriptionId: subscription ? subscription.id : undefined, packageId: dataPackage?.id, screenShot, }).then(
                v => defer(() => navigate("/views/" + v.id)),
                e => alert(e.message)
            );
        }
    });

    const save = (props: Partial<app.View> = {}) => {
        Object.assign(runtimeView, props)
        return saveChart()
    }

    // Convert filters to search parameters
    const noRightOps = [
        // "isNull",
        // "isNotNull", 
        "isTrue",
        "isFalse",
        "isNotTrue",
        "isNotFalse"
    ];
    const filterParams: string[] = []
    let chain: string[] = [];
    filters.forEach(filter => {
        const { left, operator, right, join } = filter
        
        // incomplete filter - column not selected yet
        if (!left) {
            return
        }

        // incomplete filter - operator not selected yet
        if (!operator) {
            return
        }

        // incomplete filter - right.value required but empty
        if (!noRightOps.includes(operator) && (right.value === undefined || right.value === "")) {
            return;
        }

        if (join === "and" && chain.length) {
            filterParams.push(chain.join(","))
            chain = []
        }

        const parts: any[] = [left, operator]
        if (!noRightOps.includes(operator)) {
            parts.push(right.value)
        }

        chain.push(parts.join(":"))
    })

    if (chain.length) filterParams.push(chain.join(","))

    // Variables that control if new data needs to be fetched
    const filter = filterParams.map(encodeURIComponent).join("&filter=")

    const loadData = useCallback(() => {
        dispatch({ type: "UPDATE", payload: {
            loadingData: true,
            loadingDataError: null,
            data : null,
            data2: null,
        }})

        const fetchPrimaryData = async () => fetchChartData({
            subscription,
            dataPackage,
            column    : viewColumnName,
            stratifier: stratifierName,
            filters   : filterParams,
            label     : "Char Primary Data"
        })

        const fetchSecondaryData = async () => {
            if (!secColumnName) return null
            return fetchChartData({
                subscription,
                dataPackage,
                column    : viewColumnName,
                stratifier: secColumnName,
                filters   : filterParams,
                label     : "Char Secondary Data"
            })
        }

        return Promise.all([
            fetchPrimaryData(),
            fetchSecondaryData()
        ]).then(([
            primaryData,
            secondaryData
        ]) => {
            try {
                validateData(primaryData, { column: viewColumnName, stratifier: stratifierName, filters: filterParams })
                if (secColumnName) {
                    validateData(secondaryData, { column: viewColumnName, stratifier: secColumnName, filters: filterParams })
                }
            } catch (ex) {
                dispatch({ type: "UPDATE", payload: { loadingDataError: ex }})
            }

            dispatch({ type: "UPDATE", payload: {
                data : primaryData,
                data2: secondaryData,
                loadingData: false
            }})
        }).catch(error => {
            dispatch({ type: "UPDATE", payload: {
                loadingDataError: error,
                loadingData: false
            }})
        })

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        ...state.chartOptions,
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
                                ...(state.chartOptions.annotations?.[0]?.labels || []),
                                ...labels
                            ]
                        }]
                    }
                }
            })
        }
    }

    const deleteCommand        = useCommand(new DeleteGraph({ graphId: view.id || 0, user: auth.user, navigate, ownerId: view.creatorId }));
    const copyCommand          = useCommand(new CopyGraph(view, auth.user, navigate, runtimeView));
    const shareCommand         = useCommand(new ShareGraph(view, auth.user));
    const managePermissionsCmd = useCommand(new ManagePermissions(view, auth.user));
    const downloadPNG          = useCommand(new DownloadScreenshotAsPNG(runtimeView));
    const downloadJPG          = useCommand(new DownloadScreenshotAsJPG(runtimeView));
    const toggleFullscreen     = useCommand(new ToggleFullscreen());
    const printChart           = useCommand(new PrintChart());
    const generateCaption      = useCommand(new GenerateCaption(state.chartOptions, state, c => dispatch({ type: "UPDATE", payload: { caption: c }})))

    // console.log(state.chartOptions)

    return (
        <div className={ "dashboard " + (saving || deleteCommand.working ? "grey-out" : "") + (showOptions ? " sidebar-open" : "") }>
            <title>{viewName}</title>
            { viewDescription && <meta name="description" content={viewDescription} />}
            <div className="row">
                <div className="col col-0">
                    <div onTransitionEnd={onTransitionEnd} className="dashboard-sidebar">
                        <ConfigPanel
                            cols={cols}
                            viewType={viewType}
                            view={view}
                            onChartTypeChange={ (type: string) => dispatch({ type: "SET_CHART_TYPE", payload: type }) }
                            onChartOptionsChange={ (payload: Highcharts.Options) => dispatch({ type: "SET_CHART_OPTIONS", payload }) }
                            onRangeOptionsChange={ (payload: app.RangeOptions) => dispatch({ type: "SET_RANGE_OPTIONS", payload }) }
                            onSecondaryDataOptionsChange={ (payload: { column?: string, type?: string }) => dispatch({
                                type: "SET_SECONDARY_DATA_OPTIONS",
                                payload: {
                                    column: payload.column ? cols.find(c => c.name === payload.column) : undefined,
                                    type: payload.type
                                }
                            }) }
                            state={{
                                groupBy   : viewColumn.name,
                                stratifyBy: viewGroupBy?.name || "",
                                filters   : [...filters],
                                xCol      : viewColumn,

                                // @ts-ignore
                                chartType,
                                viewName,
                                viewDescription,
                                chartOptions: state.chartOptions,
                                // chartOptions: finalChartOptions,
                                denominator,
                                column2: column2?.name || "",
                                column2type,
                                tags,
                                ranges: hasRanges(data, data2) ? ranges : null,
                                visualOverrides: state.visualOverrides,
                                inspection: state.inspection,
                                sortBy,
                                limit,
                                offset,
                            }}
                            onChange={state => {
                                dispatch({ type: "UPDATE", payload: {
                                    viewName       : state.viewName,
                                    viewDescription: state.viewDescription,
                                    viewColumn     : cols.find(c => c.name === state.groupBy),
                                    viewGroupBy    : cols.find(c => c.name === state.stratifyBy),
                                    filters        : [...state.filters],
                                    denominator    : state.denominator,
                                    tags           : state.tags,
                                    visualOverrides: state.visualOverrides,
                                    sortBy         : state.sortBy,
                                    limit          : state.limit,
                                    offset         : state.offset
                                }});
                            }}
                        />
                    </div>
                </div>
                <div className="col" style={{ zIndex: 2, position: "relative", justifySelf: "flex-start", minWidth: "26rem", maxWidth: 1200 }}>
                    <div style={{ position: "sticky", top: 2 }}>
                        <GraphBreadcrumbs graph={{ isDraft, name: viewName }} />
                        <GraphTitle value={state.viewName} onChange={ (viewName: string) => dispatch({ type: "MERGE", payload: { viewName }}) } />
                        <hr/>
                        <GraphDescription value={state.viewDescription} onChange={ viewDescription => dispatch({ type: "MERGE", payload: { viewDescription }}) } />
                        <GraphToolbar
                            state={state}
                            dispatch={dispatch}
                            save={save}
                            graph={{ ...view, isDraft }}
                            saving={saving}
                            deleteCommand={deleteCommand}
                            copyCommand={copyCommand}
                            shareCommand={shareCommand}
                        />

                        { !viewColumn && viewType === "overview" && (
                            <AlertError>
                                It looks like the {Terminology.subscription.nameSingular.toLowerCase()} has been updated and this view is no longer compatible
                                with the new data. Please edit this view or delete it and create new one.
                            </AlertError>
                        ) }
                        
                        { viewType === "overview" && turbo && (
                            <Alert color="orange" className="mb-1" icon="fa-solid fa-circle-exclamation">
                                The data is too big to render properly in the chart view. We did our best but there might be some issues.
                                Please change your settings and perhaps add some filters to reduce the data size.
                            </Alert>
                        ) }
                        
                        { loadingDataError && <AlertError style={{ marginTop: 0 }}><b>Error loading data:</b> { loadingDataError + "" }</AlertError> }
                        
                        { viewGroupBy?.name && state.denominator === "count" && filters.some(f => f.left === viewGroupBy.name) && (
                            <Alert color="orange" className="mb-1" icon="fa-solid fa-circle-exclamation">
                                <div style={{ fontFamily: "sans-serif" }}>
                                    You have stratified the data by "{ viewGroupBy.name }" and selected a Stratified Count denominator.
                                    However, you have also applied some filters affecting the "{ viewGroupBy.name }" column. This can make it
                                    impossible to properly compute a stratified count denominator resulting in values grater than 100% on the Y axis!
                                    <p>
                                        <b>To fix this, use different denominator or remove filters on the "{ viewGroupBy.name }" column.</b>
                                    </p>
                                </div>
                            </Alert>
                        )}

                        { viewType === "data" && <>
                            <div className="tab-panel">
                                <span onClick={() => dispatch({ type: "UPDATE", payload: { dataTabIndex: 0 }})} className={"tab" + (dataTabIndex === 0 ? " active" : "")}>Primary Data</span>
                                <span onClick={() => dispatch({ type: "UPDATE", payload: { dataTabIndex: 1 }})} className={"tab" + (dataTabIndex === 1 ? " active" : "")}>Secondary Data</span>
                            </div>
                            { viewType === "data" && dataTabIndex === 0 && <div className="data-view">
                                { loadingData ? <div className="p-1"><Loader msg="Loading chart data..." /></div> : Json(data ) }
                            </div> }
                            { viewType === "data" && dataTabIndex === 1 && <div className="data-view">
                                { loadingData ? <div className="p-1"><Loader msg="Loading chart data..." /></div> : Json(data2) }
                            </div> }
                        </> }

                        { viewColumn && viewType === "overview" && <BaseChart
                            loading={ loadingData }
                            options={ state.chartOptions }
                            visualOverrides={ state.visualOverrides }
                            onInspectionChange={ state.inspection.enabled ? onInspectionChange : undefined }
                            isDraft={ isDraft }
                            contextMenuItems={[
                                {
                                    label: "Save Changes",
                                    execute: () => save(),
                                    icon: <i className="fas fa-save" />,
                                    enabled: view.creatorId === auth.user?.id || requestPermission({ user: auth.user, resource: "Graphs", action: view.id ? "update" : "create" }),
                                },
                                deleteCommand,
                                copyCommand,
                                shareCommand,
                                managePermissionsCmd,
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
                            key={
                                [
                                    chartType,
                                    viewColumn.name,
                                    viewGroupBy?.name || "no_stratifier",
                                    // finalChartOptions.annotations?.length || "",
                                    column2?.name || "no_secondary",
                                    column2type || "no_second_type",
                                    state.chartOptions.chart?.options3d?.enabled ?? false,
                                    (chartType.includes("pie") || chartType.includes("donut")) ? state.chartOptions.chart?.options3d?.alpha : 0,
                                    state.ranges.enabled,
                                    state.ranges.type,
                                    // state.sortBy || "no_sort",
                                    // state.limit || "no_limit",
                                    // state.offset || "no_offset",
                                    // Date.now()
                                ].join(":")
                            }
                        /> }
                        <br/>
                        <CaptionEditor html={caption} onChange={caption => dispatch({ type: "UPDATE", payload: { caption }})}/>
                        <br/>
                        <MetaData subscription={subscription} dataPackage={dataPackage} tags={tags} />
                        <br/>
                        <ActionButtons id={view.id} subscription={subscription} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function ActionButtons({ subscription, id }: { id?: number, subscription?: app.Subscription }) {
    const navigate        = useNavigate();
    const auth            = useAuth();
    const openInAE        = useCommand(new OpenInAnalyticEnvironment(subscription?.id || 0, auth.user))
    const requestLineData = useCommand(new RequestLineLevelData(id || 0, auth.user, navigate))

    if (!subscription) {
        return null
    }

    return (
        <div className="row mb-1 mt-2 middle half-gap wrap">
            <div className="col col-5 mb-1 ml-2 mr-2 responsive bold">
                <CommandButton { ...openInAE } className="btn-blue"/>
            </div>
            <div className="col col-5 mb-1 ml-2 mr-2 responsive bold">
                <CommandButton { ...requestLineData } className="btn-blue"/>
            </div>
        </div>
    )
}

function MetaData({ subscription, dataPackage, tags = [] }: { subscription?: app.Subscription, dataPackage?: DataPackage, tags?: Pick<app.Tag, "id" | "name" | "description">[] }) {
    
    if (subscription) {
        return <div className="row wrap">
            <div className="col col-5 responsive p-1">
                <Grid cols="auto 1fr" gap="0.5rem">
                    <div>
                        <span className="icon material-symbols-outlined color-brand-2">{Terminology.subscription.icon}</span>
                    </div>
                    <div>
                        <b>{Terminology.subscription.nameSingular}</b>
                        <hr className="small mb-05"/>
                        <Link className="link mt-05 subscription-link" to={`/requests/${subscription.id}`}>{ subscription.name }</Link>
                    </div>
                </Grid>
            </div>

            <div className="col col-5 responsive p-1">
                <Grid cols="auto 1fr" gap="0.5rem">
                    <div>
                        <span className="icon material-symbols-outlined color-brand-2">{Terminology.subscriptionGroup.icon}</span>
                    </div>
                    <div>
                        <b>{Terminology.subscriptionGroup.nameSingular}</b>
                        <hr className="small mb-05"/>
                        { subscription.group ?
                            <Link className="link mt-05 ellipsis subscription-group-link" to={`/groups/${subscription.group.id}`} title={ subscription.group.description }>
                                { subscription.group.name }
                            </Link> :
                            <span className="color-muted">GENERAL</span>
                        }
                    </div>
                </Grid>
            </div>

            <div className="col col-5 responsive p-1">
                <Grid cols="auto 1fr" gap="0.5rem">
                    <div>
                        <span className="icon material-symbols-outlined color-brand-2">{Terminology.studyArea.icon}</span>
                    </div>
                    <div>
                        <b className="nowrap">{Terminology.studyArea.namePlural}</b>
                        <hr className="small mb-05"/>
                        <div className="view-study-areas">
                            { subscription.StudyAreas?.length ?
                                subscription.StudyAreas.map((p, i) => (
                                    <div key={i} className="ellipsis">
                                        <Link className="link study-area-link" to={`/study-areas/${p.id}`}>{ p.name }</Link>
                                    </div>
                                )) :
                                <span className="color-muted">None</span>
                            }
                        </div>
                    </div>
                </Grid>
            </div>

            { subscription.dataURL && <div className="col col-5 responsive p-1">
                <Grid cols="auto 1fr" gap="0.5rem">
                    <div>
                        <span className="icon material-symbols-outlined color-brand-2">{Terminology.dataPackage.icon}</span>
                    </div>
                    <div>
                        <b>Data Package</b>
                        <hr className="small mb-05"/>
                        <Link className="link" to={`/packages/${subscription.dataURL}`}>{ humanizeColumnName(subscription.dataURL) }</Link>
                    </div>
                </Grid>
            </div> }

            <div className="col col-5 responsive p-1">
                <Grid cols="auto 1fr" gap="0.5rem">
                    <div>
                        <span className="icon material-symbols-outlined color-brand-2">{Terminology.tag.icon}</span>
                    </div>
                    <div>
                        <b>Tags</b>
                        <hr className="small mb-05"/>
                        <div className="view-tags">{ tags.length ? 
                            tags.map((t, i) => <Tag tag={t} key={i} />) :
                            <span className="color-muted">None</span>
                        }</div>
                    </div>
                </Grid>
            </div>
        </div>
    }

    if (dataPackage) {
        return <div className="row wrap">
            <div className="col col-5 responsive p-1">
                <Grid cols="auto 1fr" gap="0.5rem">
                    <div>
                        <span className="icon material-symbols-outlined color-brand-2">{Terminology.dataPackage.icon}</span>
                    </div>
                    <div>
                        <b>Data Package</b>
                        <hr className="small mb-05"/>
                        <Link className="link" to={`/packages/${dataPackage.id}`}>{ humanizeColumnName(dataPackage.name) }</Link>
                    </div>
                </Grid>
            </div>
            <div className="col col-5 responsive p-1">
                <Grid cols="auto 1fr" gap="0.5rem">
                    <div>
                        <span className="icon material-symbols-outlined color-brand-2">{Terminology.study.icon}</span>
                    </div>
                    <div>
                        <b>Study</b>
                        <hr className="small mb-05"/>
                        <Link to={`/studies/${dataPackage.study}`} className="link">{ humanizeColumnName(dataPackage.study) }</Link>
                    </div>
                </Grid>
            </div>
        </div>
    }

    return null
}
