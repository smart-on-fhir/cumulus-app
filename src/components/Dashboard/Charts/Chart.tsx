import React                         from "react";
import { Color, merge, Series }      from "highcharts"
import { defer }                     from "../../../utils";
import Loader                        from "../../Loader";
import {
    SupportedNativeChartTypes,
    SupportedChartTypes
} from "../config";
import moment from "moment";

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
        point.x = +new Date(row[0])
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
    colors,
    denominator,
    column2type,
    column2opacity,
    seriesVisibility,
    xType
}: {
    data            : app.ServerResponses.DataResponse
    data2           : app.ServerResponses.StratifiedDataResponse | null
    column          : app.DataRequestDataColumn
    type            : SupportedNativeChartTypes 
    colors          : string[]
    denominator     : "" | "local" | "global"
    column2type    ?: keyof typeof SupportedChartTypes
    column2opacity  : number
    seriesVisibility: Record<string, boolean>
    xType           : "category" | "linear" | "datetime"
}): SeriesOptions[]
{
    
    let series: SeriesOptions[] = []

    let getDenominator = getDenominatorFactory(data)

    function pointFromRow(row: [string, number]): Highcharts.XrangePointOptionsObject | number | number[] {
        return getPoint({ row, xType, denominator: getDenominator(row, denominator) })
    }

    function addSeries(options: any, secondary = false) {
        
        const cfg: any = {
            index: series.length,
            colorIndex: series.length % colors.length,
            visible: seriesVisibility[options.name] !== false,
            id: (secondary ? "secondary-" : "primary-") + options.name
            // id: options.name
            // id: secondary ? "secondary-" + options.name : undefined
        }

        if (options.type.includes("area")) {
            cfg.fillColor = {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, new Color(colors[series.length % colors.length]).setOpacity(0.2 ).get('rgba') + ""],
                    [1, new Color(colors[series.length % colors.length]).setOpacity(0.05).get('rgba') + ""]
                ]
            }
        }

        if (secondary) {
            cfg.zIndex = -1
            cfg.opacity = column2opacity
            cfg.shadow = false

            if (options.type.includes("column")) {
                cfg.color = {
                    pattern: {
                        path: {
                            d: 'M 0 0 L 0 6',
                            strokeWidth: 10
                        },
                        width : 6,
                        height: 6,
                        patternTransform: 'scale(0.5) rotate(45)'
                    }
                }
            }

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
        
        data.data.forEach(group => {
            addSeries({
                type: _type,
                name: group.stratifier,
                data: group.rows.map(pointFromRow)
            }, secondary)
        })
    }

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

    if (data2) {
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
    colorOptions,
    denominator = "",
    type,
    column2type,
    column2opacity = 1,
    onSeriesToggle,
    seriesVisibility
}: {
    data            : app.ServerResponses.DataResponse
    data2           : app.ServerResponses.StratifiedDataResponse | null
    options        ?: Highcharts.Options
    column          : app.DataRequestDataColumn
    groupBy        ?: app.DataRequestDataColumn
    type            : SupportedNativeChartTypes
    colorOptions    : app.ColorOptions
    denominator    ?: "" | "local" | "global"
    column2type    ?: keyof typeof SupportedChartTypes
    column2opacity ?: number
    onSeriesToggle  : (s: Record<string, boolean>) => void
    seriesVisibility: Record<string, boolean>
}): Highcharts.Options
{
    const COLORS = colorOptions.colors.map(c => new Color(c).setOpacity(colorOptions.opacity).get("rgba") + "")

    const xType = getXType(column);

    const series = getSeries({
        data,
        data2,
        column,
        type,
        colors: COLORS,
        denominator,
        column2type,
        column2opacity,
        seriesVisibility,
        xType
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
        colors: COLORS,
        yAxis: {
            allowDecimals: denominator ? true : false,
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
                        e.target.chart.series.forEach(
                            (s: Series) => visMap[s.name] = s.name === e.target.name ? !s.visible : s.visible
                        )
                        onSeriesToggle(visMap)
                    }
                },
                dataSorting: {
                    enabled: xType === "category",
                    matchByName: false,
                    sortKey: "index"
                }
            },
            pie: {
                dataLabels: {
                    formatter(): any {
                        // @ts-ignore
                        if (this.point) {
                            // console.log(this.point)
                            // @ts-ignore
                            let label = `<b>${this.point.name}</b>`

                            let suffix = ""

                            // @ts-ignore
                            // let data = this.point.custom.data as Record<string, any>

                            // if (data) {
                            //     for(const key in data) {
                            //         if (key !== "cnt" && data[key] !== null && data[key] + "" !== this.point.name) {
                            //             suffix += `<span style="opacity:0.5;font-weight:400"> ${data[key]}</span>`
                            //         }
                            //     }
                            // }

                            if (!suffix) {
                                // @ts-ignore
                                suffix = `<span style="opacity:0.5;font-weight:400"> - ${parseFloat((this.point.percentage || 0).toPrecision(2))} %</span>`
                            }

                            return label + suffix
                        }
                    }
                }
            },
            spline: {
                shadow: !!data2
            },
            areaspline: {
                shadow: !!data2
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

                rows.push(`<tr><td colspan="2"><b style="color:${COLORS[this.point.series.index % COLORS.length]};-webkit-text-stroke:0.5px rgba(0, 0, 0, 0.5);">◉</b> `)
                
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
                    `<td style="width: 100%"><b>${denominator ? this.point.y?.toPrecision(3) + "%" : this.point.y}</b></td></tr>`
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
            <div id="chart" className="main-chart"/>
            <div className="chart-loader"><Loader/></div>
        </div>
    }
}
