import moment                               from "moment"
import { Color, merge, Series }             from "highcharts"
import { compareDurations }                 from "./duration"
import { getCountsByTime, lifeTable, logRankTest, SurvivalData } from "./kaplanMeier"
import { getDurationTitle, isDurationTitle }        from "../columnRoles"
import { getConfidenceBands, getSmallGroupsWarning, getSurvivalDataWarnings, setLeftSteps } from "./survivalSeries"

/**
 * The default Y axis title of survival charts
 */
export const SURVIVAL_Y_TITLE = "Survival"

/**
 * Removes the options that survival charts set themselves: the default axis
 * titles (but not ones the user has set) and the left steps of the series,
 * which the user can't change in survival charts. Used when switching from a
 * survival chart to another chart type.
 *
 * TEMPORARY: survival charts write these into the same options that are saved.
 * Once the saved settings are kept apart from the rendered chart, survival
 * charts can apply them to the rendered chart only, and this can go.
 */
export function removeSurvivalOptions(options: Highcharts.Options): Highcharts.Options {
    const xTitle = singleAxis(options.xAxis)?.title?.text, yTitle = singleAxis(options.yAxis)?.title?.text
    const out = merge(options, {
        xAxis: isDurationTitle(xTitle)     ? { title: { text: "" } } : {},
        yAxis: yTitle === SURVIVAL_Y_TITLE ? { title: { text: "" } } : {}
    })
    // merge() keeps arrays by reference, so the series are copied, not changed
    if (options.series) {
        out.series = options.series.map(s => {
            const { step, ...rest } = s as Highcharts.SeriesLineOptions
            return rest as Highcharts.SeriesOptionsType
        })
    }
    return out
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

/**
 * Saved series options, with the properties read from them that only some
 * series types declare
 */
type SavedSeries = Highcharts.SeriesOptionsType & {
    colorByPoint?: boolean
    fillOpacity ?: number
}

/**
 * The options of an axis, if it is a single one. Charts keep one X and one Y
 * axis in their options (only the rendered chart can have more, see
 * withRiskTable), so an array of axes is treated as not set.
 */
function singleAxis<T extends object>(axis: T | T[] | undefined): T | undefined {
    return Array.isArray(axis) ? undefined : axis
}

export function emToPx(em: number) {
    return Math.round(DEFAULT_FONT_SIZE * em) + "px"
}

/**
 * Old charts saved the font sizes of their title, axis labels, axis titles and
 * plot line labels in px. Converts those to em, which scales with the chart's
 * font size (chart.style.fontSize stays in px, because it is what the em sizes
 * are relative to). Saved views are converted once, when they load, so the
 * editors and the chart see em only. Returns a copy.
 */
export function fontSizesToEm(options: Partial<Highcharts.Options>): Partial<Highcharts.Options>
{
    const out = structuredClone(options)
    const styles = [
        out.title?.style as Highcharts.CSSObject | undefined,
        ...[singleAxis(out.xAxis), singleAxis(out.yAxis)].flatMap(axis => [
            axis?.labels?.style,
            axis?.title?.style,
            ...(axis?.plotLines || []).map(l => l.label?.style)
        ])
    ]
    styles.forEach(style => {
        if (style?.fontSize) {
            style.fontSize = lengthToEm(style.fontSize) + "em"
        }
    })
    return out
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

function getPoint({
    row,
    xType,
    denominator,
    isErrorRange,
    isStratified
}: {
    row: [string, number | null, (number | null)?, (number | null)?]
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
        point.low  = row[2] == null ? null : pct(row[2], denominator)
        point.y = point.high = row[3] == null ? null : pct(row[3], denominator)
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
            arr.sort((a, b) => +a - +b);
        }
        else if (xType === "datetime") {
            arr.sort((a, b) => +new Date(a) - +new Date(b));
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
        getSurvivalDataWarnings(xTicks, column, survivalData).forEach(w => exceptions.add(w))
    }

    function addSeries(options: any, secondary = false) {

        const S = serverOptions.series?.find((s: any) => s.id === options.id) as SavedSeries | undefined
        const prev = serverOptions.plotOptions?.[options.type || "series"] ?? {}

        const themeId = serverOptions.custom?.theme || DEFAULT_COLOR_THEME

        const themeColors = COLOR_THEMES.find(t => t.id === themeId)!.colors

        const colors: string[] = S?.colorByPoint ? themeColors : serverOptions.colors as string[] || themeColors

        const color = colors[series.length % colors.length]

        const cfg: any = {
            color: S?.colorByPoint ? undefined : color,
            id: options.id,
        }

        if ((options.type === "area" || options.type === "areaspline") && color) {
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
                    // A missing row is a gap, in the series and in its intervals
                    row: row || [key + "", null, null, null],
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
                    showInLegend: false,
                    zIndex  : secondary ? 0 : 1,
                    data    : ticksToPoints(rows, denominatorCache, { isErrorRange: true, isStratified: true })
                });
            }
        })
    }

    if (data.rowCount) {
        if (!data.stratifier) {
            const denominatorCache = {}
            const name = String(column.label || column.name)
            const id   = "primary-" + name
            const old  = serverOptions.series?.find(s => s.id === id) as SavedSeries | undefined
            const rows = filterOutExceptions({
                rows: data.data[0].rows,
                seriesName: name,
                column,
                exceptions,
                xType
            })

            const seriesData = showSurvival ? toSurvivalPoints() : ticksToPoints(rows, denominatorCache);

            if (type === "pie" && sortBy.startsWith("x:")) {
                seriesData.sort((a, b) => sortBy === "x:asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
            }

            addSeries({
                type,
                id,
                name: old?.name ?? name,
                data: seriesData,
                dataSorting: { enabled: false },
                colorByPoint: (type === "column" || type === "bar") ?
                    old?.colorByPoint === undefined ?
                        data.data.length === 1 && xType === "category" && seriesData.length <= 12 && serverOptions.custom?.theme :
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
                    showInLegend: false,
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

    if (showSurvival) {
        const warning = getSmallGroupsWarning(series)
        if (warning) {
            exceptions.add(warning)
        }
    }

    if (isSurvival) {
        setLeftSteps(series)
    }

    if (showSurvival && survivalBands) {
        getConfidenceBands(series, serverOptions.series).forEach(band => addSeries(band))
    }

    return { series, exceptions }
}

function computeColors(chartType: string, series: any[], options: any)
{
    // What theme is currently being used
    const themeId = options.custom?.theme || DEFAULT_COLOR_THEME

    const themeColors = COLOR_THEMES.find(t => t.id === themeId)!.colors
    
    // Start with the initial colors - from DB or from the theme
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
    const xTitle = singleAxis(options.xAxis)?.title?.text, yTitle = singleAxis(options.yAxis)?.title?.text
    const survivalXTitle = isSurvival && (!xTitle || isDurationTitle(xTitle)) ? getDurationTitle(column) : undefined
    const survivalYTitle = isSurvival && survivalData && !yTitle ? SURVIVAL_Y_TITLE : undefined

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

    // Survival charts: the log-rank test of the curves
    const logRank = isSurvival && survivalData ? logRankTest(
        series
            .filter((s: any) => s.type === "line" && s.data?.some((p: any) => p?.custom?.survival))
            .map((s: any) => s.data.map((p: any) => p?.custom?.survival ?? { atRisk: 0, events: 0 }))
    ) : null

    // The log-rank sentences are suggested as subtitles (custom.subtitleSuggestions),
    // and a subtitle that is one of them is kept up to date, or removed when
    // there is no p-value anymore
    const logRankSentences = logRank ? getLogRankSentences(logRank.p) : null
    const logRankKind = getLogRankSentenceKind(options.subtitle?.text || "")
    const logRankSubtitle = logRankKind ?
        { subtitle: { text: logRankSentences?.[logRankKind] ?? "" } } :
        {}

    const dynamicOptions: Highcharts.Options = {
        chart: {
            zooming: {
                type: xType === 'category' ? undefined : 'x'
            }
        },
        ...logRankSubtitle,
        colors: computeColors(type, series, options),
        title: {
            style: {
                fontSize: (options.title?.style as Highcharts.CSSObject | undefined)?.fontSize ?? "2em"
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
                    fontSize: singleAxis(options.yAxis)?.labels?.style?.fontSize ?? "1em"
                }
            },
            title: {
                ...(survivalYTitle ? { text: survivalYTitle } : {}),
                style: {
                    fontSize: singleAxis(options.yAxis)?.title?.style?.fontSize ?? "1.2em"
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
            formatter: getTooltipFormatter({ xType, column, groupBy, denominator, survivalBands })
        },
        xAxis: {
            type: xType,
            crosshair: !inspection?.enabled && type.includes("line"),
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
                    fontSize: singleAxis(options.xAxis)?.labels?.style?.fontSize ?? "1em"
                }
            },
            title: {
                ...(survivalXTitle ? { text: survivalXTitle } : {}),
                style: {
                    fontSize: singleAxis(options.xAxis)?.title?.style?.fontSize ?? "1em"
                }
            },
        },
        custom: {
            isSurvival: !!isSurvival,
            // Offered in the subtitle field of the config panel
            subtitleSuggestions: logRankSentences ? [logRankSentences.short, logRankSentences.long] : []
        },
        legend: {
            // @ts-ignore - a hack to force highcharts to reflow the legend
            dirty: Date.now(),
            enabled: options.legend?.enabled ?? series.length <= 30,
            // Survival curves show the size of their group, e.g. "SHH (n=16)".
            // Not used when the legend has its own labelFormat.
            labelFormatter() {
                const row = (this as any).options?.data?.find?.((p: any) => p?.custom?.survival)?.custom.survival
                return row ? `${this.name} (n=${row.atRisk.toLocaleString()})` : this.name
            },
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
                        const visible = !target.visible
                        const visMap: Record<string, boolean> = {};
                        target.chart.series.forEach((s: Series) => {
                            // Linked series without a legend item of their
                            // own (e.g. confidence intervals) follow the
                            // series they are linked to
                            const follows = "linkedTo" in s.userOptions && s.userOptions.linkedTo === target.userOptions.id && s.options.showInLegend === false
                            visMap[s.userOptions.id!] = s === target || follows ? visible : s.visible
                        })
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

    preparePlotLines(singleAxis(result.xAxis)?.plotLines || [], "x")
    preparePlotLines(singleAxis(result.yAxis)?.plotLines || [], "y")

    return result
}

/**
 * Gives each plot line of one axis an id, which inspect mode selects it by,
 * and the same id as a class. In inspect mode, the chart finds a clicked line
 * by that class (see getInspectionMatch). Highcharts click events would not
 * do, because Highcharts binds them only when it first draws a line, and a
 * line drawn outside inspect mode never gets them.
 */
function preparePlotLines(
    plotLines: (Highcharts.XAxisPlotLinesOptions | Highcharts.YAxisPlotLinesOptions)[],
    axis: "x" | "y"
) {
    plotLines.forEach((l, i) => {
        const id = `${axis}-axis-plot-line-${i}`
        l.id = id
        l.className = id
    })
}

/**
 * The tooltip of a point: a table with its series, its X value, its count (or
 * survival estimate) and, when available, its range and denominator
 */
function getTooltipFormatter({
    xType,
    column,
    groupBy,
    denominator,
    survivalBands
}: {
    xType         : "category" | "linear" | "datetime"
    column        : app.SubscriptionDataColumn
    groupBy      ?: app.SubscriptionDataColumn
    denominator  ?: app.DenominatorType
    survivalBands?: boolean
}): Highcharts.TooltipFormatterCallbackFunction
{
    return function(ctx): any {
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
            rows.push(`<b>${groupBy.label || groupBy.name}: ${this.series.name}</b><hr/></td></tr>`)
        } else {
            rows.push(`<b>${this.series.name}: ${this.custom?.survival ? "Survival" : "Count"}</b><hr/></td></tr>`)
        }

        // Group -------------------------------------------------------
        rows.push(`<tr><td style="text-align:right">${column.label || column.name}:</td><td style="width: 100%"><b>${x}</b></td></tr>`)

        // Value -------------------------------------------------------
        // Survival ----------------------------------------------------
        const survival = this.custom?.survival
        if (survival) {
            rows.push(
                `<tr><td style="text-align:right">Survival:</td><td style="width: 100%"><b>${Math.round(this.y!)}%</b></td></tr>`,
                `<tr style="opacity:0.6"><td style="text-align:right">At risk:</td><td><b>${roundToPrecision(survival.atRisk, 3).toLocaleString()}</b></td></tr>`,
                `<tr style="opacity:0.6"><td style="text-align:right">Events:</td><td><b>${roundToPrecision(survival.events, 3).toLocaleString()}</b></td></tr>`,
                `<tr style="opacity:0.6"><td style="text-align:right">No event:</td><td><b>${roundToPrecision(survival.censored, 3).toLocaleString()}</b></td></tr>`
            )
            if (survivalBands && survival.ciLow !== null) {
                rows.splice(rows.length - 3, 0,
                    `<tr style="opacity:0.6"><td style="text-align:right">95% CI:</td><td><b>${Math.round(survival.ciLow * 100)}% – ${Math.round(survival.ciHigh * 100)}%</b></td></tr>`
                )
            }
        }

        else if (!this.custom?.isErrorRange) {
            rows.push(
                `<tr><td style="text-align:right">Count:</td>`,
                `<td style="width: 100%"><b>${
                    denominator ?
                        roundToPrecision(this.custom?.data?.cnt, 3).toLocaleString() + " (" + roundToPrecision(this.y!, 3) + "%)" :
                        roundToPrecision(this.y!, 3).toLocaleString()
                }</b></td></tr>`
            )
        }

        // Range -------------------------------------------------------
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
        if (denominator && this.custom?.denominator) {
            rows.push(`<tr style="opacity:0.6"><td style="text-align:right">Denominator:</td><td><b>${roundToPrecision(this.custom.denominator, 2).toLocaleString()}</b></td></tr>`)
        }
        
        return `<table>${rows.join("")}</table>`
    }
}

/**
 * Formats a p-value the way it is usually reported, e.g. "p = 0.04",
 * "p = 0.003" or "p < 0.001"
 */
export function formatPValue(p: number): string
{
    if (p < 0.001) {
        return "p < 0.001"
    }
    return "p = " + p.toFixed(p < 0.01 ? 3 : 2)
}

/**
 * The subtitles a survival chart offers for its log-rank p-value: the result
 * alone, and the same with what it means. Neither judges whether the curves
 * differ, so they never contradict what the chart shows.
 *
 *     "Log-rank test: p = 0.32"
 *     "Differences at least this large would occur by chance 32% of the time
 *      if all groups had the same survival (log-rank p = 0.32)."
 */
export function getLogRankSentences(p: number): { short: string, long: string }
{
    const percent = p < 0.001 ?
        "less than 0.1%" :
        (p < 0.01 ? Number((p * 100).toFixed(1)) : Math.round(p * 100)) + "%"
    return {
        short: `Log-rank test: ${formatPValue(p)}`,
        long : `Differences at least this large would occur by chance ${percent} of the ` +
               `time if all groups had the same survival (log-rank ${formatPValue(p)}).`
    }
}

const P_VALUE = String.raw`p (= (0\.\d{2,3}|1\.00)|< 0\.001)`

/**
 * Which of the log-rank subtitles (see getLogRankSentences) a text is exactly,
 * so it can be kept up to date. Any change to its words makes it the user's.
 */
export function getLogRankSentenceKind(text: string): "short" | "long" | null
{
    if (new RegExp(`^Log-rank test: ${P_VALUE}$`).test(text)) {
        return "short"
    }
    if (new RegExp(
        String.raw`^Differences at least this large would occur by chance (less than 0\.1|\d+(\.\d)?)% of the ` +
        String.raw`time if all groups had the same survival \(log-rank ${P_VALUE}\)\.$`
    ).test(text)) {
        return "long"
    }
    return null
}
