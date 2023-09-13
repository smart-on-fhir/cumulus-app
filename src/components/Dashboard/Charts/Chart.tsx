import React                       from "react"
import { Color, merge, Series }    from "highcharts"
import moment                      from "moment"
import { defer, roundToPrecision } from "../../../utils"
import Loader                      from "../../generic/Loader"
import { MenuItemConfig }          from "../../generic/Menu"
import { app }                     from "../../../types"
import {
    SupportedNativeChartTypes,
    SupportedChartTypes,
    DEFAULT_COLORS
} from "../config"


declare var Highcharts: any

type SeriesOptions = (
    Highcharts.SeriesPieOptions |
    Highcharts.SeriesSplineOptions |
    Highcharts.SeriesAreasplineOptions |
    Highcharts.SeriesColumnOptions |
    Highcharts.SeriesBarOptions
);


/**
 * Function from https://github.com/danro/easing-js/blob/master/easing.js
 */
function easing(pos: number) {
    if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,2);
    return -0.5 * ((pos-=2)*pos - 2);
}

export function getChartTitleText(column: app.DataRequestDataColumn, groupBy?: app.DataRequestDataColumn | null): string {
    let txt = column.label || column.name
    if (groupBy) {
        txt += ` by ${groupBy.label || groupBy.name}`
    }
    return txt
}

export function getXType(column: app.DataRequestDataColumn): "category" | "linear" | "datetime" {
    
    let xType: "category" | "linear" | "datetime" = "category";

    if (column.dataType === "integer" || column.dataType === "float") {
        xType = "linear"
    }

    else if (column.dataType.startsWith("date")) {
        xType = "datetime"
    }

    return xType;
}

export function getDateFormat({ dataType }: app.DataRequestDataColumn, forMoment = false) {
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

function getPoint({
    row,
    xType,
    denominator,
    isErrorRange
}: {
    row: [string, number, number?, number?]
    xType: "category" | "linear" | "datetime"
    denominator?: number
    isErrorRange?: boolean
}): Highcharts.XrangePointOptionsObject | number | number[] {

    const point: any = {
        y: pct(row[1], denominator),

        // The name of the point as shown in the legend, tooltip, dataLabels, etc.
        name: String(row[0]),

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
        point.x = moment(row[0]).utc().valueOf()
    }

    // For linear (numeric) axes, the X value is the numeric value or 0.
    if (xType === "linear") {
        point.x = +(row[0] || 0)
    }
    
    return point
}

function getSeries({
    column,
    data,
    data2,
    type,
    denominator,
    column2type,
    serverOptions,
    xType,
    ranges = {}
}: {
    data            : app.ServerResponses.DataResponse
    data2           : app.ServerResponses.StratifiedDataResponse | null
    column          : app.DataRequestDataColumn
    type            : SupportedNativeChartTypes 
    denominator     : app.DenominatorType
    column2type    ?: keyof typeof SupportedChartTypes
    xType           : "category" | "linear" | "datetime"
    serverOptions   : Highcharts.Options
    ranges          : app.RangeOptions
}): SeriesOptions[]
{
    const is3d = !!serverOptions.chart?.options3d?.enabled

    let series: SeriesOptions[] = []

    function addSeries(options: any, secondary = false) {
        
        // The ID of this series
        const id = options?.id || (secondary ? "secondary-" : "primary-") + options.name

        const S = serverOptions.series?.find((s: any) => s.id === id)

        // Should the series be hidden?
        const visible = S?.visible !== false

        const colors: string[] = serverOptions.colors!

        const color = colors[series.length % colors.length]

        const cfg: any = {
            index: series.length,
            // colorIndex: series.length % colors.length,
            opacity: S?.opacity,
            color,
            visible,
            // @ts-ignore
            showInLegend: visible ? true : !serverOptions.legend?._readonly,
            id
        }

        if (options.type === "areaspline") {
            cfg.fillColor = {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, new Color(color).setOpacity(0.2 ).get('rgba') + ""],
                    [1, new Color(color).setOpacity(0.05).get('rgba') + ""]
                ]
            }
        }

        if (secondary) {
            cfg.zIndex = -1
            cfg.shadow = false

            if (options.type.includes("column")) {
                cfg.color = {
                    linearGradient: { x1: 1, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, new Color(color).setOpacity(1.0).get('rgba') + ""],
                        [1, new Color(color).setOpacity(0.5).get('rgba') + ""]
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
            //                 strokeWidth: 10
            //             },
            //             width : 6,
            //             height: 6,
            //             patternTransform: 'scale(0.5) rotate(45)'
            //         }
            //     }
            // }

            if (column2type!.includes("columnStack")) {
                cfg.stacking = "normal"
            }

            if (options.type.includes("line")) {
                cfg.dashStyle = "ShortDash"
                cfg.lineWidth = 1.35
            }
        }

        series.push({ ...cfg, ...options });
    }

    function stratify(data: app.ServerResponses.StratifiedDataResponse, secondary = false) {

        const _type = secondary ? column2type!.replace(/(Stack|3d|Stack3d)$/, "") as SupportedNativeChartTypes : type;

        const denominatorCache = {}

        let keys: any[] = [];
        data.data.forEach(group => {
            group.rows.forEach(row => {
                if (!keys.includes(row[0])) {
                    keys.push(row[0])
                }
            })
        })

        if (xType === "linear") {
            keys.sort((a, b) => a - b);
        }
        else if (xType === "datetime") {
            keys.sort((a, b) => +new Date(a) - +new Date(b));
        }
        else {
            keys.sort((a, b) => String(a).localeCompare(b + ""));
        }
        
        data.data.forEach(group => {
            addSeries({
                type: _type,
                name: group.stratifier,
                data: keys.map(key => {
                    const row = group.rows.find(row => row[0] === key)
                    return row ?
                        getPoint({ row, xType, denominator: getDenominator(data, denominator, row, denominatorCache) }) :
                        (type === "column" || type === "bar") && data.data.length > 1 ?
                            getPoint({ row: [key, 0], xType, denominator: 100 }) :
                            null
                }).filter(Boolean)
            }, secondary)

            if (ranges?.enabled) {
                addSeries({
                    type: ranges.type ?? "errorbar",
                    opacity: ranges.opacity ?? 0.75,
                    zIndex: ranges.zIndex ?? -1,
                    // @ts-ignore
                    borderWidth: is3d ? 0 : ranges.borderWidth,
                    // @ts-ignore
                    borderColor: is3d ? undefined : ranges.borderColor,
                    // @ts-ignore
                    borderRadius: ranges.borderRadius ?? 0,
                    // @ts-ignore
                    edgeColor: is3d ? ranges.borderColor : undefined,
                    // @ts-ignore
                    edgeWidth: is3d ? ranges.borderWidth : 0,
                    // @ts-ignore
                    centerInCategory: ranges.centerInCategory,
                    // @ts-ignore
                    pointWidth: ranges.pointWidth,
                    name: group.stratifier + " (range)",
                    data: keys.map(key => {
                        const row = group.rows.find(row => row[0] === key)
                        return row ?
                            getPoint({ row, xType, denominator: getDenominator(data, denominator, row, denominatorCache), isErrorRange: true,  }) :
                            (type === "column" || type === "bar") && data.data.length > 1 ?
                                getPoint({ row: [key, 0], xType, denominator: 100, isErrorRange: true }) :
                                null
                    }).filter(Boolean)
                });
            }
        })
    }

    if (data.rowCount) {
        if (!data.stratifier) {
            const denominatorCache = {}
            addSeries({
                type,
                name: column.label || column.name,
                data: data.data[0].rows.map(row => getPoint({
                    row,
                    xType,
                    denominator: getDenominator(data, denominator, row, denominatorCache)
                }))
            });

            if (ranges?.enabled) {
                addSeries({
                    type: ranges.type ?? "errorbar",
                    opacity: ranges.opacity ?? 0.75,
                    name: (column.label || column.name) + " (range)",
                    zIndex: ranges.zIndex ?? -1,
                    // @ts-ignore
                    borderWidth: is3d ? 0 : ranges.borderWidth,
                    // @ts-ignore
                    borderColor: is3d ? undefined : ranges.borderColor,
                    // @ts-ignore
                    borderRadius: ranges.borderRadius ?? 0,
                    // @ts-ignore
                    edgeColor: is3d ? ranges.borderColor : undefined,
                    // @ts-ignore
                    edgeWidth: is3d ? ranges.borderWidth : 0,
                    // @ts-ignore
                    centerInCategory: ranges.centerInCategory,
                    // @ts-ignore
                    pointWidth: ranges.pointWidth,
                    data: data.data[0].rows.map(row => getPoint({
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
    }

    if (data2 && data2.rowCount) {
        stratify(data2, true)
    }

    return series
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
    ranges = {}
}: {
    data            : app.ServerResponses.DataResponse
    data2           : app.ServerResponses.StratifiedDataResponse | null
    options        ?: Highcharts.Options
    column          : app.DataRequestDataColumn
    groupBy        ?: app.DataRequestDataColumn
    type            : SupportedNativeChartTypes
    denominator    ?: app.DenominatorType
    column2type    ?: keyof typeof SupportedChartTypes
    onSeriesToggle  : (s: Record<string, boolean>) => void
    ranges          : app.RangeOptions
}): Highcharts.Options
{
    const xType = getXType(column);

    const is3d = !!options.chart?.options3d?.enabled

    const series = getSeries({
        data,
        data2,
        column,
        type,
        denominator,
        column2type,
        xType,
        serverOptions: options,
        ranges
    });

    const dynamicOptions: Highcharts.Options = {
        chart: {
            marginTop: type === "pie" || options.title?.text ? undefined : 40,
            options3d: {
                depth: Math.min(series.length * 10, 100),
            },
            plotBorderWidth: is3d ? 0 : options.chart?.plotBorderWidth,
            animation: {
                easing
            },
        },
        yAxis: {
            allowDecimals: denominator ? true : false,
            // max: denominator === "local" ? 100 : undefined,
            labels: {
                format: denominator ? "{text}%" : "{text}",
            }
        },
        plotOptions: {
            series: {
                animation: {
                    easing
                },
                events: {
                    legendItemClick(e) {
                        e.preventDefault()
                        // @ts-ignore
                        if (options.legend?._readonly) {
                            return false
                        }
                        const visMap: Record<string, boolean> = {};
                        e.target.chart.series.forEach((s: Series) => visMap[s.userOptions.id!] = s === e.target ? !s.visible : s.visible)
                        onSeriesToggle(visMap)
                    }
                },
                dataSorting: {
                    enabled: xType === "category",
                    matchByName: false,
                    sortKey: "index"
                },
                states: {
                    hover: {
                        opacity: 1
                    }
                }
            },
            pie: {
                dataLabels: {
                    style: {
                        fontSize: "14px"
                    },
                    formatter(): any {
                        if (this.point) {
                            return `<b>${this.point.name}</b><span style="opacity:0.5;font-weight:400">` +
                                ` - ${parseFloat((this.point.percentage || 0).toPrecision(2))} %</span>`
                        }
                    }
                },
                shadow: false
            },
            spline: {
                shadow: data2 ? { width: 2, opacity: 0.2, offsetY: 1 } : false
            },
            areaspline: {
                shadow: data2 ? {
                    width  : 2,
                    offsetY: 1,
                    offsetX: 0,
                    opacity: 0.2,
                } : false
            },
            areasplinerange: {
                // @ts-ignore
                lineWidth: ranges?.lineWidth ?? 1,
                dashStyle: (ranges as app.AreaRangeOptions)?.dashStyle,
                fillOpacity: (ranges as app.AreaRangeOptions)?.fillOpacity ?? 0.5,
                linkedTo: ':previous',
                marker: {
                    enabled: false,
                //     radius: 6,
                //     states: {
                //         hover: {
                //             enabled: true
                //         }
                //     }
                },
                states: {
                    hover: {
                        enabled: false
                    }
                }
            },
            errorbar: {
                // @ts-ignore
                lineWidth: ranges?.lineWidth ?? 1,
                stemDashStyle: (ranges as app.ErrorRangeOptions)?.stemDashStyle ?? "Dash",
                whiskerWidth: (ranges as app.ErrorRangeOptions)?.whiskerWidth ?? 2,
                whiskerDashStyle: (ranges as app.ErrorRangeOptions)?.whiskerDashStyle ?? "Solid",
                // @ts-ignore
                whiskerLength: String(ranges?.whiskerLength || "").endsWith("px") ? parseFloat(ranges?.whiskerLength) : ranges?.whiskerLength ?? "80%",
                linkedTo: ':previous'
            }
        },
        tooltip: {
            borderColor: "rgba(0, 0, 0, 0.4)",
            formatter(): any {
                const rows = [];

                let x: any
                if (xType === "datetime") {
                    x = moment(this.point.x).format("YYYY-MM-DD")
                } else if (xType === "linear") {
                    x = this.point.x
                } else {
                    x = this.point.name
                }

                // Bullet ------------------------------------------------------
                rows.push(`<tr><td colspan="2"><b style="color:${
                    // @ts-ignore
                    this.point.color?.pattern?.color || this.point.series.color?.stops?.[0]?.[1] || this.point.color || DEFAULT_COLORS[this.point.series.index % DEFAULT_COLORS.length]
                };-webkit-text-stroke:0.5px rgba(0, 0, 0, 0.5);">◉</b> `)
                
                // Header ------------------------------------------------------
                if (groupBy) {
                    rows.push(`<b>${this.point.series.name}</b><hr/></td></tr>`)
                } else {
                    rows.push(`<b>${x}</b><hr/></td></tr>`)
                }

                // Group -------------------------------------------------------
                if (groupBy) {
                    rows.push(`<tr><td style="text-align:right">${column.label || column.name}:</td><td style="width: 100%"><b>${x}</b></td></tr>`)
                }

                // Value -------------------------------------------------------
                // @ts-ignore
                if (!this.point.custom?.isErrorRange) {
                    rows.push(
                        `<tr><td style="text-align:right">${denominator ? "Computed Value:" : "Count:"}</td>`,
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
            crosshair: type.includes("line")
        },
        series
    };

    return merge(options, dynamicOptions) as Highcharts.Options
}



interface ChartProps {
    options : Highcharts.Options
    loading?: boolean
    contextMenuItems?: (MenuItemConfig | "-")[]
}

export default class Chart extends React.Component<ChartProps>
{
    chart: any;

    constructor(props: ChartProps) {
        super(props);
        this.updateChart = this.updateChart.bind(this);
    }

    updateChart() {
        try {
            // update(options [, redraw] [, oneToOne] [, animation])
            this.chart.update(this.props.options, !this.props.loading, true, false)
        } catch (e) {
            console.debug(e)
        }
    }

    componentDidMount() {
        this.chart = Highcharts.chart("chart", this.props.options || {});
        Highcharts.charts = [this.chart]
    }

    componentDidUpdate() {
        // The UI can generate too frequent state updates in some cases (for
        // example via color pickers). Using defer here allows us to skip
        // some needless re-rendering 
        defer(this.updateChart, 1);
    }

    render() {
        const { loading } = this.props
        return <div style={{ position: "relative" }} className={ loading ? "loading" : undefined }>
            <div id="chart" className="main-chart" onContextMenu={e => {

                // @ts-ignore
                let menuItems = [...(e.nativeEvent?.menuItems || [])];

                if (this.props.contextMenuItems) {
                    menuItems = menuItems.concat(this.props.contextMenuItems)
                }

                // @ts-ignore
                e.nativeEvent.menuItems = menuItems

                // @ts-ignore
                e.nativeEvent.context = { ...e.nativeEvent.context, chart: this.chart }
            }}/>
            <div className="chart-loader"><Loader/></div>
        </div>
    }
}
