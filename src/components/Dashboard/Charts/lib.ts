import moment                               from "moment"
import { Color, merge, Series }             from "highcharts"
import { compareDurations, parseDuration }  from "./duration"
import { getCountsByTime, lifeTable, SurvivalData } from "./kaplanMeier"
import { getDurationTitle, isDurationTitle }        from "../columnRoles"

/**
 * The default Y axis title of survival charts
 */
export const SURVIVAL_Y_TITLE = "Survival"

/**
 * Removes the default survival axis titles (but not ones the user has set).
 * Used when switching from a survival chart to another chart type.
 */
export function removeSurvivalTitles(options: Highcharts.Options): Highcharts.Options {
    // @ts-ignore
    const xTitle = options.xAxis?.title?.text, yTitle = options.yAxis?.title?.text
    return merge(options, {
        xAxis: isDurationTitle(xTitle)     ? { title: { text: "" } } : {},
        yAxis: yTitle === SURVIVAL_Y_TITLE ? { title: { text: "" } } : {}
    })
}
import Highcharts                           from "../../../highcharts"
import { lengthToEm, roundToPrecision }     from "../../../utils"
import { app }                              from "../../../types"
import {
    SupportedNativeChartTypes,
    SupportedChartTypes,
    DEFAULT_FONT_FAMILY,
    DEFAULT_FONT_SIZE,
    COLOR_THEMES,
    DEFAULT_COLOR_THEME,
    COLOR_DANGER,
    COLOR_SUCCESS,
    CUMULUS__NONE
} from "../config"


type SeriesOptions = (
    Highcharts.SeriesPieOptions |
    Highcharts.SeriesSplineOptions |
    Highcharts.SeriesAreasplineOptions |
    Highcharts.SeriesColumnOptions |
    Highcharts.SeriesBarOptions
);

function escapeHtml(input: string) {
    return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function emToPx(em: number) {
    return Math.round(DEFAULT_FONT_SIZE * em) + "px"
}

export function getChartTitleText(column: app.SubscriptionDataColumn, groupBy?: app.SubscriptionDataColumn | null): string {
    let txt = column.label || column.name
    if (groupBy) {
        txt += ` by ${groupBy.label || groupBy.name}`
    }
    return txt
}

export function getXType(column: app.SubscriptionDataColumn): "category" | "linear" | "datetime" {
    
    let xType: "category" | "linear" | "datetime" = "category";

    if (column.dataType === "integer" || column.dataType === "float") {
        xType = "linear"
    }

    else if (column.dataType.startsWith("date")) {
        xType = "datetime"
    }

    return xType;
}

export function getDateFormat({ dataType }: app.SubscriptionDataColumn, forMoment = false) {
    if (forMoment) {
        return dataType === "date:YYYY" ?
            "YYYY" :
            dataType === "date:YYYY-MM" ?
                "YYYY-MM" :
                "YYYY-MM-DD"    
    }
    return dataType === "date:YYYY" ?
        "%Y" :
        dataType === "date:YYYY-MM" ?
            "%Y-%m" :
            "%Y-%m-%d"
}

/**
 * If no denominator is given returns the value as is. Otherwise, returns the
 * percentage that this value represents from that denominator
 */
export function pct(value: number, denominator?: number) {
    return denominator ? value / denominator * 100 : value
}

/**
 * Returns the denominator value to be used based on the @type argument:
 * - "global" - returns the `totalCount` property of the data object
 */
function getDenominator(data: app.ServerResponses.DataResponse, type: app.DenominatorType, point: [string, number, ...any[]], cache: Record<string, number> = {}) {
    if (type === "global") {
        return data.totalCount
    }
    if (type === "count" && point) {
        return getTotalDenominator(data as app.ServerResponses.StratifiedDataResponse, point)
    }
    if (type === "local" && point) {
        return getLocalDenominator(data as app.ServerResponses.StratifiedDataResponse, point, cache)
    }
    return undefined
}

function getTotalDenominator(data: app.ServerResponses.StratifiedDataResponse, point: [string, number, ...any[]]) {
    return data.counts?.[point[0]]
}

function getLocalDenominator(data: app.ServerResponses.StratifiedDataResponse, point: [string, number, ...any[]], cache: Record<string, number> = {}) {
    let x = point[0], out = cache[x]
    if (!cache.hasOwnProperty(x)) {
        out = cache[x] = data.data.reduce((prev, cur) => prev + (cur.rows.find(r => r[0] === point[0])||[0, 0])[1], 0);
    }
    return out
}

export function filterOutExceptions({
    rows,
    seriesName,
    exceptions,
    column,
    xType
}: {
    rows       : [any, any, any?, any?][]
    seriesName?: string
    xType      : "datetime" | "linear" | "category"
    exceptions : Set<string>
    column     : app.SubscriptionDataColumn
}) {
    return rows.filter(row => {

        function pushException() {
            const x   = row[0]
            const y   = +row[1]
            let msg = y === 1 ? 
                `There is <b>1</b> record ` :
                `There are <b>${y.toLocaleString()}</b> records `;
            if (seriesName) {
                msg += `in the <b>${seriesName}</b> series `
            }
            msg += `where <b>${column.label}</b> `
            
            if (x === CUMULUS__NONE) {
                msg += `is empty in the source data`
            } else {
                msg += `equals <b>${x}</b>`
            }

            exceptions.add(msg)
        }

        if (row[0] === CUMULUS__NONE && seriesName !== CUMULUS__NONE) {
            pushException()
            return false
        }

        if (xType === "linear") {
            const n = +row[0]
            if (isNaN(n) || !isFinite(n)) {
                pushException()
                return false
            }
        }
        else if (xType === "datetime" && !moment(row[0], true).isValid()) {
            pushException()
            return false
        }
        return true
    })
}

// Sort data by Y if so requested by the user. Note that we do not sort in 
// case of X because it only works for category charts. For linear and date
// axises we need to use axis.reversed instead.
// function sortY(rows: any[], sortBy: string, xType: "datetime" | "linear" | "category") {
//     const [col, dir] = sortBy.split(":")
//     if (col === "y" && xType === "category") {
//         rows.sort((a, b) => {
//             let _a = +a[1]
//             let _b = +b[1]    
//             if (isNaN(_a) || !isFinite(_a)) return 0
//             if (isNaN(_b) || !isFinite(_b)) return 0
//             return dir === "desc" ? _b - _a : _a - _b
//         })
//     }
//     return rows
// }

function getPoint({
    row,
    xType,
    denominator,
    isErrorRange,
    isStratified
}: {
    row: [string, number | null, number?, number?]
    xType: "category" | "linear" | "datetime"
    denominator?: number
    isErrorRange?: boolean
    isStratified?: boolean
}): Highcharts.XrangePointOptionsObject {

    // Y values must be numeric or null
    if (row[1] !== null && (isNaN(row[1]) || !isFinite(row[1]))) {
        console.info('Invalid point value "%s". Row: %o', row[1], row)
        throw new Error("Some invalid values detected. See console for details.")
    }

    const point: any = {
        y: row[1] === null ? null : pct(row[1], denominator),

        // The name of the point as shown in the legend, tooltip, dataLabels, etc.
        name: String(row[0]),

        color: !isStratified && xType === "category" ?
            String(row[0]).toLowerCase() === "false" ?
                COLOR_DANGER :
                String(row[0]).toLowerCase() === "true" ?
                    COLOR_SUCCESS :
                    undefined :
            undefined,

        custom: {
            data: {
                cnt    : row[1],
                low    : row[2],
                high   : row[3],
                lowPct : pct(row[2] ?? 0, denominator),
                highPct: pct(row[3] ?? 0, denominator)
            },
            isErrorRange: !!isErrorRange,
            denominator
        }
    };

    if (isErrorRange) {
        point.low  = pct(row[2] ?? 0, denominator)
        point.y = point.high = pct(row[3] ?? 0, denominator)
    }

    // For datetime axes, the X value is the timestamp in milliseconds since 1970.
    if (xType === "datetime") {
        const x = moment(row[0], false)
        if (!x.isValid()) {
            console.log('Invalid date "%s". Row: %o', row[0], row)
            throw new Error("Some invalid dates detected. See console for details.")
        }
        point.x = x.valueOf()
    }

    // For linear (numeric) axes, the X value is the numeric value or 0.
    if (xType === "linear") {
        const x = +row[0]
        if (isNaN(x) || !isFinite(x)) {
            console.log('Invalid number "%s". Row: %o', row[0], row)
            throw new Error("Some non-numeric values detected. See console for details.")
        }
        point.x = x
    }
    
    return point as Highcharts.XrangePointOptionsObject
}

// Build a set of unique X-axis ticks. We need that for our custom
// sort/limit/offset implementation.
function getXAxis({
    xType,
    data,
    data2,
    limit,
    offset,
    sortBy,
    isSurvival
}: {
    xType: "category" | "linear" | "datetime"
    data: app.ServerResponses.DataResponse
    data2: app.ServerResponses.StratifiedDataResponse | null
    limit?: number
    offset?: number
    sortBy?: string
    isSurvival?: boolean
}): string[] {
    const ticks = new Map<string, any>()

    // For stratified charts use the counts object
    if (data?.stratifier) {
        Object.keys((data as app.ServerResponses.StratifiedDataResponse).counts).forEach(key => {
            if (key !== "null" && key !== CUMULUS__NONE) {
                ticks.set(key, data[key])
            }
        })
    }

    if (data2) {
        Object.keys((data2 as app.ServerResponses.StratifiedDataResponse).counts).forEach(key => {
            if (key !== "null" && key !== CUMULUS__NONE) {
                ticks.set(key, data2[key])
            }
        })
    }

    // Normal unstratified data
    if (data?.data && !data.stratifier) {
        (data as app.ServerResponses.UnStratifiedDataResponse).data.forEach(group => group.rows.forEach(r => {
            const k = r[0]
            if (k !== "null" && k !== CUMULUS__NONE) {
                ticks.set(k, r[1])
            }
        }))
    }

    let arr = Array.from(ticks.keys());

    // Survival time always runs forward, and the survival estimate needs every
    // time point, so sortBy, limit and offset do not apply
    if (isSurvival) {
        return arr.sort(compareDurations)
    }

    // At this point we have a set of unique axis labels, but we also need to
    // sort them if this is a category axis
    const [col, dir] = sortBy.split(":")
    if (col === "y" && xType === "category") {
        arr.sort((a, b) => {
            let _a = +ticks.get(a)
            let _b = +ticks.get(b)
            if (isNaN(_a) || !isFinite(_a)) return 0
            if (isNaN(_b) || !isFinite(_b)) return 0
            return dir === "desc" ? _b - _a : _a - _b
        })
    }

    ticks.clear();

    // If we have a stratified chart, xTicks needs to be sorted as it can
    // contain entries from different series that are out of order after
    // being combined in the Set.
    if (data.stratifier || data2) {
        // For category charts we don't allow highcharts to sort the data.
        // However, for other types we need to sort it ourselves
        if (xType === "linear") {
            // @ts-ignore
            arr.sort((a, b) => a - b);
        }
        else if (xType === "datetime") {
            // @ts-ignore
            arr.sort((a, b) => +new Date(a) - +new Date(b));
        }
        else {
            // arr.sort((a, b) => a.localeCompare(b, "en-US", { numeric: true }));
        }
    }

    if (limit || offset) {

        const from = Math.max(offset || 0, 0)
        if (sortBy === "x:desc") { // reversed!
            const end = Math.max(arr.length - from, 0)
            arr = arr.slice(0, end)
            if (limit) {
                arr = arr.slice(Math.max(arr.length - limit, 0));
            }
        } else {
            arr = arr.slice(from, limit ? limit + from : undefined);
        }
    }

    return arr
}

function getSeriesAndExceptions({
    column,
    data,
    data2,
    type,
    denominator,
    column2type,
    serverOptions,
    xType,
    ranges = {},
    sortBy,
    limit,
    offset,
    isSurvival,
    survivalData,
    survivalBands
}: {
    data            : app.ServerResponses.DataResponse
    data2           : app.ServerResponses.StratifiedDataResponse | null
    column          : app.SubscriptionDataColumn
    type            : SupportedNativeChartTypes
    denominator     : app.DenominatorType
    column2type    ?: keyof typeof SupportedChartTypes
    xType           : "category" | "linear" | "datetime"
    serverOptions   : Highcharts.Options
    ranges          : app.RangeOptions
    sortBy          : string
    limit           : number
    offset          : number
    isSurvival     ?: boolean
    survivalData   ?: SurvivalData | null
    survivalBands  ?: boolean
}): { series: SeriesOptions[], exceptions: Set<string> }
{
    let series: SeriesOptions[] = []

    const exceptions: Set<string> = new Set();

    let xTicks = getXAxis({ xType, data, data2, limit, offset, sortBy, isSurvival })

    if (isSurvival) {
        const invalid = xTicks.filter(x => parseDuration(x) === null)
        if (invalid.length) {
            const examples = invalid.slice(0, 3).map(x => `"${escapeHtml(x + "")}"`).join(", ")
            exceptions.add(
                `<b>${escapeHtml(column.label || column.name)}</b> does not look like a duration ` +
                `(found ${examples}${invalid.length > 3 ? ", ..." : ""}), so this will not be a proper survival chart`
            )
        }
        if (!survivalData) {
            exceptions.add("Select a Status Column and an Event Value to compute the survival curve. Showing counts for now.")
        }
        // Usually means the saved Event Value no longer exists in the data
        else if (!survivalData.events.rowCount) {
            const { label, eventValue } = survivalData.status ?? { label: "status", eventValue: "the selected Event Value" }
            exceptions.add(
                `No records have <b>${escapeHtml(label)}</b> equal to <b>${escapeHtml(eventValue)}</b>, ` +
                `so the survival curves cannot drop. Check the Event Value.`
            )
        }
    }

    function addSeries(options: any, secondary = false) {

        const S = serverOptions.series?.find((s: any) => s.id === options.id)
        // @ts-ignore
        const prev = serverOptions.plotOptions?.[options.type || "series"] ?? {}

        // @ts-ignore
        const themeId = serverOptions.custom?.theme || DEFAULT_COLOR_THEME

        const themeColors = COLOR_THEMES.find(t => t.id === themeId)!.colors

        // @ts-ignore
        const colors: string[] = S?.colorByPoint ? themeColors : serverOptions.colors as string[] || themeColors

        const color = colors[series.length % colors.length]

        const cfg: any = {
            // @ts-ignore,
            color: S?.colorByPoint ? undefined : color,
            id: options.id,
        }

        if ((options.type === "area" || options.type === "areaspline") && color) {
            // @ts-ignore
            const fillOpacity = S?.fillOpacity ?? prev.fillOpacity ?? 0.75
            cfg.fillColor = {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, new Color(color).setOpacity(fillOpacity * 1.0).get('rgba') + ""],
                    [1, new Color(color).setOpacity(fillOpacity * 0.2).get('rgba') + ""]
                ]
            }
        }

        if (secondary) {
            if (options.type?.includes("column") && color) {
                cfg.color = {
                    linearGradient: { x1: 1, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, new Color(color).setOpacity(1.0).get('rgba') + ""],
                        [1, new Color(color).setOpacity(0.6).get('rgba') + ""]
                    ]
                }
            }

            // There is a bug in Highcharts that prevents us from rendering hidden series
            // having pattern fills
            // if (options.type.includes("column")) {
            //     cfg.color = {
            //         pattern: {
            //             path: {
            //                 d: 'M 0 0 L 0 6',
            //                 strokeWidth: 11.25
            //             },
            //             width : 6,
            //             height: 6,
            //             patternTransform: 'scale(0.5) rotate(45)'
            //         }
            //     }
            // }

            cfg.stacking = column2type?.includes("columnStack") ? "normal" : undefined
        }

        series.push({
            ...S,
            ...cfg,
            ...options
        });
    }

    function ticksToPoints(rows: [any, any, any?, any?][], denominatorCache: Record<string, any>, pointProps: Record<string, any> = {}) {
        return xTicks.map(key => {
            const row = rows.find(row => row[0] + "" === key + "")
            try {
                return getPoint({
                    row: row || [key + "", null, 0, 0],
                    xType,
                    denominator: getDenominator(data, denominator, row || [key + "", 0, 0, 0], denominatorCache),
                    ...pointProps
                })
            } catch (e) {
                exceptions.add(e.message)
                return null
            }
        })
    }

    // Survival charts: the survival curve (in %) of one series instead of its counts
    function toSurvivalPoints(stratifier?: string) {
        const table = lifeTable(
            xTicks.map(String),
            getCountsByTime(survivalData!.events, stratifier),
            getCountsByTime(survivalData!.censored, stratifier)
        )
        const rows = table.map(r => [r.x, r.survival === null ? null : r.survival * 100] as [string, number | null])
        const points = ticksToPoints(rows, {}, { isStratified: stratifier !== undefined })
        points.forEach((point: any, i) => {
            if (point) point.custom.survival = table[i]
        })
        return points
    }

    const showSurvival = !!(isSurvival && survivalData)

    function stratify(data: app.ServerResponses.StratifiedDataResponse, secondary = false) {

        const denominatorCache = {}
        
        data.data.forEach(group => {
            // The aggregator returns stratifier values with their JSON type,
            // e.g. 12 or true, so they are not always strings
            const stratifier = String(group.stratifier)
            const id   = (secondary ? "secondary-" : "primary-") + stratifier
            const old  = serverOptions.series?.find(s => s.id === id)
            const rows = group.rows

            filterOutExceptions({
                rows,
                seriesName: old?.name ?? stratifier,
                column,
                exceptions,
                xType
            })

            const name = String(old?.name ?? stratifier.replace(CUMULUS__NONE, "none*"))

            addSeries({
                id,
                name,
                type    : secondary ? (column2type || "spline").replace(/(Stack|3d|Stack3d)$/, "") as SupportedNativeChartTypes : type,
                linkedTo: secondary ? "primary-" + stratifier : undefined,
                zIndex  : secondary ? 0 : 1,
                data    : showSurvival && !secondary ?
                    toSurvivalPoints(stratifier) :
                    ticksToPoints(rows, denominatorCache, { isStratified: true })
            }, secondary)

            if (ranges?.enabled && !isSurvival) {
                const _id  = (secondary ? "secondary-" : "primary-") + stratifier + " (range)"
                const old = serverOptions.series?.find(s => s.id === _id)
                addSeries({
                    type    : ranges.type ?? "errorbar",
                    name    : old?.name ?? name + " (range)",
                    id      : _id,
                    linkedTo: id,
                    zIndex  : secondary ? 0 : 1,
                    data    : ticksToPoints(rows, denominatorCache, { isErrorRange: true, isStratified: true })
                });
            }
        })
    }

    if (data.rowCount) {
        if (!data.stratifier) {
            // if (xType === "category" || xType === "linear") {
            //     data.data[0].rows.sort((a, b) => String(a[0]).localeCompare(String(b[0]), "en-US", { numeric: true }))
            // }
            const denominatorCache = {}
            const name = String(column.label || column.name)
            const id   = "primary-" + name
            const old  = serverOptions.series?.find(s => s.id === id)
            const rows = filterOutExceptions({
                rows: data.data[0].rows,
                seriesName: name,
                column,
                exceptions,
                xType
            })

            const seriesData = showSurvival ? toSurvivalPoints() : ticksToPoints(rows, denominatorCache);

            if (type === "pie" && sortBy.startsWith("x:")) {
                // @ts-ignore
                seriesData.sort((a, b) => sortBy === "x:asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
            }

            addSeries({
                type,
                id,
                name: old?.name ?? name,
                data: seriesData,
                dataSorting: { enabled: false },
                colorByPoint: (type === "column" || type === "bar") ?
                    // @ts-ignore
                    old?.colorByPoint === undefined ?
                        // @ts-ignore    
                        data.data.length === 1 && xType === "category" && seriesData.length <= 12 && serverOptions.custom?.theme :
                        // @ts-ignore
                        !!old.colorByPoint :
                    type === "pie",
            });

            if (ranges?.enabled && !isSurvival) {
                const id  = "primary-" + name + " (range)"
                const old = serverOptions.series?.find(s => s.id === id)
                addSeries({
                    type: ranges.type ?? "errorbar",
                    id,
                    name: old?.name ?? name + " (range)",
                    linkedTo: "primary-" + name,
                    dataSorting: { enabled: false },
                    data: rows.map(row => {
                        try {
                            return getPoint({
                                row,
                                xType,
                                denominator: getDenominator(data, denominator, row, denominatorCache),
                                isErrorRange: true
                            })
                        } catch (e) {
                            exceptions.add(e.message)
                            return null
                        }
                    })
                });
            }
        }
        else {
            stratify(data as app.ServerResponses.StratifiedDataResponse)
        }

        if (data2?.rowCount) {
            stratify(data2, true)
        }
    }

    // Survival charts: left steps are the only correct way to draw the curves,
    // even if another step was saved for a series
    if (isSurvival) {
        series.forEach((s: any) => {
            if (s.type === "line") {
                s.step = "left"
            }
        })
    }

    // Survival charts: 95% confidence bands. Added after all the curves, so
    // that they don't shift the colors of the curves.
    if (showSurvival && survivalBands) {
        series.slice().forEach((curve: any) => {
            const id  = curve.id + " (95% CI)"
            // Saved options win over these defaults (addSeries would let
            // anything passed here override them)
            const old: any = serverOptions.series?.find(s => s.id === id)
            addSeries({
                type               : "arearange",
                id,
                name               : old?.name ?? curve.name + " (95% CI)",
                linkedTo           : curve.id,
                color              : curve.color,
                zIndex             : 0,
                step               : "left",
                lineWidth          : old?.lineWidth ?? 0.2,
                fillOpacity        : old?.fillOpacity ?? 0.15,
                connectNulls       : true,
                enableMouseTracking: false,
                marker             : { enabled: false },
                data: curve.data.map((point: any) => {
                    const row = point?.custom?.survival
                    if (!row || row.ciLow === null) {
                        return null
                    }
                    return {
                        ...(point.x !== undefined ? { x: point.x } : {}),
                        name: point.name,
                        low : row.ciLow  * 100,
                        high: row.ciHigh * 100
                    }
                })
            })
        })
    }

    return { series, exceptions }
}

function computeColors(chartType: string, series: any[], options: any)
{
    // @ts-ignore What theme is currently being used
    const themeId = options.custom?.theme || DEFAULT_COLOR_THEME

    const themeColors = COLOR_THEMES.find(t => t.id === themeId)!.colors
    
    // @ts-ignore Start with the initial colors - from DB or from the theme
    const orig = options.colors || themeColors

    // The colors to be used in the current chart
    let colors = [...orig]

    // Do we need to recreate the colors?
    const newLength = Math.max(chartType === "pie" ? series[0]?.data?.length ?? 0 : series.length, 12)
    const oldLength = colors.length
    if (oldLength > newLength) {
        colors = colors.slice(0, newLength)
    } else if (newLength > oldLength) {
        colors = []
        for (let i = 0; i < newLength; i++) {
            colors.push(options.colors?.[i] || themeColors[i % themeColors.length])
        }
    }

    return colors
}

export function buildChartOptions({
    options = {},
    column,
    groupBy,
    data,
    data2,
    denominator = "",
    type,
    column2type,
    onSeriesToggle = () => {},
    ranges = {},
    onInspectionChange = () => {},
    inspection,
    sortBy,
    limit,
    offset,
    isSurvival,
    survivalData,
    survivalBands
}: {
    data               : app.ServerResponses.DataResponse
    data2              : app.ServerResponses.StratifiedDataResponse | null
    options           ?: Highcharts.Options
    column             : app.SubscriptionDataColumn
    groupBy           ?: app.SubscriptionDataColumn
    type               : SupportedNativeChartTypes
    denominator       ?: app.DenominatorType
    column2type       ?: keyof typeof SupportedChartTypes
    onSeriesToggle    ?: (s: Record<string, boolean>) => void
    ranges            ?: app.RangeOptions
    inspection        ?: app.Inspection
    sortBy             : string
    limit              : number
    offset             : number
    onInspectionChange?: (inspection: string[], context: Partial<app.InspectionContext>) => void
    isSurvival        ?: boolean
    survivalData      ?: SurvivalData | null
    survivalBands     ?: boolean
}): Highcharts.Options
{
    const xType = getXType(column);

    // Survival charts have no denominator, even if one was saved
    if (isSurvival) {
        denominator = ""
    }

    // Survival curves are shown as % of each series
    const isPercent = !!denominator || !!(isSurvival && survivalData)

    // Survival charts: default axis titles, unless the user has set their own
    // @ts-ignore
    const xTitle = options.xAxis?.title?.text, yTitle = options.yAxis?.title?.text
    const survivalXTitle = isSurvival && (!xTitle || isDurationTitle(xTitle)) ? getDurationTitle(column) : undefined
    const survivalYTitle = isSurvival && survivalData && !yTitle ? SURVIVAL_Y_TITLE : undefined

    // const is3d = !!options.chart?.options3d?.enabled

    const { series, exceptions } = getSeriesAndExceptions({
        data,
        // Survival charts have no secondary data, even if some was saved
        data2: isSurvival ? null : data2,
        column,
        type,
        denominator,
        column2type,
        xType,
        serverOptions: options,
        ranges,
        sortBy,
        limit,
        offset,
        isSurvival,
        survivalData,
        survivalBands
    });

    const [col, dir] = (sortBy || "").split(":")

    const maxPointLength = Math.max(...series.map(s => s.data!.length))

    const dynamicOptions: Highcharts.Options = {
        chart: {
            zooming: {
                type: xType === 'category' ? undefined : 'x'
            }
        },
        colors: computeColors(type, series, options),
        title: {
            style: {
                // @ts-ignore
                fontSize: lengthToEm(options.title?.style?.fontSize ?? "2em") + "em"
            }
        },
        yAxis: {
            allowDecimals: isPercent,
            // Survival is always shown on a full 0-100% axis
            softMin: isSurvival && survivalData ? 0   : undefined,
            softMax: isSurvival && survivalData ? 100 : undefined,
            labels: {
                format: isPercent ? "{text}%" : "{text}",
                style: {
                    // @ts-ignore
                    fontSize: lengthToEm(options.yAxis?.labels?.style?.fontSize ?? "1em") + "em"
                }
            },
            title: {
                ...(survivalYTitle ? { text: survivalYTitle } : {}),
                style: {
                    // @ts-ignore
                    fontSize: lengthToEm(options.yAxis?.title?.style?.fontSize ?? "1.2em") + "em"
                }
            }
        },
        plotOptions: {
            series: {
                events: {
                    click: inspection?.enabled ? function(e) {
                        onInspectionChange(["series"], { selectedSeriesId: e.point.series.options.id })
                    } : undefined
                },
                dataLabels: {
                    // @ts-ignore
                    // enabled: options.plotOptions?.series?.dataLabels?.enabled ?? (!groupBy && maxPointLength <= 30)
                    enabled: (!groupBy && !denominator && maxPointLength <= 20 && ["bar", "column", "pie"].includes(type)),
                    formatter() {
                        return this.y.toLocaleString('en-US');
                    }
                }
            },
            pie: {
                dataLabels: {
                    style: {
                        fontSize  : options.chart?.style?.fontSize   ?? emToPx(1),
                        fontFamily: options.chart?.style?.fontFamily ?? DEFAULT_FONT_FAMILY
                    },
                    formatter(): any {
                        return `<span style="font-weight:500">${this.name}</span><span style="opacity:0.5;font-weight:400">` +
                            ` - ${parseFloat((this.percentage || 0).toPrecision(2))} %</span>`
                    }
                }
            },
            areasplinerange: {
                states: {
                    hover: {
                        enabled: !!inspection?.enabled // No hover on ranges normally
                    }
                }
            }
        },
        tooltip: {
            enabled: !inspection?.enabled,
            style: {
                fontSize  : options.chart?.style?.fontSize   ?? emToPx(1),
                fontFamily: options.chart?.style?.fontFamily ?? DEFAULT_FONT_FAMILY
            },
            formatter(ctx): any {
                const rows = [];

                let x: any
                if (xType === "datetime") {
                    x = this.name//moment(this.point.x).format("YYYY-MM-DD")
                } else if (xType === "linear") {
                    x = this.x
                } else {
                    x = this.name
                }

                // Bullet ------------------------------------------------------
                rows.push(`<tr><td colspan="2"><b style="color:${
                    // @ts-ignore
                    this.color?.pattern?.color || this.series?.color?.stops?.[0]?.[1] || this.color ||
                    ctx.chart.options.colors?.[this.series.index % ctx.chart.options.colors.length] || "#888888"
                };-webkit-text-stroke:0.5px rgba(0, 0, 0, 0.5);">◉</b> `)
                
                // Header ------------------------------------------------------
                if (groupBy) {
                    // rows.push(`<tr><td style="text-align:right">X:</td><td style="width: 100%"><b>${x}</b></td></tr>`)
                    rows.push(`<b>${groupBy.label || groupBy.name}: ${this.series.name}</b><hr/></td></tr>`)
                } else {
                    // @ts-ignore
                    rows.push(`<b>${this.series.name}: ${this.custom?.survival ? "Survival" : "Count"}</b><hr/></td></tr>`)
                }
                //     rows.push(`<b>${x}</b><hr/></td></tr>`)
                // } else {
                //     rows.push(`<b>${x}</b><hr/></td></tr>`)
                //     // rows.push(`<b>${this.point.series.name}</b><hr/></td></tr>`)
                // }

                // rows.push(`<tr><td>${this.point.series.name}</td><td>${groupBy}</td></tr>`)

                // Group -------------------------------------------------------
                // if (groupBy) {
                    rows.push(`<tr><td style="text-align:right">${column.label || column.name}:</td><td style="width: 100%"><b>${x}</b></td></tr>`)
                // }

                // Value -------------------------------------------------------
                // Survival ----------------------------------------------------
                // @ts-ignore
                const survival = this.custom?.survival
                if (survival) {
                    rows.push(
                        `<tr><td style="text-align:right">Survival:</td><td style="width: 100%"><b>${roundToPrecision(this.y!, 3)}%</b></td></tr>`,
                        `<tr style="opacity:0.6"><td style="text-align:right">At risk:</td><td><b>${roundToPrecision(survival.atRisk, 3).toLocaleString()}</b></td></tr>`,
                        `<tr style="opacity:0.6"><td style="text-align:right">Events:</td><td><b>${roundToPrecision(survival.events, 3).toLocaleString()}</b></td></tr>`,
                        `<tr style="opacity:0.6"><td style="text-align:right">No event:</td><td><b>${roundToPrecision(survival.censored, 3).toLocaleString()}</b></td></tr>`
                    )
                    if (survivalBands && survival.ciLow !== null) {
                        rows.splice(rows.length - 3, 0,
                            `<tr style="opacity:0.6"><td style="text-align:right">95% CI:</td><td><b>${roundToPrecision(survival.ciLow * 100, 3)}% – ${roundToPrecision(survival.ciHigh * 100, 3)}%</b></td></tr>`
                        )
                    }
                }

                // @ts-ignore
                else if (!this.custom?.isErrorRange) {
                    rows.push(
                        `<tr><td style="text-align:right">Count:</td>`,
                        `<td style="width: 100%"><b>${
                            denominator ?
                                // @ts-ignore
                                roundToPrecision(this.custom?.data?.cnt, 3).toLocaleString() + " (" + roundToPrecision(this.y!, 3) + "%)" :
                                roundToPrecision(this.y!, 3).toLocaleString()
                        }</b></td></tr>`
                    )
                }

                // Range -------------------------------------------------------
                // @ts-ignore
                const { data: { low, high, lowPct, highPct } = {}, denominator: d } = this.custom || {}

                if (high !== undefined && low !== undefined) {
                    if (denominator && d) {
                        rows.push(
                            `<tr style="opacity:0.6"><td style="text-align:right">Range:</td>` +
                            `<td style="width: 100%"><b>${roundToPrecision(lowPct, 2) + "%"} - ${roundToPrecision(highPct, 2) + "%"}</b></td></tr>`
                        )
                    } else {
                        rows.push(
                            `<tr style="opacity:0.6"><td style="text-align:right">Range:</td>` +
                            `<td style="width: 100%"><b>${roundToPrecision(low, 2).toLocaleString()} - ${roundToPrecision(high, 2).toLocaleString()}</b></td></tr>`
                        )
                    }
                }

                // Denominator -------------------------------------------------
                // @ts-ignore
                if (denominator && this.custom?.denominator) {
                    // @ts-ignore
                    rows.push(`<tr style="opacity:0.6"><td style="text-align:right">Denominator:</td><td><b>${roundToPrecision(this.custom.denominator, 2).toLocaleString()}</b></td></tr>`)
                }
                
                return `<table>${rows.join("")}</table>`
            }
        },
        xAxis: {
            type: xType,
            crosshair: !inspection?.enabled && type.includes("line"),
            // reversed: false,//dir === "desc",//type === "bar" || sortBy === "x:desc",
            // reversed: col === "x" ? (type === "bar" ? true : dir === "asc") : false,
            // reversed: type === "bar" && dir !== "desc",
            reversed: (() => {
                // Survival time always runs left to right
                if (isSurvival) {
                    return false;
                }

                if (col !== 'x') {
                    return undefined;
                }

                if (xType !== 'category') {
                    return dir === (type === 'bar' ? 'asc' : 'desc');
                }

                return dir === (type === 'bar' ? 'desc' : 'asc');
            })(),
            labels: {
                style: {
                    // @ts-ignore
                    fontSize: lengthToEm(options.xAxis?.labels?.style?.fontSize ?? "1em") + "em"
                }
            },
            title: {
                ...(survivalXTitle ? { text: survivalXTitle } : {}),
                style: {
                    // @ts-ignore
                    fontSize: lengthToEm(options.xAxis?.title?.style?.fontSize ?? "1em") + "em"
                }
            },
        },
        // @ts-ignore - lets the inspectors tell survival charts apart
        custom: {
            isSurvival: !!isSurvival
        },
        legend: {
            // @ts-ignore - a hack to force highcharts to reflow the legend
            dirty: Date.now(),
            enabled: options.legend?.enabled ?? series.length <= 30,
            events: {
                // Series visibility is kept in the chart options (so that it
                // is saved), so the default toggle is replaced with a state
                // update. Only this event can prevent the default toggle in
                // Highcharts 13; series.events.legendItemClick fires after it.
                itemClick(e) {
                    // Points (e.g. pie slices) keep the default behavior
                    if ("series" in e.legendItem) {
                        return
                    }
                    e.preventDefault()
                    if (!inspection?.enabled) {
                        const target = e.legendItem as Series
                        const visMap: Record<string, boolean> = {};
                        target.chart.series.forEach((s: Series) => visMap[s.userOptions.id!] = s === target ? !s.visible : s.visible)
                        onSeriesToggle(visMap)
                    }
                }
            }
        },
        series
    };

    const result = merge(options, dynamicOptions) as Highcharts.Options

    result.caption = { text: "" };

    if (exceptions.size) {
        let exceptionsArray = Array.from(exceptions);
        if (exceptionsArray.length > 3) {
            console.log(
                `Chart data warnings for chart "%c${result.title.text}%c":\n    ⚠️ ${exceptionsArray.join("\n    ⚠️ ").replace(/<.+?>/g, '')}`,
                "font-weight: bold",
                "font-weight: normal"
            )
            exceptionsArray = exceptionsArray.slice(0, 3)
            exceptionsArray.push("More errors detected! See console for the full list.")
        }
        result.caption = {
            text: "⚠️ " + exceptionsArray.join("<br />⚠️ "),
            margin: 0,
            style: {
                color: "#BB0000",
                fontSize: "0.9em"
            }
        }
    }

    // Convert px to em in old chart annotations
    result.annotations?.[0]?.labels?.forEach((l, i) => {
        l.style!.fontSize   = options.chart?.style?.fontSize
        l.style!.fontFamily = options.chart?.style?.fontFamily
        l.useHTML           = false 
        l.className         = `annotation-index-${i}`
    })
    if (inspection?.enabled && result.annotations?.[0]) {
        result.annotations[0].events = {
            // @ts-ignore
            click: function(e: any) {
                onInspectionChange(["annotation"], {
                    selectedAnnotationIndex: +(
                        e.target.parentElement?.classList?.value?.match(/\bannotation-index-(\d+)\b/)?.[1] ||
                        -1
                    )
                })
            }
        }
    }

    // @ts-ignore Convert px to em in old chart xAxis plotLines
    const xAxisPlotLines = (result.xAxis?.plotLines || []) as XAxisPlotLinesOptions[];
    xAxisPlotLines.forEach((l, i) => {
        if (l.label?.style?.fontSize) {
            l.label.style.fontSize = lengthToEm(l.label.style.fontSize) + "em"
        }
        l.id = `x-axis-plot-line-${i}`
        if (inspection?.enabled) {
            l.events = {
                click: function() {
                    onInspectionChange(["plotLine"], {
                        selectedPlotLineId: this.id,
                        selectedPlotLineAxis: "x"
                    })
                }
            }
        }
    })

    // @ts-ignore Convert px to em in old chart yAxis plotLines
    const yAxisPlotLines = (result.yAxis?.plotLines || []) as YAxisPlotLinesOptions[];
    yAxisPlotLines.forEach((l, i) => {
        if (l.label?.style?.fontSize) {
            l.label.style.fontSize = lengthToEm(l.label.style.fontSize) + "em"
        }
        l.id = `y-axis-plot-line-${i}`
        if (inspection?.enabled) {
            l.events = {
                click: function() {
                    onInspectionChange(["plotLine"], {
                        selectedPlotLineId: this.id,
                        selectedPlotLineAxis: "y"
                    })
                }
            }
        }
    })

    return result
}
