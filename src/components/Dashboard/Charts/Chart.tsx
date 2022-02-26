import React     from "react";
import { Color } from "highcharts"
import moment    from "moment";
import PowerSet  from "../../../PowerSet";
import { defer, format } from "../../../utils";
import { CHART_COLORS, SupportedNativeChartTypes } from "../config";

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
    type
}: {
    column: app.DataRequestDataColumn
    dataSet: PowerSet
    groupBy?: app.DataRequestDataColumn | null
    type: SupportedNativeChartTypes 
}): SeriesOptions[]
{    
    let xType = getXType(column, groupBy);

    let series: SeriesOptions[] = []

    let dateFormat = getDateFormat(column, true)

    function pointFromRow(row: { cnt: number, [key: string]: any }, col: app.DataRequestDataColumn): Highcharts.XrangePointOptionsObject {
        const point: Highcharts.XrangePointOptionsObject = {
            // Y is always the patient count
            y: row.cnt,

            // The name of the point as shown in the legend, tooltip, dataLabels, etc.
            name: row[col.name] + "",

            custom: {
                data: row
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

    // Simple case: Y = count; X = column.name ================================
    if (!groupBy) {
        // const rows = dataSet.pick([ column.name ]).rows;
        const rows = dataSet.rows;
        // console.log("pick ===>", rows)
        const data = rows.map(row => pointFromRow(row, column))//.sort((a, b) => a.name!.localeCompare(b.name || ""));

        series.push({
            type,
            data,
            name: column.label || column.name,
            fillColor: type === "areaspline" ? {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, new Color(CHART_COLORS[series.length % CHART_COLORS.length]).setOpacity(0.2).get('rgba') + ""],
                    [1, new Color(CHART_COLORS[series.length % CHART_COLORS.length]).setOpacity(0.05).get('rgba') + ""]
                ]
            }: undefined
        });
    }

    // Complex case: Y = count; X = column.name, groupBy
    else {
        let groups     = Array.from(dataSet.getUniqueValuesFromColumn(groupBy.name))//.map(String)
        let categories = Array.from(dataSet.getUniqueValuesFromColumn(column.name))//.map(String)

        groups.sort().forEach((groupName, i) => {
            let set: any = {
                type,
                name: groupBy.dataType.startsWith("date") ?
                    moment(groupName + "", "YYYY-MM-DD").format(getDateFormat(groupBy, true)) :
                    groupName + "",
                data: [],
                colorIndex: i,
                fillColor: type === "areaspline" ? {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, new Color(CHART_COLORS[series.length % CHART_COLORS.length]).setOpacity(0.3).get('rgba') + ""],
                        [1, new Color(CHART_COLORS[series.length % CHART_COLORS.length]).setOpacity(0.1).get('rgba') + ""]
                    ]
                }: undefined
            };

            let rows = dataSet.pick([ column.name, groupBy.name ]).where({
                [groupBy.name]: groupName
            }).rows;

            // If this is a categories chart
            if (xType === "category") {
                rows = rows.sort((a, b) => categories.indexOf(a[column.name]) - categories.indexOf(b[column.name]));

                categories.sort().forEach(category => {
                    let row = dataSet.rows.filter(r => {
                        // for (let key in r) {
                        //     if (key === "cnt" || key === "queryid") continue
                        //     if (key !== column.name && key !== groupBy.name && !PowerSet.isEmpty(r[key])) {
                        //         return false
                        //     }
                        // }
                        return (
                            r[column.name ] === category &&
                            r[groupBy.name] === groupName
                        )
                    }).map(row => pointFromRow(row, column))[0];

                    set.data.push(row || { y: null, name: category })
                })
            }
            else {
                rows.forEach(row => set.data.push(pointFromRow(row, column)));
            }

            series.push(set);
        })        
    }

    return series
}

export function needsCrosshair(type: string, column: app.DataRequestDataColumn, groupBy?: app.DataRequestDataColumn | null): boolean {
    const xType = getXType(column, groupBy);
    if (type === "spline" || type === "areaspline") {
        if (xType === "category") {
            return false
        }
        // if (!!groupBy) {
        //     return true
        // }
        return true
    }
    return false
}

export function buildChartOptions({
    options = {},
    column,
    groupBy,
    dataSet,
    type
}: {
    options?: Highcharts.Options
    column: app.DataRequestDataColumn
    dataSet: PowerSet
    groupBy?: app.DataRequestDataColumn | null
    type: SupportedNativeChartTypes
}): Highcharts.Options
{
    const series = getSeries({ dataSet, column, groupBy, type })

    let xType = getXType(column, groupBy)
    
    return {
        ...options,
        chart: {
            height: "60%",
            type,
            panning: {
                enabled: true
            },
            panKey: 'shift',
            // scrollablePlotArea: {
            //     minWidth: 600
            // },
            // reflow: false,
            marginRight: type === "pie" ? undefined : 40,
            marginTop: type === "pie" ? undefined : 40,
            spacingBottom: 20,
            zoomType: type === "spline" ||
                      type === "areaspline" ||
                      type === "column" ||
                      type === "bar" ||
                      type === "area" ?
                (series[0]?.data || []).length > 2 ? "x" : undefined :
                undefined,
            ...options.chart,
            animation: {
                duration: 400,
                defer: 0,
                easing
            },
            options3d: {
                depth: Math.min(series.length * 10, 100),
                ...options.chart?.options3d
            },
        },
        lang: {
            noData: `<div style="text-align:center;padding:10px;color:#900;font-size:15px">No data to display!</div>
            <div style="padding:0 20px 10px;font-weight:400">If you have filters applied, try changing or removing them.</div>`,
        },
        noData: {
            attr: {
                fill: "#F6F6F6",
                r: 5,
                stroke: "#E6E6E6",
                "stroke-width": "1px"
            },
            useHTML: true
        },
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: ["viewFullscreen", "printChart", "separator", "downloadPNG", "downloadJPEG", "downloadPDF", "downloadSVG", "separator", "downloadCSV", "downloadXLS"]
                }
            }
        }, 
        credits: {
            enabled: true,
            href: "https://smarthealthit.org/",
            style: {
                fontSize: "10px",
                color: "#999",
                fontWeight: "bold"
            },
            position: {
                y: -8,
                x: -8,
                align: "right"
            },
            text: "SMART®"
        },
        title: {
            text: "",//series.length ? getChartTitleText(column, groupBy) : "",
            ...options.title,
        },
        legend: {
            enabled: series.length > 1 || type === "pie",
            ...options.legend,
        },
        colors: CHART_COLORS,
        yAxis: {
            // lineColor: "rgba(0, 0, 0, 0.2)",
            // lineWidth: 1,
            title: {
                text: "Count",
                // style: {
                //     fontWeight: "bold",
                //     // fontSize: "120%"
                // }
            },
            
            // Up to 10X Zoom
            softMax: series.reduce((prev, cur) => {
                const max = cur.data ?
                    (cur.data as Highcharts.XrangePointOptionsObject[]).reduce((p: number, c) => Math.max(p, c.y || 0), 0) :
                    prev;
                return Math.max(prev, max)
            }, 0) / 10,
            ...options.yAxis,
        },
        plotOptions: {
            series: {
                borderColor     : "rgba(0, 0, 0, 0.5)",
                borderWidth     : 0.25,
                allowPointSelect: true,
                cursor          : 'pointer',
                showInLegend    : true,
                animation: {
                    duration: 400,
                    defer: 0,
                    easing,
                }
            },
            pie: {
                // startAngle : 20,
                innerSize       : 0,
                depth           : 50,
                slicedOffset    : 10,
                // @ts-ignore
                edgeColor: "rgba(0, 0, 0, 0.1)",
                ...options.plotOptions?.pie,
                dataLabels: {
                    enabled: true,
                    // format: `<b>{point.name}</b><span style="opacity:0.5;font-weight:400"> - {point.percentage:.1f} %</span>`,
                    formatter() {
                        if (this.point) {
                            // console.log(this.point)
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
                                suffix = `<span style="opacity:0.5;font-weight:400"> - ${parseFloat((this.point.percentage || 0).toPrecision(2))} %</span>`
                            }

                            return label + suffix
                        }
                    },
                    ...options.plotOptions?.pie?.dataLabels,
                }

            },
            column: {
                edgeColor: "rgba(0, 0, 0, 0.1)",
                getExtremesFromAll: true,
                states: {
                    select: {
                        borderWidth: 1,
                        color: "#999"
                    }
                },
                ...options.plotOptions?.column,
            },
            bar: {
                edgeColor: "rgba(0, 0, 0, 0.1)",
                getExtremesFromAll: true,
                states: {
                    select: {
                        borderWidth: 1,
                        color: "#999"
                    }
                },
                ...options.plotOptions?.bar,
            },
            areaspline: {
                // fillOpacity: 0.1,
                marker: {
                    radius: 2.5,
                    enabled: true,
                    states: {
                        select: {
                            radius: 4
                        }
                    }
                },
                lineWidth: 1.5,
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 2,
                        shadow: true, // show them even on datetime charts
                    }
                },
                connectNulls: false,
                getExtremesFromAll: true,
                ...options.plotOptions?.areaspline
            },
            area: {
                fillOpacity: 0.2,
                marker: {
                    radius: 2.5,
                    enabled: true,
                    states: {
                        select: {
                            radius: 4,
                        }
                    }
                },
                lineWidth: 1.5,
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 2,
                        shadow: true, // show them even on datetime charts
                    }
                },
                connectNulls: false,
                getExtremesFromAll: true,
                ...options.plotOptions?.area,
                // @ts-ignore
                depth: Math.min(options.plotOptions?.areaspline?.depth || 10,  100/(series.length || 1)),
            },
            spline: {
                marker: {
                    radius: 2.5,
                    enabled: true,
                    states: {
                        select: {
                            radius: 4
                        }
                    }
                },
                lineWidth: 1.5,
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 2,
                        shadow: true, // show them even on datetime charts
                    }
                },
                connectNulls: false
            }
        },
        tooltip: {
            useHTML: true,
            // outside: true,
            // headerFormat: `<table>`,    
            // pointFormat : [
            //     `<tr><td style="text-align:right">${column.label || column.name}:</td><td><b>{point.name}</b></td></tr>`, 
            //     groupBy && `<tr><td style="text-align:right">${groupBy.label || groupBy.name}:</td><td><b>{series.name}</b></td></tr>`,
            //     `<tr><td style="text-align:right">Count:</td><td><b>{point.y}</b></td></tr>`,
            //     `<tr><td style="text-align:right">Other:</td><td><b>{point.custom}</b></td></tr>`
            // ].filter(Boolean).join("\n"),
            // footerFormat: '</table>',
            style: {
                // whiteSpace: "normal"
            },

            formatter() {
                const rows = [
                    `<tr><td style="text-align:right">${column.label || column.name}:</td><td><b>${this.point.name}</b></td></tr>`, 
                    groupBy && `<tr><td style="text-align:right">${groupBy.label || groupBy.name}:</td><td><b>${this.series.name}</b></td></tr>`,
                    `<tr><td style="text-align:right">Count:</td><td><b>${this.point.y}</b></td></tr>`,
                    // `<tr><td style="text-align:right">Other:</td><td><b>{point.custom}</b></td></tr>`
                ];
                
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
                            }:</td><td>${format(data[key], dataSet.getColumnByName(key)!.dataType, {
                                html: true,
                                maxLength: 70,
                                skipNull: true
                            })}</td></tr>`)
                        })
                    }
                }
                return `<table>${rows.join("")}</table>`
            },
            ...options.tooltip
        },
        xAxis: {
            type: xType,
            crosshair: needsCrosshair(type, column, groupBy),
            lineColor: "rgba(0, 0, 0, 0.2)",
            currentDateIndicator: true,
            minRange: xType === "category" ? undefined : 1,
            maxRange: xType === "category" ? undefined : 2,
            // minRange: 1,
            // maxRange: 2,
            // startOnTick: false,
            // endOnTick: false,
            // minPadding: 0,
            // maxPadding: 0,
            labels: {
                // align: "center"
                autoRotationLimit: 80,
                overflow: "justify",
                padding: 1,
                // staggerLines: 0,

                // style: {
                //     textOverflow: "ellipsis",
                //     // whiteSpace: "pre-wrap",
                //     // wordBreak: "break-all"
                // //     // width: 120
                // //     // fontSize: "80%"
                // },
                // autoRotation: [-60],
                // position3d: "ortho",
                // skew3d: true

            },
            ...options.xAxis
        },
        series
    }
}





interface ChartProps {
    options?: Highcharts.Options
    column  : app.DataRequestDataColumn
    dataSet : PowerSet
    groupBy?: app.DataRequestDataColumn | null
    type    : SupportedNativeChartTypes
}
export default class Chart extends React.Component<ChartProps>
{
    chart: any;

    constructor(props: ChartProps) {
        super(props);
        this.updateChart = this.updateChart.bind(this);
    }

    updateChart() {
        const { options = {}, column, groupBy, dataSet, type } = this.props;
        this.chart.update(buildChartOptions({ options, column, groupBy, dataSet, type }), true, true, false)
        // console.log(this.props.chartOptions)
    }

    componentDidMount()
    {
        const { options = {}, column, groupBy, dataSet, type } = this.props;
        this.chart = Highcharts.chart("chart", buildChartOptions({ options, column, groupBy, dataSet, type }));
        // console.log(this.props.chartOptions)
    }

    componentDidUpdate()
    {
        defer(this.updateChart);
    }

    render() {
        return <div id="chart" className="main-chart"/>
    }
}