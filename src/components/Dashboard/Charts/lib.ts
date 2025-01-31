import moment                               from "moment"
import Highcharts, { Color, merge, Series } from "../../../highcharts"
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
    COLOR_SUCCESS
} from "../config"


type SeriesOptions = (
    Highcharts.SeriesPieOptions |
    Highcharts.SeriesSplineOptions |
    Highcharts.SeriesAreasplineOptions |
    Highcharts.SeriesColumnOptions |
    Highcharts.SeriesBarOptions
);

function emToPx(em: number) {
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

function pct(value: number, denominator?: number) {
    return denominator ? value / denominator * 100 : value
}

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

function filterOutExceptions({
    rows,
    seriesName,
    exceptions,
    column,
    xType
}: {
    rows       : [any, any, any?, any?][]
    seriesName?: string
    xType      : "datetime" | "linear" | "category"
    exceptions : string[]
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
            
            if (x === "cumulus__none") {
                msg += `is empty in the source data`
            } else {
                msg += `equals <b>${x}</b>`
            }

            if (!exceptions.includes(msg)) {
                exceptions.push(msg)
            }
        }

        if (row[0] === "cumulus__none") {
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
function sortY(rows: any[], sortBy: string, xType: "datetime" | "linear" | "category") {
    const [col, dir] = sortBy.split(":")
    if (col === "y" && xType === "category") {
        rows.sort((a, b) => {
            let _a = +a[1]
            let _b = +b[1]    
            if (isNaN(_a) || !isFinite(_a)) return 0
            if (isNaN(_b) || !isFinite(_b)) return 0
            return dir === "desc" ? _b - _a : _a - _b
        })
    }
    return rows
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
    offset
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
}): { series: SeriesOptions[], exceptions: [any, any, any?, any?][] }
{
    let series: SeriesOptions[] = []

    const exceptions: any[] = [];

    // Collect all the unique X coordinates so that we can limit & offset
    const xAxis = new Set<string>()

    let xTicks: string[] = [];

    function getPoint({
        row,
        xType,
        denominator,
        isErrorRange
    }: {
        row: [string, number | null, number?, number?]
        xType: "category" | "linear" | "datetime"
        denominator?: number
        isErrorRange?: boolean
    }): Highcharts.XrangePointOptionsObject | number | number[] | null {
    
        if (row[1] !== null && (isNaN(row[1]) || !isFinite(row[1]))) {
            const msg = "Some invalid values detected. See console for details."
            if (!exceptions.includes(msg)) {
                exceptions.push(msg)
            }
            console.info('Invalid point value "%s". Row: %o', row[1], row)
            return null
        }
    
        const point: any = {
            y: row[1] === null ? null : pct(row[1], denominator),
    
            // The name of the point as shown in the legend, tooltip, dataLabels, etc.
            name: String(row[0]),

            color: xType === "category" ?
                row[0] + "" === "false" ?
                    COLOR_DANGER :
                    row[0] + "" === "true" ?
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
                const msg = "Some invalid dates detected. See console for details."
                if (!exceptions.includes(msg)) {
                    exceptions.push(msg)
                }
                console.log('Invalid date "%s". Row: %o', row[0], row)
                return null
            }
            point.x = x.valueOf()
        }
    
        // For linear (numeric) axes, the X value is the numeric value or 0.
        if (xType === "linear") {
            const x = +row[0]
            if (isNaN(x) || !isFinite(x)) {
                const msg = "Some non-numeric values detected. See console for details."
                if (!exceptions.includes(msg)) {
                    exceptions.push(msg)
                }
                console.log('Invalid number "%s". Row: %o', row[0], row)
                return null
            }
            point.x = x
        }
        
        return point as Highcharts.XrangePointOptionsObject
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
            id: options.id
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

    function stratify(data: app.ServerResponses.StratifiedDataResponse, secondary = false) {

        const _type = secondary ? (column2type || "spline").replace(/(Stack|3d|Stack3d)$/, "") as SupportedNativeChartTypes : type;

        const denominatorCache = {}

        data.data.forEach(group => {
            if (xType === "category" || xType === "linear") {
                group.rows.sort((a, b) => String(a[0]).localeCompare(String(b[0]), "en-US", { numeric: true }))
            }
            filterOutExceptions({ rows: group.rows, seriesName: group.stratifier, column, exceptions, xType })
            .forEach(row => {
                if (!secondary) {
                    xAxis.add(row[0] + "")
                }
            })
        })

        xTicks = Array.from(xAxis)

        // For category charts we don't allow highcharts to sort the data.
        // However, for other types we need to sort it ourselves
        if (xType === "linear") {
            // @ts-ignore
            xTicks.sort((a, b) => a - b);
        }
        else if (xType === "datetime") {
            // @ts-ignore
            xTicks.sort((a, b) => +new Date(a) - +new Date(b));
        }
        else {
            xTicks.sort((a, b) => a.localeCompare(b, "en-US", { numeric: true }));
        }
        
        data.data.forEach(group => {
            const id   = (secondary ? "secondary-" : "primary-") + group.stratifier
            const old  = serverOptions.series?.find(s => s.id === id)
            const rows = sortY(group.rows, sortBy, xType)

            addSeries({
                id,
                name       : String(old?.name ?? group.stratifier),
                type       : _type,
                linkedTo   : secondary ? "primary-" + group.stratifier : undefined,
                zIndex     : secondary ? 0 : 1,
                data       : xTicks.map(key => {
                    const row = rows.find(row => row[0] + "" === key)
                    return getPoint({
                        row: row || [key + "", null, 0, 0],
                        xType,
                        denominator: getDenominator(data, denominator, row || [key + "", 0, 0, 0], denominatorCache)
                    })
                })
            }, secondary)

            if (ranges?.enabled) {
                const _id  = (secondary ? "secondary-" : "primary-") + group.stratifier + " (range)"
                const old = serverOptions.series?.find(s => s.id === _id)
                addSeries({
                    type    : ranges.type ?? "errorbar",
                    name    : old?.name ?? group.stratifier + " (range)",
                    id      : _id,
                    linkedTo: id,
                    zIndex  : secondary ? 0 : 1,
                    data    : xTicks.map(key => {
                        const row = rows.find(row => row[0] + "" === key)
                        return getPoint({
                            row: row || [key + "", null, 0, 0],
                            xType,
                            denominator: getDenominator(data, denominator, row || [key + "", 0, 0, 0], denominatorCache),
                            isErrorRange: true
                        })
                    })
                });
            }
        })
    }

    if (data.rowCount) {
        if (!data.stratifier) {
            if (xType === "category" || xType === "linear") {
                data.data[0].rows.sort((a, b) => String(a[0]).localeCompare(String(b[0]), "en-US", { numeric: true }))
            }
            const denominatorCache = {}
            const name = String(column.label || column.name)
            const id   = "primary-" + name
            const old  = serverOptions.series?.find(s => s.id === id)
            const rows = sortY(filterOutExceptions({ rows: data.data[0].rows, seriesName: name, column, exceptions, xType }), sortBy, xType)

            const seriesData = rows.map(row => {
                xAxis.add(row[0] + "")
                return getPoint({
                    row,
                    xType,
                    denominator: getDenominator(data, denominator, row, denominatorCache),
                })
            })

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
                // @ts-ignore
                colorByPoint: old?.colorByPoint === undefined ?
                    // @ts-ignore    
                    data.data.length === 1 && xType === "category" && seriesData.length <= 12 && serverOptions.custom?.theme :
                    // @ts-ignore
                    !!old.colorByPoint,
            });

            xTicks = Array.from(xAxis)

            if (ranges?.enabled) {
                const id  = "primary-" + name + " (range)"
                const old = serverOptions.series?.find(s => s.id === id)
                addSeries({
                    type: ranges.type ?? "errorbar",
                    id,
                    name: old?.name ?? name + " (range)",
                    linkedTo: "primary-" + name,
                    dataSorting: { enabled: false },
                    data: rows.map(row => getPoint({
                        row,
                        xType,
                        denominator: getDenominator(data, denominator, row, denominatorCache),
                        isErrorRange: true
                    }))
                });
            }
        }
        else {
            stratify(data as app.ServerResponses.StratifiedDataResponse)
        }

        if (data2?.rowCount) {
            stratify(data2, true)
        }

        if (limit || offset) {

            const from = Math.max(offset || 0, 0)
            if (sortBy === "x:desc") { // reversed!
                const end = Math.max(xTicks.length - from, 0)
                xTicks = xTicks.slice(0, end)
                if (limit) {
                    xTicks = xTicks.slice(Math.max(xTicks.length - limit, 0));
                }
            } else {
                xTicks = xTicks.slice(from, limit ? limit + from : undefined);
            }

            series.forEach(s => {
                s.data = s.data!.filter((p: any) => xTicks.includes(p.name))
            })
        }
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
    onSeriesToggle,
    ranges = {},
    onInspectionChange,
    inspection,
    sortBy,
    limit,
    offset
}: {
    data              : app.ServerResponses.DataResponse
    data2             : app.ServerResponses.StratifiedDataResponse | null
    options          ?: Highcharts.Options
    column            : app.SubscriptionDataColumn
    groupBy          ?: app.SubscriptionDataColumn
    type              : SupportedNativeChartTypes
    denominator      ?: app.DenominatorType
    column2type      ?: keyof typeof SupportedChartTypes
    onSeriesToggle    : (s: Record<string, boolean>) => void
    ranges            : app.RangeOptions
    inspection        : app.Inspection
    sortBy            : string
    limit             : number
    offset            : number
    onInspectionChange: (inspection: string[], context: Partial<app.InspectionContext>) => void
}): Highcharts.Options
{
    const xType = getXType(column);

    // const is3d = !!options.chart?.options3d?.enabled

    const { series, exceptions } = getSeriesAndExceptions({
        data,
        data2,
        column,
        type,
        denominator,
        column2type,
        xType,
        serverOptions: options,
        ranges,
        sortBy,
        limit,
        offset
    });

    const [col, dir] = (sortBy || "").split(":")

    const dynamicOptions: Highcharts.Options = {
        chart: {
            // @ts-ignore
            // marginTop: type === "pie" || options.title?.text ? undefined : 40,
            // options3d: {
            //     depth: options.chart?.options3d?.depth ?? Math.min(series.length * 10, 100),
            // },
            // plotBorderWidth: is3d ? 0 : options.chart?.plotBorderWidth,
            animation: false
        },
        colors: computeColors(type, series, options),
        title: {
            style: {
                fontSize: lengthToEm(options.title?.style?.fontSize ?? "2em") + "em"
            }
        },
        yAxis: {
            allowDecimals: denominator ? true : false,
            labels: {
                format: denominator ? "{text}%" : "{text}",
                style: {
                    // @ts-ignore
                    fontSize: lengthToEm(options.yAxis?.labels?.style?.fontSize ?? "0.85em") + "em"
                }
            },
            title: {
                style: {
                    // @ts-ignore
                    fontSize: lengthToEm(options.yAxis?.title?.style?.fontSize) + "em"
                }
            }
        },
        plotOptions: {
            series: {
                animation: false,
                events: {
                    click: inspection.enabled ? function(e) {
                        onInspectionChange(["series"], { selectedSeriesId: e.point.series.options.id })
                    } : undefined,
                    legendItemClick(e) {
                        e.preventDefault()
                        if (!inspection.enabled) {
                            const visMap: Record<string, boolean> = {};
                            e.target.chart.series.forEach((s: Series) => visMap[s.userOptions.id!] = s === e.target ? !s.visible : s.visible)
                            onSeriesToggle(visMap)
                        }
                    }
                },
                dataSorting: { enabled: false },
                states: {
                    hover: {
                        opacity: 1
                    }
                }
            },
            pie: {
                dataLabels: {
                    useHTML: true,
                    style: {
                        fontSize  : options.chart?.style?.fontSize   ?? emToPx(0.85),
                        fontFamily: options.chart?.style?.fontFamily ?? DEFAULT_FONT_FAMILY
                    },
                    formatter(): any {
                        if (this.point) {
                            return `<span style="font-weight:500">${this.point.name}</span><span style="opacity:0.5;font-weight:400">` +
                                ` - ${parseFloat((this.point.percentage || 0).toPrecision(2))} %</span>`
                        }
                    }
                }
            },
            areasplinerange: {
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                },
                states: {
                    hover: {
                        enabled: !!inspection.enabled // No hover on ranges normally
                    }
                }
            }
        },
        tooltip: {
            borderColor: "rgba(0, 0, 0, 0.4)",
            backgroundColor: "#FFFFFFEE",
            outside: false,
            hideDelay: 100,
            enabled: !inspection.enabled,
            style: {
                fontSize  : options.chart?.style?.fontSize   ?? emToPx(0.85),
                fontFamily: options.chart?.style?.fontFamily ?? DEFAULT_FONT_FAMILY
            },
            formatter(ctx): any {
                const rows = [];

                let x: any
                if (xType === "datetime") {
                    x = this.point.name//moment(this.point.x).format("YYYY-MM-DD")
                } else if (xType === "linear") {
                    x = this.point.x
                } else {
                    x = this.point.name
                }

                // Bullet ------------------------------------------------------
                rows.push(`<tr><td colspan="2"><b style="color:${
                    // @ts-ignore
                    this.point.color?.pattern?.color || this.point.series?.color?.stops?.[0]?.[1] || this.point.color ||
                    ctx.chart.options.colors?.[this.point.series.index % ctx.chart.options.colors.length] || "#888888"
                };-webkit-text-stroke:0.5px rgba(0, 0, 0, 0.5);">◉</b> `)
                
                // Header ------------------------------------------------------
                if (groupBy) {
                    // rows.push(`<tr><td style="text-align:right">X:</td><td style="width: 100%"><b>${x}</b></td></tr>`)
                    rows.push(`<b>${groupBy.label || groupBy.name}: ${this.point.series.name}</b><hr/></td></tr>`)
                } else {
                    rows.push(`<b>${this.point.series.name}: Count</b><hr/></td></tr>`)
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
                // @ts-ignore
                if (!this.point.custom?.isErrorRange) {
                    rows.push(
                        `<tr><td style="text-align:right">Count:</td>`,
                        `<td style="width: 100%"><b>${
                            denominator ?
                                // @ts-ignore
                                roundToPrecision(this.point.custom?.data?.cnt, 3).toLocaleString() + " (" + roundToPrecision(this.point.y!, 3) + "%)" :
                                roundToPrecision(this.point.y!, 3).toLocaleString()
                        }</b></td></tr>`
                    )
                }

                // Range -------------------------------------------------------
                // @ts-ignore
                const { data: { low, high, lowPct, highPct } = {}, denominator: d } = this.point.custom || {}

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
                if (denominator && this.point.custom?.denominator) {
                    // @ts-ignore
                    rows.push(`<tr style="opacity:0.6"><td style="text-align:right">Denominator:</td><td><b>${roundToPrecision(this.point.custom.denominator, 2).toLocaleString()}</b></td></tr>`)
                }
                
                return `<table>${rows.join("")}</table>`
            }
        },
        xAxis: {
            type: xType,
            crosshair: !inspection.enabled && type.includes("line"),
            // reversed: false,//dir === "desc",//type === "bar" || sortBy === "x:desc",
            // reversed: col === "x" ? (type === "bar" ? true : dir === "asc") : false,
            // reversed: type === "bar" && dir !== "desc",
            reversed: (() => {
                if (type === "bar") {
                    return col === "y" || (col === "x" && dir === "asc")
                }
                if (col === "x") {
                    return dir === "desc"
            //         if (xType === "category") {
            //             return type === "bar" ? dir === "asc" : dir === "desc"
            //         }
            //         if (xType === "datetime") {
            //             return type === "bar" ? dir === "asc" : dir === "desc"
            //         }
            //         if (xType === "linear") {
            //             return type === "bar" ? dir === "asc" : dir === "desc"
            //         }
                }
                return false
            })(),
            labels: {
                autoRotation: [-45, -90],
                // formatter() {
                //     return ellipsis(this.value + "", 20)
                // },
                style: {
                    // @ts-ignore
                    fontSize: lengthToEm(options.xAxis?.labels?.style?.fontSize ?? "0.85em") + "em"
                }
            },
            title: {
                style: {
                    // @ts-ignore
                    fontSize: lengthToEm(options.xAxis?.title?.style?.fontSize ?? "1em") + "em"
                }
            },
        },
        legend: {
            useHTML: false,
            // @ts-ignore - a hack to force highcharts to reflow the legend
            dirty: Date.now()
        },
        lang: {
            noData: `
                <text x="180" y="30" text-anchor="middle" fill="#C30F" stroke="#FFF6" stroke-width="0.5" style="font-size:20px; font-weight:900">No data to display!</text>
                <text x="180" y="50" text-anchor="middle" fill="#888C" stroke="#FFF6" stroke-width="0.5" style="font-size:15px; font-weight:500">If you have filters applied, try changing or removing them.</text>`,
        },
        noData: {
            attr: {
                fill  : "#CCC3",
                r     : 5,
                stroke: "#8883",
                width : 360,
                height: 60,
                "stroke-width": 2
            },
            useHTML: false
        },
        series
    };

    const result = merge(options, dynamicOptions) as Highcharts.Options

    result.caption = { text: "" };

    if (exceptions.length) {
        result.caption = {
            text: "⚠️ " + exceptions.join("<br />⚠️ "),
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
    if (inspection.enabled && result.annotations?.[0]) {
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
        if (inspection.enabled) {
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
        if (inspection.enabled) {
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
