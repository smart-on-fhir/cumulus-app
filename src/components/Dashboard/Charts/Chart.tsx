import React                          from "react";
import { Color, merge, XAxisOptions } from "highcharts"
import moment                         from "moment";
import PowerSet                       from "../../../PowerSet";
import { defer, format }              from "../../../utils";
import { SupportedNativeChartTypes }  from "../config";

declare var Highcharts: any

type SeriesOptions = (
    Highcharts.SeriesPieOptions |
    Highcharts.SeriesSplineOptions |
    Highcharts.SeriesAreasplineOptions |
    Highcharts.SeriesAreaOptions |
    Highcharts.SeriesColumnOptions |
    Highcharts.SeriesBarOptions //|
    // Highcharts.SeriesLineOptions |
    // Highcharts.SeriesTimelineOptions
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

export function getXType(column: app.DataRequestDataColumn, groupBy?: app.DataRequestDataColumn | null): "category" | "linear" | "datetime" {
    // if (groupBy) {
    //     return getXType(groupBy);
    // }
    
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

export function getSeries({
    column,
    groupBy,
    dataSet,
    fullDataSet,
    type,
    colors = [],
    denominator = "",
    column2,
    column2type,
    column2opacity = 1
}: {
    column: app.DataRequestDataColumn
    dataSet: PowerSet
    fullDataSet: PowerSet
    groupBy?: app.DataRequestDataColumn | null
    type: SupportedNativeChartTypes 
    colors?: string[]
    denominator?: string
    column2    ?: app.DataRequestDataColumn | null
    column2type?: string
    column2opacity?: number
}): SeriesOptions[]
{
    let xType = getXType(column, groupBy);

    let series: SeriesOptions[] = []

    let dateFormat = getDateFormat(column, true)

    function pointFromRow(row: { cnt: number, [key: string]: any }, col: app.DataRequestDataColumn): Highcharts.XrangePointOptionsObject {
        
        let value = row.cnt;
        let denominatorValue = 0;

        
        if (denominator === "local") {
            denominatorValue = fullDataSet.countWhere({ [column.name]: row[col.name] });
            value = value/denominatorValue * 100
        }
        
        // Convert the count to % of the total count
        else if (denominator === "global") {
            denominatorValue = fullDataSet.countAll();
            value = value/denominatorValue * 100
        }

        const point: Highcharts.XrangePointOptionsObject = {
            // Y is always the patient count
            y: value,

            // The name of the point as shown in the legend, tooltip, dataLabels, etc.
            name: row[col.name] + "",

            custom: {
                data: row,
                denominator: denominatorValue
            }
        };

        if (xType === "datetime") {
            // For datetime axes, the X value is the timestamp in milliseconds since 1970.
            point.x = +moment(row[col.name] + "", "YYYY-MM-DD")

            // For datetime axes, point name is the formatted date
            point.name = moment(row[col.name] + "", "YYYY-MM-DD").format(dateFormat)
        }

        // For linear (numeric) axes, the X value is the numeric value or 0.
        if (xType === "linear") {
            point.x = +(row[col.name] || 0)
        }
        
        return point
    }

    // ========================================================================
    // Simple case: Y = count; X = column.name
    // This applis to pie charts or other charts with single series.
    // Denominator is not applicable here as the value would have to be
    // compared to itself, thus the result will always be 100%!
    // ========================================================================
    if (!groupBy) {
        const rows = dataSet.rows;
        const data = rows.map(row => pointFromRow(row, column))//.sort((a, b) => a.name!.localeCompare(b.name || ""));

        series.push({
            type,
            data,
            name: column.label || column.name,
            colorIndex: series.length % colors.length,
            fillColor: type === "areaspline" ? {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                    [0, new Color(colors[series.length % colors.length]).setOpacity(0.2 ).get('rgba') + ""],
                    [1, new Color(colors[series.length % colors.length]).setOpacity(0.05).get('rgba') + ""]
                ]
            }: undefined
        });
    }

    // ========================================================================
    // Complex case:
    //     Y = count or %
    //     X = column.name
    //     X.stratifier = groupBy
    // ========================================================================
    else {
        let groups = Array.from(dataSet.getUniqueValuesFromColumn(groupBy.name))//.map(String)
        

        // For each group
        groups.sort().forEach((groupName, i) => {
            let set: any = {
                type,
                name: groupBy.dataType.startsWith("date") ? moment(groupName + "", "YYYY-MM-DD").format(getDateFormat(groupBy, true)) : groupName + "",
                data: [],
                colorIndex: i % colors.length,
                fillColor: type === "areaspline" ? {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, new Color(colors[i % colors.length]).setOpacity(0.2 ).get('rgba') + ""],
                        [1, new Color(colors[i % colors.length]).setOpacity(0.05).get('rgba') + ""]
                    ]
                }: undefined
            };

            // All data rows in this group
            let rows = dataSet.where({ [groupBy.name]: groupName }).rows;

            // ================================================================
            // Category charts
            // ================================================================
            if (xType === "category") {
                let categories = Array.from(dataSet.getUniqueValuesFromColumn(column.name))//.map(String)
                rows = rows.sort((a, b) => categories.indexOf(a[column.name]) - categories.indexOf(b[column.name]));

                categories.sort().forEach(category => {
                    let row = rows.find(r => (
                        r[column.name ] === category &&
                        r[groupBy.name] === groupName
                    ));

                    if (row) {
                        set.data.push(pointFromRow(row, column))
                    } else {
                        set.data.push({ y: null, name: category })
                    }
                })
            }

            // ================================================================
            // Linear or timeline charts
            // ================================================================
            else {
                rows.forEach(row => set.data.push(
                    pointFromRow(row, column)
                ));
            }

            series.push(set);
        })        
    }

    // ================================================================
    // Additional Series (if any)
    // ================================================================
    if (column2 && column2type) {
        
        let groups = Array.from(dataSet.getUniqueValuesFromColumn(column.name));
        
        let _series: Record<string, any> = {};

        let sub = fullDataSet.pick([column.name, column2.name]);
        groups.forEach(x => {
            let data = sub.where({ [column.name]: x });

            data.rows.forEach((row, i) => {
                let groupName = row[column2.name];
                let group = _series[groupName + ""];
                if (!group) {
                    group = _series[groupName + ""] = {
                        type: column2type as SupportedNativeChartTypes,
                        name: groupName,
                        colorIndex: (series.length + i) % colors.length,
                        dashStyle: "ShortDash",
                        lineWidth: 1,
                        zIndex: 10,
                        opacity: column2opacity,
                        borderColor: "rgba(0, 0, 0, 0.8)",
                        color: column2type === "spline" ? undefined : {
                            pattern: {
                                path: {
                                    d: 'M 0 0 L 0 6',
                                    strokeWidth: 11
                                },
                                width : 6,
                                height: 6,
                                opacity: 0.6,
                                patternTransform: 'scale(0.49) rotate(45)'
                            }
                        },
                        data: []
                    };
                }

                let value = row.cnt;
                let denominatorValue = 0;

                
                if (denominator === "local") {
                    denominatorValue = fullDataSet.countWhere({ [column.name]: row[column.name] });
                    value = value/denominatorValue * 100
                }
                
                // Convert the count to % of the total count
                else if (denominator === "global") {
                    denominatorValue = fullDataSet.countAll();
                    value = value/denominatorValue * 100
                }

                let point: any = {
                    // x: row[column.name],
                    y: value,
                    custom: {
                        data: row,
                        denominator: denominatorValue,
                        secondary: true
                    }
                };

                if (xType === "datetime") {
                    // For datetime axes, point name is the formatted date
                    point.name = moment(row[column.name] + "", "YYYY-MM-DD").format(dateFormat)

                    // For datetime axes, the X value is the timestamp in milliseconds since 1970.
                    point.x = +moment(row[column.name] + "", "YYYY-MM-DD")
                }
        
                // For linear (numeric) axes, the X value is the numeric value or 0.
                if (xType === "linear") {
                    point.x = +(row[column.name] || 0)
                }

                if (xType === "category") {
                    point.name = x
                }

                group.data.push(point)
            });
        });

        series = series.concat(Object.values(_series));
    }

    return series
}

export function buildChartOptions({
    options = {},
    column,
    groupBy,
    dataSet,
    fullDataSet,
    colorOptions,
    denominator = "",
    type,
    column2,
    column2type,
    column2opacity = 1
}: {
    options?: Highcharts.Options
    column: app.DataRequestDataColumn
    dataSet: PowerSet
    fullDataSet: PowerSet
    groupBy?: app.DataRequestDataColumn | null
    type: SupportedNativeChartTypes
    colorOptions: app.ColorOptions
    denominator?: string
    column2    ?: app.DataRequestDataColumn | null
    column2type?: string
    column2opacity?: number
}): Highcharts.Options
{
    const COLORS = colorOptions.colors.map(c => new Color(c).setOpacity(colorOptions.opacity).get("rgba") + "")

    const series = getSeries({
        dataSet,
        column,
        groupBy,
        // @ts-ignore
        type: type,
        fullDataSet,
        colors: COLORS,
        denominator,
        column2,
        column2type,
        column2opacity
    });

    let xType = getXType(column, groupBy);

    return merge(options, {
        chart: {
            marginTop: type === "pie" || options.title?.text ? null : 40,
            options3d: {
                depth: Math.min(series.length * 10, 100),
            },
            plotBorderWidth: options.chart?.options3d?.enabled ? 0 : options.chart?.plotBorderWidth
        },
        colors: COLORS,
        yAxis: {
            allowDecimals: denominator ? true : false,
            labels: {
                format: denominator ? "{text}%" : "{text}",
            }
        },
        plotOptions: {
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
            custom: {
                opacity: colorOptions.opacity,
                denominator
            }
        },
        tooltip: {
            formatter(): any {
                const rows = [];

                // @ts-ignore
                if (!this.point.custom.secondary) {
                    // @ts-ignore
                    rows.push(`<tr><td style="text-align:right">${column.label || column.name}:</td><td><b>${this.point.name}</b></td></tr>`)
                    if (groupBy) {
                        // @ts-ignore
                        rows.push(`<tr><td style="text-align:right">${groupBy.label || groupBy.name}:</td><td><b>${this.series.name}</b></td></tr>`)
                    }
                }
                // @ts-ignore
                rows.push(`<tr><td style="text-align:right">Count:</td><td><b>${this.point.custom.data.cnt}</b></td></tr>`)
                
                if (denominator) {
                    // @ts-ignore
                    rows.push(`<tr class="color-blue"><td style="text-align:right">Computed Value:</td><td><b>${this.point.y?.toPrecision(3)}% of ${this.point.custom.denominator}</b></td></tr>`)
                }
                
                // @ts-ignore
                let data = this.point.custom?.data as Record<string, any>
                if (data) {

                    const otherRows = Object.keys(data).filter(key => (
                        data[key] !== null &&
                        data[key] !== undefined &&
                        key !== "cnt" &&
                        key !== column.name &&
                        (!groupBy || key !== groupBy.name)
                    ));

                    if (otherRows.length) {
                        rows.push(`<tr><td style="text-align:center;padding: 5px 0" colspan="2"><hr/></td></tr>`)
                        otherRows.forEach(key => {
                            rows.push(`<tr style="color:#666"><td style="text-align:right">${
                                dataSet.getLabelForColumnName(key)
                            }:</td><td>${format(data[key], fullDataSet.getColumnByName(key)!.dataType, {
                                html: true,
                                maxLength: 70,
                                skipNull: true
                            })}</td></tr>`)
                        })
                    }
                }
                return `<table>${rows.join("")}</table>`
            }
        },
        xAxis: {
            type: xType
        },
        series
    }) as Highcharts.Options
}





interface ChartProps {
    options       ?: Highcharts.Options
    column         : app.DataRequestDataColumn
    dataSet        : PowerSet
    fullDataSet    : PowerSet
    groupBy       ?: app.DataRequestDataColumn | null
    type           : SupportedNativeChartTypes
    colorOptions   : app.ColorOptions
    denominator   ?: string
    column2       ?: app.DataRequestDataColumn | null
    column2type   ?: string
    column2opacity?: number
}

export default class Chart extends React.Component<ChartProps>
{
    chart: any;

    constructor(props: ChartProps) {
        super(props);
        this.updateChart = this.updateChart.bind(this);
    }

    updateChart() {
        const chartOptions = buildChartOptions(this.props)
        // console.log(JSON.stringify(chartOptions))
        this.chart.update(chartOptions)
    }

    componentDidMount() {
        const chartOptions = buildChartOptions(this.props)
        // console.log(chartOptions)
        this.chart = Highcharts.chart("chart", chartOptions);
    }

    componentDidUpdate() {
        defer(this.updateChart);
    }

    render() {
        return <div id="chart" className="main-chart"/>
    }
}

interface Chart2Props {
    options: Highcharts.Options
}
export class Chart2 extends React.Component<Chart2Props>
{
    chart: any;

    constructor(props: Chart2Props) {
        super(props);
        this.updateChart = this.updateChart.bind(this);
    }

    updateChart() {
        this.chart.update(this.props.options, true, true, false)
    }

    componentDidMount() {
        this.chart = Highcharts.chart("chart", this.props.options);
    }

    componentDidUpdate() {
        defer(this.updateChart);
    }

    render() {
        return <div id="chart" className="main-chart"/>
    }
}