import React, { MouseEvent }       from "react"
import { Color, merge, Series }    from "highcharts"
// import moment                      from "moment"
import { defer, lengthToEm, roundToPrecision } from "../../../utils"
import Loader                      from "../../generic/Loader"
import { MenuItemConfig }          from "../../generic/Menu"
import { app }                     from "../../../types"
import {
    SupportedNativeChartTypes,
    SupportedChartTypes,
    DEFAULT_COLORS,
    DEFAULT_FONT_FAMILY,
    DEFAULT_FONT_SIZE,
    INSPECTORS
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

function emToPx(em: number) {
    return Math.round(DEFAULT_FONT_SIZE * em) + "px"
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
        // point.x = moment(row[0]).utc().valueOf()
        point.x = +new Date(row[0])// 2020-08-01
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
    let series: SeriesOptions[] = []

    function addSeries(options: any, secondary = false) {

        const S = serverOptions.series?.find((s: any) => s.id === options.id)
        // @ts-ignore
        const prev = serverOptions.plotOptions?.[options.type || "series"] ?? {}

        const colors: string[] = serverOptions.colors!

        const color = colors[series.length % colors.length]

        const cfg: any = {
            // index: series.length,
            color,
            id: options.id
        }

        if (type.includes("area") && color && S?.visible !== false) {
            // @ts-ignore
            const fillOpacity = S?.fillOpacity ?? prev.fillOpacity ?? 1
            cfg.fillColor = {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, new Color(color).setOpacity(fillOpacity * 1.0).get('rgba') + ""],
                    [1, new Color(color).setOpacity(fillOpacity * 0.2).get('rgba') + ""]
                ]
            }
        }

        if (secondary) {
            if (options.type?.includes("column") && color && S?.visible !== false) {
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

            cfg.stacking = column2type!.includes("columnStack") ? "normal" : undefined
        }

        series.push({
            ...S,
            ...cfg,
            ...options
        });
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
            const id  = (secondary ? "secondary-" : "primary-") + group.stratifier
            const old = serverOptions.series?.find(s => s.id === id)
            addSeries({
                type: _type,
                id,
                name: old?.name || group.stratifier,
                data: keys.map(key => {
                    const row = group.rows.find(row => row[0] === key)
                    return row ?
                        getPoint({ row, xType, denominator: getDenominator(data, denominator, row, denominatorCache) }) :
                        // (type === "column" || type === "bar") && data.data.length > 1 ?
                        //     getPoint({ row: [key, 0], xType, denominator: 100 }) :
                            null
                }).filter(Boolean)
            }, secondary)

            if (ranges?.enabled) {
                const id  = (secondary ? "secondary-" : "primary-") + group.stratifier + " (range)"
                const old = serverOptions.series?.find(s => s.id === id)
                addSeries({
                    type: ranges.type ?? "errorbar",
                    name: old?.name || group.stratifier + " (range)",
                    id  : (secondary ? "secondary-" : "primary-") + group.stratifier + " (range)",
                    data: keys.map(key => {
                        const row = group.rows.find(row => row[0] === key)
                        return row ?
                            getPoint({ row, xType, denominator: getDenominator(data, denominator, row, denominatorCache), isErrorRange: true,  }) :
                            // (type === "column" || type === "bar") && data.data.length > 1 ?
                            //     getPoint({ row: [key, 0], xType, denominator: 100, isErrorRange: true }) :
                                null
                    }).filter(Boolean)
                });
            }
        })
    }

    if (data.rowCount) {
        if (!data.stratifier) {
            const denominatorCache = {}
            const id  = "primary-" + (column.label || column.name)
            const old = serverOptions.series?.find(s => s.id === id)
            addSeries({
                type,
                id,
                name: old?.name || column.label || column.name,
                data: data.data[0].rows.map(row => getPoint({
                    row,
                    xType,
                    denominator: getDenominator(data, denominator, row, denominatorCache)
                }))
            });

            if (ranges?.enabled) {
                const id  = "primary-" + (column.label || column.name) + " (range)"
                const old = serverOptions.series?.find(s => s.id === id)
                addSeries({
                    type: ranges.type ?? "errorbar",
                    id,
                    name: old?.name || (column.label || column.name) + " (range)",
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
    ranges = {},
    onInspectionChange,
    inspection
}: {
    data              : app.ServerResponses.DataResponse
    data2             : app.ServerResponses.StratifiedDataResponse | null
    options          ?: Highcharts.Options
    column            : app.DataRequestDataColumn
    groupBy          ?: app.DataRequestDataColumn
    type              : SupportedNativeChartTypes
    denominator      ?: app.DenominatorType
    column2type      ?: keyof typeof SupportedChartTypes
    onSeriesToggle    : (s: Record<string, boolean>) => void
    ranges            : app.RangeOptions
    inspection        : app.Inspection
    onInspectionChange: (inspection: string[], context: Partial<app.InspectionContext>) => void
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
            // @ts-ignore
            // marginTop: type === "pie" || options.title?.text ? undefined : 40,
            options3d: {
                depth: options.chart?.options3d?.depth ?? Math.min(series.length * 10, 100),
            },
            plotBorderWidth: is3d ? 0 : options.chart?.plotBorderWidth,
            animation: {
                easing
            },
        },
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
                animation: {
                    easing
                },
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
                dataSorting: {
                    enabled: xType !== "datetime",
                    matchByName: false,
                    // sortKey: "name,x"
                    // sortKey: "name,x"
                    sortKey: "name,x"
                },
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
                linkedTo: ':previous',
                marker: {
                    enabled: false,
                },
                states: {
                    hover: {
                        enabled: false
                    }
                }
            },
            errorbar: {
                linkedTo: ':previous'
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
            formatter(): any {
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
                    this.point.color?.pattern?.color || this.point.series?.color?.stops?.[0]?.[1] || this.point.color || DEFAULT_COLORS[this.point.series.index % DEFAULT_COLORS.length]
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
            labels: {
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
            itemStyle: {
                fontSize  : options.chart?.style?.fontSize   ?? emToPx(0.85),
                fontFamily: options.chart?.style?.fontFamily ?? DEFAULT_FONT_FAMILY
            }
        },
        series
    };

    const result = merge(options, dynamicOptions) as Highcharts.Options

    // Convert px to em in old chart annotations
    result.annotations?.[0]?.labels?.forEach(l => {
        l.style!.fontSize = options.chart?.style?.fontSize
        l.style!.fontFamily = options.chart?.style?.fontFamily
        l.useHTML = true
    })

    // @ts-ignore Convert px to em in old chart xAxis plotLines
    const xAxisPlotLines = (result.xAxis?.plotLines || []) as XAxisPlotLinesOptions[];
    xAxisPlotLines.forEach(l => {
        if (l.label?.style?.fontSize) {
            l.label.style.fontSize = lengthToEm(l.label.style.fontSize) + "em"
        }
    })

    // @ts-ignore Convert px to em in old chart yAxis plotLines
    const yAxisPlotLines = (result.yAxis?.plotLines || []) as YAxisPlotLinesOptions[];
    yAxisPlotLines.forEach(l => {
        if (l.label?.style?.fontSize) {
            l.label.style.fontSize = lengthToEm(l.label.style.fontSize) + "em"
        }
    })

    return result
}



interface ChartProps {
    options : Highcharts.Options
    loading?: boolean
    contextMenuItems?: (MenuItemConfig | "-")[]
    visualOverrides: app.VisualOverridesState
    onInspectionChange?: (result: string[], ctx: Partial<app.InspectionContext>) => void
}

export default class Chart extends React.Component<ChartProps>
{
    chart: any;

    constructor(props: ChartProps) {
        super(props);
        this.updateChart = this.updateChart.bind(this);
    }

    afterRender() {
        const {
            enabled,
            brightness,
            contrast,
            saturation,
            fontColor,
            fontColorEnabled
        } = this.props.visualOverrides
        
        if (enabled) {
            this.chart.container.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
            const el = document.getElementById("chart-text-color")! as HTMLStyleElement
            el.innerText = fontColor && fontColorEnabled ? 
                `.main-chart .highcharts-container text { color: ${fontColor} !important; fill: ${fontColor} !important; }` +
                `.main-chart .highcharts-container svg * { color: ${fontColor} !important; }` +
                `.main-chart .highcharts-container .highcharts-data-labels .highcharts-data-label > span { color: ${fontColor} !important; }` +
                `.main-chart .highcharts-container .highcharts-legend-item-hidden > text { filter: grayscale(1) opacity(0.5) !important; }` :
                ""
            el.sheet!.disabled = false
        } else {
            this.chart.container.style.filter = "none"
            const el = document.getElementById("chart-text-color")! as HTMLStyleElement
            el.sheet!.disabled = true
        }
    }

    updateChart() {
        try {
            // update(options [, redraw] [, oneToOne] [, animation])
            this.chart.update(this.props.options, !this.props.loading, true, false)
            this.afterRender()
        } catch (e) {
            console.debug(e)
        }
    }

    componentDidMount() {
        this.chart = Highcharts.chart("chart", this.props.options || {});
        Highcharts.charts = [this.chart]
        this.afterRender()
    }

    onMouseDown(e: MouseEvent) {
        if (this.props.onInspectionChange) {
            let element = e.target as SVGElement | HTMLElement | null
            if (element) {
                let tag = Object.entries(INSPECTORS).find(([, selector]) => element!.matches(selector))?.[0]
                if (tag) {
                    this.props.onInspectionChange([tag], {})
                }
            }
        }
    }

    componentDidUpdate() {
        // The UI can generate too frequent state updates in some cases (for
        // example via color pickers). Using defer here allows us to skip
        // some needless re-rendering 
        defer(this.updateChart);
    }

    render() {
        const { loading, onInspectionChange } = this.props
        return <div style={{ position: "relative" }} className={ loading ? "loading" : undefined } onMouseDown={ e => this.onMouseDown(e) }>
            <div id="chart" className={ "main-chart" + (onInspectionChange ? " inspecting" : "") } onContextMenu={e => {

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
