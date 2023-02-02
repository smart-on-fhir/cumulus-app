import React                    from "react";
import { Color, merge, Series } from "highcharts"
import moment                   from "moment";
import { defer }                from "../../../utils";
import Loader                   from "../../generic/Loader";
import { MenuItemConfig }       from "../../generic/Menu";
import {
    SupportedNativeChartTypes,
    SupportedChartTypes,
    DEFAULT_COLORS
} from "../config";


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

function getDenominatorFactory(data: app.ServerResponses.DataResponse) {
    
    const cache: Record<string, number> = {};

    return function(row: [string, number], type: "local" | "global" | any) {
        if (type === "global") {
            return data.totalCount
        }
        if (type === "local") {
            let x = row[0]
            let out = cache[x];
            if (out === undefined) {
                // console.log("computing denominator")
                out = cache[x] = (data as app.ServerResponses.StratifiedDataResponse).data.reduce(
                    (prev, cur) => prev + (cur.rows.find(r => r[0] === x)||[0, 0])[1],
                    0
                );
            }
            return out
        }
        return 100
    }
}

function getPoint({
    row,
    xType,
    denominator
}: {
    row: [string, number]
    xType: "category" | "linear" | "datetime"
    denominator: number
}): Highcharts.XrangePointOptionsObject | number | number[] {

    let value = denominator === 100 ? row[1] : row[1] / denominator * 100;

    const point: Highcharts.XrangePointOptionsObject = {
        y: value,

        // The name of the point as shown in the legend, tooltip, dataLabels, etc.
        name: String(row[0]),

        custom: {
            data: {
                cnt: row[1]
            },
            denominator
        }
    };

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
    xType
}: {
    data            : app.ServerResponses.DataResponse
    data2           : app.ServerResponses.StratifiedDataResponse | null
    column          : app.DataRequestDataColumn
    type            : SupportedNativeChartTypes 
    denominator     : "" | "local" | "global"
    column2type    ?: keyof typeof SupportedChartTypes
    xType           : "category" | "linear" | "datetime"
    serverOptions   : Highcharts.Options
}): SeriesOptions[]
{
    
    let series: SeriesOptions[] = []

    let getDenominator = getDenominatorFactory(data)

    function pointFromRow(row: [string, number]): Highcharts.XrangePointOptionsObject | number | number[] {
        return getPoint({ row, xType, denominator: getDenominator(row, denominator) })
    }

    function addSeries(options: any, secondary = false) {
        
        // The ID of this series
        const id = (secondary ? "secondary-" : "primary-") + options.name

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
            id
        }

        if (options.type.includes("area")) {
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

        const _type = secondary ?
            column2type!.replace(/(Stack|3d|Stack3d)$/, "") as SupportedNativeChartTypes :
            type;

        // start test
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
        // end test
        
        data.data.forEach(group => {
            // start test
            addSeries({
                type: _type,
                name: group.stratifier,
                data: keys.map(key => {
                    const entry = group.rows.find(row => row[0] === key)
                    return entry ?
                        pointFromRow(entry) :
                        (type === "column" || type === "bar") && data.data.length > 1 ?
                            pointFromRow([key, 0]) :
                            null
                }).filter(Boolean)
            }, secondary)
            // end test

            // addSeries({
            //     type: _type,
            //     name: group.stratifier,
            //     data: group.rows.map(pointFromRow)
            // }, secondary)
        })
    }

    if (data.rowCount) {
        if (!data.stratifier) {
            addSeries({
                type,
                name: column.label || column.name,
                data: data.data[0].rows.map(pointFromRow)
            });
        }
        else {
            stratify(data as app.ServerResponses.StratifiedDataResponse)
        }
    }

    if (data2 && data2.rowCount) {
        getDenominator = getDenominatorFactory(data2)
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
    onSeriesToggle
}: {
    data            : app.ServerResponses.DataResponse
    data2           : app.ServerResponses.StratifiedDataResponse | null
    options        ?: Highcharts.Options
    column          : app.DataRequestDataColumn
    groupBy        ?: app.DataRequestDataColumn
    type            : SupportedNativeChartTypes
    denominator    ?: "" | "local" | "global"
    column2type    ?: keyof typeof SupportedChartTypes
    onSeriesToggle  : (s: Record<string, boolean>) => void
}): Highcharts.Options
{
    const xType = getXType(column);

    const series = getSeries({
        data,
        data2,
        column,
        type,
        denominator,
        column2type,
        xType,
        serverOptions: options
    });

    const dynamicOptions: Highcharts.Options = {
        chart: {
            marginTop: type === "pie" || options.title?.text ? undefined : 40,
            options3d: {
                depth: Math.min(series.length * 10, 100),
            },
            plotBorderWidth: options.chart?.options3d?.enabled ? 0 : options.chart?.plotBorderWidth,
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

                rows.push(`<tr><td colspan="2"><b style="color:${
                    // @ts-ignore
                    this.point.series.color?.stops?.[0]?.[1] || this.point.color || DEFAULT_COLORS[this.point.series.index % DEFAULT_COLORS.length]
                };-webkit-text-stroke:0.5px rgba(0, 0, 0, 0.5);">◉</b> `)
                
                if (groupBy) {
                    rows.push(`<b>${this.point.series.name}</b><hr/></td></tr>`)
                } else {
                    rows.push(`<b>${x}</b><hr/></td></tr>`)
                }

                if (groupBy) {
                    rows.push(`<tr><td style="text-align:right">${column.label || column.name}:</td><td style="width: 100%"><b>${x}</b></td></tr>`)
                }

                rows.push(
                    `<tr><td style="text-align:right">${denominator ? "Computed Value:" : "Count:"}</td>`,
                    `<td style="width: 100%"><b>${denominator ? this.point.y?.toPrecision(3) + "%" : Number(this.point.y).toLocaleString()}</b></td></tr>`
                )

                // @ts-ignore
                if (denominator && this.point.custom?.denominator) {
                    // @ts-ignore
                    rows.push(`<tr><td style="text-align:right">Denominator:</td><td><b>${this.point.custom.denominator}</b></td></tr>`)
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
            this.chart.update(this.props.options || {}, true, true, false)
        } catch (e) {
            console.debug(e)
        }
    }

    componentDidMount() {
        this.chart = Highcharts.chart("chart", this.props.options || {});
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
