import { useLayoutEffect, useRef } from "react"
import Highcharts                  from "../../highcharts"
import { highlight }               from "../../utils"
import MAPPING                     from "./DataMapping"


function Chart({ options }: { options: Highcharts.Options })
{
    const containerRef = useRef<HTMLDivElement|null>(null);
    const chartRef     = useRef<Highcharts.Chart|null>(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
            try {
                if (chartRef.current) {
                    chartRef.current.update(options, true, true, false)
                } else {
                    chartRef.current = Highcharts.chart(containerRef.current, options);
                }
            } catch (ex) {
                console.error(ex)
                document.getElementById("flat-chart")!.innerHTML = '<div><br/><p><b class="color-red">Error rendering chart. See console for details.</b></p><pre>'
                    + (ex as Error).message + 
                '</pre></div>'
            }
        }
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [options])

    return <div id="catalog-chart" className="chart" ref={ containerRef } />
}

export function CatalogTreeMapChart({ data, search }: { data: Record<string, any>[], search?: string })
{
    if (!data.length) {
        return search ? 
            <div className="color-brand-2 p-1">No results found matching your search</div> :
            <div className="color-brand-2 p-1">No data found</div>
    }

    const {
        // id,
        // pid,
        count,
        // label,
        description,
        stratifier = ""
    } = MAPPING;

    // const groups: Record<string, any> = {}

    const seriesData = []
    let min =  Infinity
    let max = -Infinity
    
    data.forEach(row => {
        seriesData.push({
            id    : row.id + "",
            name  : row.display,
            parent: row.pid ? row.pid + "" : undefined,
            value : row.cnt,
            custom: {
                data: {
                    stratifier: stratifier? row[stratifier] : "",
                    // Label: row[label],
                    Count: row[count],
                    Description: row[description]
                }
            }
        })

        if (row.pid) {
            if (row.cnt > max) max = row.cnt
            if (row.cnt < min) min = row.cnt
        }
    })

    console.log(min, max)

    // for (const row of data) {
    //     let group = groups[row[pid]]
    //     if (!group) {
    //         group = groups[row[pid]] = {
    //             name: row[pid],
    //             id  : row[pid],
    //             type: "column",
    //             colorKey: "y",
    //             data: []
    //         }
    //     }

    //     group.data.push({
    //         y        : +row[count],
    //         name     : row[label],
    //         drilldown: data.some((r: any) => r[pid] === row[id]) ? row[id] : undefined,
    //         custom: {
    //             data: {
    //                 stratifier: stratifier? row[stratifier] : "",
    //                 // Label: row[label],
    //                 Count: row[count],
    //                 Description: row[description]
    //             }
    //         }
    //     })
    // }

    const options: Highcharts.Options = {
        chart: {
            style: {
                fontSize  : "15px",
                fontFamily: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
                color     : "#222"
            },
            backgroundColor: "#FFF",
            spacingTop   : 20,
            spacingBottom: 20,
            spacingLeft  : 20,
            spacingRight : 20,
            animation: false,
            // panning: {
            //     enabled: true,
            //     type: "x"
            // },
            // zooming: {
            //     type: "x"
            // }
            // width: 600,
            // height: 510,
            // height: null,
            // width: null,
        },
        colorAxis: {
            min: min,
            max: max,
            maxColor: "#FA8",
            minColor: "#9CF"
            // ["#036", "#369", ""]
        },
        title: {
            text: ""
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        tooltip: {
        //     headerFormat: "",
            style: {
                fontSize: "1em",
                whiteSpace: "normal"
            },

        //     backgroundColor: "#FCFCFC",
            useHTML: true,
            // distance: 32,
            borderColor: "#000",
            backgroundColor: "#FFFE",
            formatter() {
                // @ts-ignore
                let out = `<b class="color-orange">◉</b> <b>${this.point.name}</b> <b class="badge bg-orange">${
                    // @ts-ignore    
                    Number(this.point.custom.data.Count).toLocaleString()}</b><hr style="margin: 8px 0" />`

                return out + `<div style="min-width:200px;white-space:normal">${
                    // @ts-ignore
                    search ? highlight(this.point.custom.data.Description, search, true).join("") : this.point.custom.data.Description
                }</div>`
            }
        },

        navigation: {
            // activeAxisLabelStyle: {
            //     textDecoration: "none",
            //     fontWeight: "600"
            // },
            breadcrumbs: {
                relativeTo: "spacingBox",
                buttonSpacing: 5,
                buttonTheme: {
                    fill: "#EEE",
                    style: {
                        padding: "2px"
                    }
                },
                position: {
                    align: "left",
                    verticalAlign: "top",
                    x: 14,
                    y: 16
                }
            },
            // series: Object.keys(groups).filter(key => key !== "null").map(key => groups[key])
        },

        // colors: ["#8BE","#9CF","#ADF","#BEF","#CEF","#DEF","#EEF"],
        series: [{
            type: 'treemap',
            name: 'Root',
            allowTraversingTree: true,
            interactByLeaf: false,
            levelIsConstant: false,
            // color: "#2467b411",
            // allowDrillToNode: true,
            alternateStartingDirection: true,
            // nodeSizeBy: 'leaf',
            turboThreshold: 10000,
            layoutAlgorithm: 'squarified',
            // boostBlending: "add",
            // boostThreshold: 1000,
            colorByPoint: true,
            borderColor: "#0002",
            // borderWidth: 1,
            // borderRadius: 3,
            colorAxis: 0,
            colorKey: "value",
            clip: false,
            // headers: true,
            animation: false,
            dataLabels: {
                inside: true,
                // defer: true,
                crop: true,
                overflow: "allow",
                enabled: false,
                // useHTML: true,
                // formatter() {
                //     return `<div style="background:#FFF6;padding:0.5ch 1ch;border-radius:1ch;text-shadow:0 0.5px 1px #FFF;box-shadow:0 0 0 1px #000C"><b>${this.point.name}</b><br/>${Number(this.point.value).toLocaleString()}</div>`
                // },
                style: {
                    fontWeight: '600',
                    color: "#000C",
                    textOutline: "1px solid #FFF8",
                    fontSize: "1em",
                    textAlign: "center",
                    zIndex: 0
                    // backgroundColor: "#FFF8"
                }
            },
            
            levels: [
                {
                    level      : 1,
                    // borderWidth: 1,
                    borderColor: "#000",
                    dataLabels: {
                        // headers: true,
                        enabled: true,
                        // inside: false,
                        // style: {
                            // fontSize: '1em',
                            // fontWeight: 'bold',
                            // textTransform: 'uppercase'
                        // }
                    },
                }
                // , {
                //     level      : 2,
                //     // borderWidth: 4,
                //     // borderColor: "#FFF",
                // }
                // , {
                //     level      : 3,
                //     // borderWidth: 3,
                //     // borderColor: "#FFF",
                // }
                // , {
                //     level      : 4,
                //     // borderWidth: 2,
                //     // borderColor: "#FFF",
                // }
                // , {
                //     level      : 5,
                //     // borderWidth: 1,
                //     // borderColor: "#FFF",
                // }
            ],
            data: seriesData
        }]
    }

    return <Chart options={options} />
}

export default function CatalogChart({ data, search }: { data: Record<string, any>[], search?: string })
{
    if (!data.length) {
        return search ? 
            <div className="color-brand-2 p-1">No results found matching your search</div> :
            <div className="color-brand-2 p-1">No data found</div>
    }

    const { id, pid, count, label, description, stratifier = "" } = MAPPING;

    const groups: Record<string, any> = {}

    for (const row of data) {
        let group = groups[row[pid]]
        if (!group) {
            group = groups[row[pid]] = {
                name: row[pid],
                id  : row[pid],
                type: "column",
                colorKey: "y",
                data: []
            }
        }

        group.data.push({
            y        : +row[count],
            name     : row[label],
            drilldown: data.some((r: any) => r[pid] === row[id]) ? row[id] : undefined,
            custom: {
                data: {
                    stratifier: stratifier? row[stratifier] : "",
                    // Label: row[label],
                    Count: row[count],
                    Description: row[description]
                }
            }
        })
    }

    const options: Highcharts.Options = {
        chart: {
            style: {
                fontSize  : "15px",
                fontFamily: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
                color     : "#222"
            },
            backgroundColor: "#FFF",
            spacingTop   : 20,
            spacingBottom: 20,
            spacingLeft  : 20,
            spacingRight : 20,
            panning: {
                enabled: true,
                type: "x"
            },
            zooming: {
                type: "x"
            }
            // width: 600,
            // height: 510,
            // height: null,
            // width: null,
        },
        colorAxis: {
            // min: 0,
            // max: 140000,
            maxColor: "#369",
            minColor: "#69C"
            // ["#036", "#369", ""]
        },
        title: {
            text: ""
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        xAxis: {
            type: "category",
            labels: {

                style: {
                    fontSize: "14px",
                    textDecoration: "none",
                    // fontWeight: "800",
                    // color: "#666"
                },
                autoRotation: [0, -45, -90]
            },
            lineWidth: 1,
            startOnTick: false,
            endOnTick: false,
            zIndex: 10,
            offset: 2,
        },
        yAxis: {
            lineWidth: 0,
            endOnTick: false,
            startOnTick: false,
            // tickWidth: 1,
            // tickLength: 6,
            // offset: 2,
            labels: {
                overflow: "allow",
                style: {
                    fontSize: "14px"
                }
            },
            gridLineColor: "#0002",
            gridLineDashStyle: "ShortDash",
            title: {
                text: "",
            //     style: {
            //         fontWeight: "700",
            //         fontSize: "16px"
            //     }
            },
            gridZIndex: 8,
            min: 0.001
        },
        plotOptions: {
            series: {
                animation: false
            },
            column: {
                // color: "#4a90e2",
                // minPointLength: isPctChart ? 6 : 0,
                borderRadius: 3,
                stacking: "overlap",
                crisp: false,
                // borderWidth: 2,
                // clip: false,
                // opacity: 0.8,
                groupPadding: 0.1,
                pointPadding: 0,
                maxPointWidth: 160,
                minPointLength: 8,
            }
        },
        tooltip: {
            headerFormat: "",
            style: {
                fontSize: "15px",
                whiteSpace: "normal"
            },
            backgroundColor: "#FCFCFC",
            useHTML: true,
            formatter() {
                // @ts-ignore
                let out = `<b style="color:${this.point.color}">◉</b> <b>${this.point.custom?.name || this.point.name}</b> <b class="badge" style="background-color:${this.point.color}">${
                        Number(this.point.y).toLocaleString()}</b><hr style="margin: 8px 0" />`

                return out + `<div style="min-width:200px;white-space:normal">${
                    // @ts-ignore
                    search ? highlight(this.point.custom.data.Description, search, true).join("") : this.point.custom.data.Description
                }</div>`
            }
        },
        drilldown: {
            activeAxisLabelStyle: {
                textDecoration: "none",
                fontWeight: "600"
            },
            breadcrumbs: {
                relativeTo: "spacingBox",
                buttonSpacing: 5,
                position: {
                    align: "left",
                    verticalAlign: "top",
                    x: 10,
                    y: 18
                }
            },
            series: Object.keys(groups).filter(key => key !== "null").map(key => groups[key])
        },
        series: [groups["null"]]
    }

    return <Chart options={options} />
}
