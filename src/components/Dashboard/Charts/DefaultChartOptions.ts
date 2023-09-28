import { merge } from "highcharts";
import { generateColors } from "../../../utils";
import { SupportedChartTypes, DEFAULT_FONT_SIZE, DEFAULT_FONT_FAMILY } from "../config";

const DefaultChartOptions = {
    chart: {
        type: "areaspline",
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
        animation: {
            duration: 400,
            defer: 0,
        },
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
            fontSize: DEFAULT_FONT_SIZE + "px",
            fontFamily: DEFAULT_FONT_FAMILY,
            color: "#333333"
        }
    },
    lang: {
        noData: `<div style="text-align:center;padding:10px;color:#900000;font-size:15px">No data to display!</div>
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
        text: "",//series.length ? getChartTitleText(column, groupBy) : "",
        style: {
            fontWeight: "bold"
        },
    },
    legend: {
        enabled: true,
        // margin: 0,
        // padding: 0
    },
    colors: generateColors(16),
    yAxis: {
        title: {
            text: "",
            skew3d: true,
            margin: 15,
            // offset: 20,
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
            edgeColor       : "rgba(0, 0, 0, 0.5)",
            borderWidth     : 0.25,
            edgeWidth       : 0.25,
            allowPointSelect: true,
            cursor          : 'default',
            showInLegend    : true,
            animation: {
                duration: 0,//400,
                defer: 0,
            }
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
        areaspline: {
            trackByArea: false,
            stickyTracking: true,
            marker: {
                enabled: false,
                radius: 4,
                lineColor: "#000000",
                fillColor: "#FFFFFF",
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1,
                        lineWidthPlus: 0,
                        radius: 4,
                    },
                    select: {
                        enabled: true,
                        lineWidth: 2,
                        fillColor: "#FFFFFF",
                        radius: 5,
                        lineWidthPlus: 1
                    }
                }
            },
            lineWidth: 2,
            states: {
                hover: {
                    lineWidth: 3,
                    shadow: true, // show them even on datetime charts
                }
            },
            connectNulls: false,
            getExtremesFromAll: true,
            dashStyle: "Solid",
            fillOpacity: 0.5
        },
        spline: {
            marker: {
                enabled: false,
                radius: 4,
                lineColor: "#000000",
                fillColor: "#FFFFFF",
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1,
                        lineWidthPlus: 0,
                        radius: 4,
                    },
                    select: {
                        enabled: true,
                        lineWidth: 2,
                        fillColor: "#FFFFFF",
                        radius: 5,
                        lineWidthPlus: 1
                    }
                }
            },
            lineWidth: 2,
            states: {
                hover: {
                    lineWidth: 3,
                    shadow: true, // show them even on datetime charts
                }
            },
            connectNulls: true,
            dashStyle: "Solid",
        }
    },
    tooltip: {
        useHTML: true
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
        offset: 0,
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
    annotations: []
};

export default DefaultChartOptions

export function getDefaultChartOptions(type: keyof typeof SupportedChartTypes, customOptions: Partial<Highcharts.Options> = {}): Highcharts.Options {
    switch (type) {
        case "pie":
            return merge(DefaultChartOptions as unknown, {
                plotOptions: {
                    pie: {
                        slicedOffset: 30,
                    }
                }
            }, customOptions, {
                chart: {
                    type: "pie",
                    options3d: {
                        enabled: false
                    }
                },
                plotOptions: {
                    pie: {
                        innerSize: 0
                    }
                },
                xAxis: {
                    lineWidth: 0
                }

            }) as Highcharts.Options;
        
        case "pie3d":
            return merge(DefaultChartOptions as unknown, {
                plotOptions: {
                    pie: {
                        slicedOffset: 30,
                    }
                }
            }, customOptions, {
                chart: {
                    type: "pie",
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0,
                        depth: 350
                    }
                },
                plotOptions: {
                    pie: {
                        innerSize: 0
                    }
                },
                xAxis: {
                    lineWidth: 0
                }
            }) as Highcharts.Options;

        case "donut":
            return merge(DefaultChartOptions as unknown, {
                plotOptions: {
                    pie: {
                        // innerSize: "50%",
                        slicedOffset: 10
                    }
                }
            }, customOptions, {
                chart: {
                    type: "pie",
                    options3d: {
                        enabled: false
                    }
                },
                plotOptions: {
                    pie: {
                        innerSize: "50%",
                        // slicedOffset: 10
                    }
                },
                xAxis: {
                    lineWidth: 0
                }
            }) as Highcharts.Options;

        case "donut3d":
            return merge(DefaultChartOptions as unknown, {
                chart: {
                    type: "pie",
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0,
                        depth: 350
                    }
                },
                plotOptions: {
                    pie: {
                        innerSize: "50%",
                        slicedOffset: 30
                    }
                }
            }, customOptions, {
                chart: {
                    type: "pie",
                    options3d: {
                        enabled: true
                    }
                },
                plotOptions: {
                    pie: {
                        innerSize: "50%"
                    }
                },
                xAxis: {
                    lineWidth: 0
                }
            }) as Highcharts.Options;

        case "column":
            return merge(DefaultChartOptions as unknown, customOptions, {
                chart: {
                    type: "column",
                    options3d: {
                        enabled: false
                    }
                },
                plotOptions: {
                    column: {
                        stacking: undefined,
                        crisp: false
                    }
                },
                xAxis: {
                    offset: 0
                }
            }) as Highcharts.Options;

        case "column3d":
            return merge(DefaultChartOptions as unknown, customOptions, {
                chart: {
                    type: "column",
                    options3d: {
                        enabled: true,
                        alpha: 10,
                        beta: 15,
                        depth: 80,
                        fitToPlot: true,
                        viewDistance: 60,
                        axisLabelPosition: null
                    }
                },
                plotOptions: {
                    column: {
                        stacking: undefined
                    }
                },
                yAxis: {
                    title: {
                        text: ""
                    }
                },
                xAxis: {
                    offset: 5
                }
            }) as Highcharts.Options;
        
        case "columnStack":
            return merge(
                DefaultChartOptions as unknown,
                {
                    yAxis: {
                        title: {
                            text: "Count"
                        }
                    }
                },
                customOptions,
                {
                    chart: {
                        type: "column",
                        options3d: {
                            enabled: false
                        }
                    },
                    plotOptions: {
                        column: {
                            stacking: "normal",
                            crisp: false
                        }
                    },
                    xAxis: {
                        offset: 0
                    }
                }
            ) as Highcharts.Options;

        case "columnStack3d":
            return merge(DefaultChartOptions as unknown, customOptions, {
                chart: {
                    type: "column",
                    options3d: {
                        enabled: true,
                        alpha: 10,
                        beta: 15,
                        depth: 80,
                        fitToPlot: true,
                        viewDistance: 60,
                        axisLabelPosition: null
                    }
                },
                plotOptions: {
                    column: {
                        stacking: "normal"
                    }
                },
                yAxis: {
                    title: {
                        text: ""
                    }
                },
                xAxis: {
                    offset: 5
                }
            }) as Highcharts.Options;

        case "bar":
            return merge(DefaultChartOptions as unknown, customOptions, {
                chart: {
                    type: "bar",
                    options3d: {
                        enabled: false
                    }
                },
                plotOptions: {
                    bar: {
                        stacking: undefined
                    }
                },
                xAxis: {
                    offset: 0
                }
            }) as Highcharts.Options;

        case "bar3d":
            return merge(DefaultChartOptions as unknown, {
                chart: {
                    options3d: {
                        alpha: 10,
                        beta: 15,
                        depth: 80,
                        fitToPlot: true,
                        viewDistance: 100,
                        axisLabelPosition: null
                    }
                },
                xAxis: {
                    offset: 5
                },
                yAxis: {
                    title: {
                        text: ""
                    }
                }
            }, customOptions, {
                chart: {
                    type: "bar",
                    options3d: {
                        enabled: true
                    }
                },
                plotOptions: {
                    bar: {
                        stacking: undefined
                    }
                }
            }) as Highcharts.Options;

        case "barStack":
            return merge(DefaultChartOptions as unknown, customOptions, {
                chart: {
                    type: "bar",
                    options3d: {
                        enabled: false
                    }
                },
                plotOptions: {
                    bar: {
                        stacking: "normal"
                    }
                },
                yAxis: {
                    title: {
                        text: "Count"
                    }
                },
                xAxis: {
                    offset: 0
                }
            }) as Highcharts.Options;

        case "barStack3d":
            return merge(DefaultChartOptions as unknown, customOptions, {
                chart: {
                    // type: "bar",
                    options3d: {
                        enabled: true,
                        alpha: 10,
                        beta: 15,
                        depth: 80,
                        fitToPlot: true,
                        viewDistance: 100,
                        axisLabelPosition: null
                    }
                },
                plotOptions: {
                    bar: {
                        stacking: "normal"
                    }
                },
                yAxis: {
                    title: {
                        text: ""
                    }
                },
                xAxis: {
                    offset: 5
                }
            }) as Highcharts.Options;
            
        case "spline":
            return merge(DefaultChartOptions as unknown, customOptions, {
                chart: {
                    type: "spline",
                    options3d: {
                        enabled: false
                    }
                },
                xAxis: {
                    offset: 0
                }
            }) as Highcharts.Options;

        case "areaspline":
            return merge(DefaultChartOptions as unknown, customOptions, {
                chart: {
                    type: "areaspline",
                    options3d: {
                        enabled: false
                    }
                },
                xAxis: {
                    offset: 0
                }
            }) as Highcharts.Options;
    }
}
