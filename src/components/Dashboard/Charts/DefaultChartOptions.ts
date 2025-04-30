import { merge, Options, PointMarkerOptionsObject } from "highcharts"
import Pie                from "./Pie"
import Pie3d              from "./Pie3d"
import Donut              from "./Donut"
import Donut3d            from "./Donut3d"
import Column             from "./Column"
import Column3d           from "./Column3d"
import ColumnStack        from "./ColumnStack"
import ColumnStack3d      from "./ColumnStack3d"
import Bar                from "./Bar"
import Bar3d              from "./Bar3d"
import BarStack           from "./BarStack"
import BarStack3d         from "./BarStack3d"
import Spline             from "./Spline"
import AreaSpline         from "./AreaSpline"
import Line               from "./Line"
import Area               from "./Area"
import {
    SupportedChartTypes,
    DEFAULT_FONT_SIZE,
    DEFAULT_FONT_FAMILY,
    COLOR_THEMES,
    DEFAULT_COLOR_THEME,
    TURBO_THRESHOLD
} from "../config"


const marker: PointMarkerOptionsObject = {
    enabledThreshold: 1000,
    radius   : 4,
    lineWidth: 0.5,
    states: {
        hover: {
            lineWidth: 2,
            radius   : 5,
        },
        select: {
            lineWidth: 2,
            radius: 5,
            lineColor: "#000000",
            fillColor: "#FFFFFF",
        }
    }
}

const colors = COLOR_THEMES.find(t => t.id === DEFAULT_COLOR_THEME)!.colors

const DefaultChartOptions: Options = {
    chart: {
        type: "spline",
        height: null,
        width: null,
        panning: {
            enabled: true
        },
        zooming: {
            type: "x"
        },
        panKey: 'shift',
        spacingTop   : 25,
        spacingRight : 25,
        spacingBottom: 25,
        spacingLeft  : 25,
        animation: false /*{
            duration: 400,
            defer: 0,
        }*/,
        options3d: {
            enabled: false
        },
        plotBorderColor: "#999999",
        plotBorderWidth: 0,
        borderWidth: 0,
        // borderColor: "#d1dae2",
        // borderRadius: 5,
        backgroundColor: "#FFFFFF",
        style: {
            fontSize  : DEFAULT_FONT_SIZE + "px",
            fontFamily: DEFAULT_FONT_FAMILY,
            color     : "#333333"
        }
    },
    exporting: {
        buttons: {
            contextButton: {
                symbolStroke: "#0004",
                theme: {
                    fill: "none"
                },
                menuItems: [
                    "viewFullscreen",
                    "printChart",
                    "separator",
                    // "downloadPNG",
                    // "downloadJPEG",
                    // "downloadPDF",
                    "downloadSVG",
                    // "separator",
                    "downloadCSV",
                    // "downloadXLS"
                ]
            }
        },
        sourceWidth: 1000,
        sourceHeight: 600,
        scale: 3,
        fallbackToExportServer: false
    }, 
    credits: {
        enabled: true,
        href: "https://smarthealthit.org/",
        style: {
            fontSize: "10px",
            color: "#999999",
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
        text: "",
        style: {
            fontWeight: "bold"
        },
    },
    legend: {
        enabled: true,
        useHTML: true,
        maxHeight: 200
        // margin: 0,
        // padding: 0
    },
    colors,
    yAxis: {
        title: {
            text: "",
            skew3d: true,
            margin: 15,
            style: {
                fontWeight: "bold"
            }
        },
        allowDecimals: true,
        max: null,
        // maxPadding: 0,
        // minPadding: 0,
        endOnTick: false,
        gridLineWidth: 0.5,
        gridLineColor: "#DDDDDD",
        tickColor: "#DDDDDD",
        // @ts-ignore
        tickLength: 10,
        tickWidth: 0,
        gridZIndex: 0,
        // endOnTick: true,
        // startOnTick: true,
        // floor: denominator ? 0 : undefined,
        // ceiling: denominator ? 100 : undefined,
        labels: {
            enabled: true,
            format: "{text}"
        },
        lineWidth: 0,
        lineColor: "#999999",
        // softMax: denominator ? 100 : undefined,            
        
        // Up to 10X Zoom
        // softMax: series.reduce((prev, cur) => {
        //     const max = cur.data ?
        //         (cur.data as Highcharts.XrangePointOptionsObject[]).reduce((p: number, c) => Math.max(p, c.y || 0), 0) :
        //         prev;
        //     return Math.max(prev, max)
        // }, 0) / 10,
    },
    plotOptions: {
        series: {
            borderColor     : "rgba(0, 0, 0, 0.5)",
            // @ts-ignore
            edgeColor       : "rgba(0, 0, 0, 0.5)",
            borderWidth     : 0.25,
            edgeWidth       : 0.25,
            allowPointSelect: true,
            cursor          : 'default',
            showInLegend    : true,
            animation: false /*{
                duration: 0,//400,
                defer: 0,
            }*/,
            dataSorting: { enabled: false },
            dataLabels: {
                style: {
                    fontSize   : "0.7em",
                    color      : "contrast",
                    textOutline: "1px contrast",
                    fontWeight : "700"
                }
            },
            states: {
                hover: {
                    opacity: 1
                }
            },
            turboThreshold: TURBO_THRESHOLD
        },
        pie: {
            startAngle      : 0,
            innerSize       : 0,
            depth           : 50,
            slicedOffset    : 15,
            // center          : ["50%", "50%"],
            // size            : "75%",
            dataLabels: {
                enabled: true,
                useHTML: true,
            }
        },
        column: {
            getExtremesFromAll: true,
            borderRadius      : 0,
            pointPadding      : 0.02,
            groupPadding      : 0.2,
            crisp             : false,
            stacking          : undefined,
            states: {
                select: {
                    borderWidth: 1,
                    color: "#999999"
                }
            }
        },
        bar: {
            getExtremesFromAll: true,
            borderRadius      : 0,
            pointPadding      : 0.02,
            groupPadding      : 0.2,
            stacking          : undefined,
            crisp             : false,
            states: {
                select: {
                    borderWidth: 1,
                    color: "#999999"
                }
            },
        },
        area: {
            trackByArea: true,
            stickyTracking: true,
            marker,
            lineWidth: 2,
            connectNulls: false,
            getExtremesFromAll: true,
            dashStyle: "Solid",
            fillOpacity: 0.5
        },
        areaspline: {
            // Whether the whole area or just the line should respond to mouseover
            // tooltips and other mouse or touch events. Defaults to false.
            trackByArea: true,
            stickyTracking: true,
            marker,
            lineWidth: 2,
            states: {
                normal: {
                    // @ts-ignore
                    lineWidth: 2,
                },
                hover: {
                    lineWidth: 3,
                    lineWidthPlus: 3,
                    shadow: true, // show them even on datetime charts
                }
            },
            connectNulls: false,
            getExtremesFromAll: true,
            dashStyle: "Solid",
            fillOpacity: 0.5
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
                    enabled: false // No hover on ranges normally
                }
            }
        },
        spline: {
            marker,
            lineWidth: 2,
            connectNulls: true,
            dashStyle: "Solid",
        },
        line: {
            marker,
            lineWidth: 2,
            connectNulls: true,
            dashStyle: "Solid",
        }
    },
    tooltip: {
        useHTML: true,
        borderColor: "rgba(0, 0, 0, 0.4)",
        backgroundColor: "#FFFFFFEE",
        outside: false,
        hideDelay: 100,
        style: {
            zIndex: 1000000
        }
    },
    xAxis: {
        crosshair: true,
        currentDateIndicator: true,
        // minRange: xType === "category" ? undefined : 1,
        // maxRange: xType === "category" ? undefined : 2,

        tickLength: 10,
        tickWidth: 0,
        // minRange: 1,
        // maxRange: 2,
        startOnTick: false,
        endOnTick: false,
        minPadding: 0,
        maxPadding: 0,
        lineWidth: 1,
        lineColor: "#99999999",
        gridLineColor: "#DDDDDD",
        gridLineWidth: 0,
        tickColor: "#DDDDDD",
        gridZIndex: 0,
        
        // maxPadding: 0,
        labels: {
            enabled: true,
            // align: "center"
            autoRotationLimit: 80,
            overflow: "justify",
            padding: 2,
            autoRotation: [-45, -90],
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
        title: {
            // text: "",
            // position3d: "ortho",
            skew3d: true,
            margin: 15,
            style: {
                fontWeight: "bold"
            }
        },
        dateTimeLabelFormats: {
            millisecond: '%e %b %Y',
            second     : '%e %b %Y',
            minute     : '%e %b %Y',
            hour       : '%e %b %Y',
            day        : '%e %b %Y', // %e. %b
            week       : '%e %b %Y', // %e. %b
            month      : '%b %Y'   , // %b \'%y
            year       : '%Y'
        }
    },
    annotations: [],
    lang: {
        thousandsSep: ',',
        decimalPoint: '.',
        noData: `
            <text x="180" y="30" text-anchor="middle" fill="#C30F" stroke="#FFF6"
                stroke-width="0.5" style="font-size:20px; font-weight:900">No data to display!</text>
            <text x="180" y="50" text-anchor="middle" fill="#888C" stroke="#FFF6"
                stroke-width="0.5" style="font-size:15px; font-weight:500">If you have filters applied,
                try changing or removing them.</text>`,
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
};

export default DefaultChartOptions

const chartTypes: Record<string, Options> = {
    "pie"          : Pie,
    "pie3d"        : Pie3d,
    "donut"        : Donut,
    "donut3d"      : Donut3d,
    "line"         : Line,
    "spline"       : Spline,
    "area"         : Area,
    "areaspline"   : AreaSpline,
    "column"       : Column,
    "column3d"     : Column3d,
    "columnStack"  : ColumnStack,
    "columnStack3d": ColumnStack3d,
    "bar"          : Bar,
    "bar3d"        : Bar3d,
    "barStack"     : BarStack,
    "barStack3d"   : BarStack3d,
}

export function getDefaultChartOptions(
    type: keyof typeof SupportedChartTypes,
    userOptions: Options = {},
    applyTypeOverrides = false
): Options {
    const typeOptions = chartTypes[type] || chartTypes.spline
    return applyTypeOverrides ?
        merge(DefaultChartOptions, userOptions, typeOptions) :
        merge(DefaultChartOptions, typeOptions, userOptions)
}
