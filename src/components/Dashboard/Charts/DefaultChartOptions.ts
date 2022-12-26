import { merge } from "highcharts";
import { generateColors } from "../../../utils";
import { SupportedChartTypes } from "../config";

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
        spacingBottom: 25,
        animation: {
            duration: 400,
            defer: 0,
        },
        options3d: {
            enabled: false
        },
        plotBorderColor: "#999",
        plotBorderWidth: 0
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
        style: {
            fontWeight: "bold",
            fontSize: "20px"
        },
    },
    legend: {
        enabled: true,
        // margin: 0,
        // padding: 0,
    },
    colors: generateColors(16),
    yAxis: {
        title: {
            text: "",
            skew3d: true,
            margin: 15,
            style: {
                fontWeight: "bold",
                fontSize: "16px"
            }
        },
        allowDecimals: true,
        max: null,
        // maxPadding: 0,
        // minPadding: 0,
        endOnTick: false,
        gridLineWidth: 1,
        gridLineColor: "#DDD", // "rgba(0, 0, 0, 0.1)",
        tickColor: "#DDD",
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
            format: "{text}",
            style: {
                fontSize: "13px"
            }
        },
        lineWidth: 0,
        lineColor: "#999",
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
            borderWidth     : 0.25,
            allowPointSelect: true,
            cursor          : 'pointer',
            showInLegend    : true,
            shadow          : false,
            animation: {
                duration: 0,//400,
                defer: 0,
            }
        },
        pie: {
            startAngle      : 0,
            innerSize       : 0,
            depth           : 50,
            slicedOffset    : 10,
            // center          : ["50%", "50%"],
            // size            : "75%",
            
            borderColor: "rgba(1, 1, 1, 0.5)",
            borderWidth: 0.5,
            edgeColor: "rgba(0, 0, 0, 0.25)",
            edgeWidth: 1,
            dataLabels: {
                enabled: true,

            }
        },
        column: {
            edgeColor: "rgba(0, 0, 0, 0.25)",
            edgeWidth: 0.5,
            getExtremesFromAll: true,
            borderColor: "rgba(1, 1, 1, 0.5)",
            borderWidth: 0.25,
            borderRadius: 0.5,
            pointPadding: 0.02,
            groupPadding: 0.2,
            crisp: false,
            stacking: undefined,
            states: {
                select: {
                    borderWidth: 1,
                    color: "#999"
                }
            }
        },
        bar: {
            edgeColor: "rgba(0, 0, 0, 0.1)",
            getExtremesFromAll: true,
            borderColor: "rgba(0, 0, 0, 0.5)",
            borderWidth: 0.25,
            borderRadius: 0.5,
            pointPadding: 0.02,
            groupPadding: 0.2,
            stacking: undefined,
            crisp: false,
            states: {
                select: {
                    borderWidth: 1,
                    color: "#999"
                }
            },
        },
        areaspline: {
            allowPointSelect: false,
            marker: {
                radius: 0,
                enabled: true,
                states: {
                    hover: {
                        radius: 4
                    }
                }
            },
            lineWidth: 1.5,
            states: {
                hover: {
                    lineWidth: 2,
                    shadow: true, // show them even on datetime charts
                }
            },
            cursor: "default",
            connectNulls: false,
            getExtremesFromAll: true,
            dashStyle: "Solid",
        },
    //     area: {
    //         // fillOpacity: 0.2,
    //         allowPointSelect: false,
    //         cursor: "default",
    //         marker: {
    //             radius: 0,
    //             enabled: true,
    //             states: {
    //                 hover: {
    //                     radius: 4
    //                 }
    //             }
    //         },
    //         lineWidth: 1.5,
    //         shadow: false,
    //         states: {
    //             hover: {
    //                 lineWidth: 2,
    //                 shadow: true, // show them even on datetime charts
    //             }
    //         },
    //         connectNulls: false,
    //         getExtremesFromAll: true,
    //         dashStyle: "Solid",
    //     },
        spline: {
            allowPointSelect: false,
            cursor: "default",
            marker: {
            //     radius: 2,
                enabled: false,
            //     states: {
            //         hover: {
            //             radius: 4
            //         }
            //     }
            },
            lineWidth: 1.5,
            states: {
                hover: {
                    lineWidth: 2,
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
        tickWidth: 1,
        // minRange: 1,
        // maxRange: 2,
        offset: 0,
        startOnTick: false,
        endOnTick: false,
        minPadding: 0,
        maxPadding: 0,
        lineWidth: 1,
        lineColor: "#999",
        gridLineColor: "#DDD",
        gridLineWidth: 0,
        tickColor: "#DDD",
        gridZIndex: 0,
        
        // maxPadding: 0,
        labels: {
            enabled: true,
            // align: "center"
            autoRotationLimit: 80,
            overflow: "justify",
            padding: 2,
            style: {
                fontSize: "13px"
            }
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
                fontWeight: "bold",
                fontSize: "16px"
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
