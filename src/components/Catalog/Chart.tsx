import { useLayoutEffect, useRef } from "react";
import Highcharts                  from "../../highcharts";
import MAPPING from "./DataMapping";
import { highlight } from "../../utils";


const FONT_SIZE = 15


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

export default function CatalogChart({ data, search }: { data: Record<string, any>[], search?: string })
{
    const { id, pid, count, label, description } = MAPPING;

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
            dataLabels: {
                // enabled: true,
            //     align  : "end",
            //     inside : false,
                // style: {
            //         textDecoration: "none",
                    // fontWeight: "600",
            //         fontSize: FONT_SIZE,
            //         textOutline: "1px #FFF9"
                // }
            },
            custom: {
                data: {
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
                fontSize  : FONT_SIZE + "px",
                fontFamily: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
                color     : "#222"
            },
            backgroundColor: "#FFF",
            spacingTop   : 20,
            spacingBottom: 20,
            spacingLeft  : 20,
            spacingRight : 20,
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
                    fontSize: FONT_SIZE * 0.9 + "px",
                    textDecoration: "none",
                    // fontWeight: "800",
                    // color: "#666"
                }
            },
            lineWidth: 1,
            // startOnTick: false,
            // endOnTick: false,
            zIndex: 10,
            offset: 2
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
                    fontSize: FONT_SIZE * 0.9 + "px"
                }
            },
            gridLineColor: "#0002",
            gridLineDashStyle: "ShortDash",
            title: {
                text: "",
            //     style: {
            //         fontWeight: "700",
            //         fontSize: FONT_SIZE * 1.1 + "px"
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
                borderRadius: 4,
                stacking: "overlap",
                // crisp: true,
                // borderWidth: 2,
                // clip: false,
                // opacity: 0.8,
                groupPadding: 0.1,
                pointPadding: 0.0,
                maxPointWidth: 60,
                minPointLength: 8
            }
        },
        tooltip: {
            headerFormat: "",
            style: {
                fontSize: FONT_SIZE + "px",
                whiteSpace: "normal"
            },
            backgroundColor: "#FCFCFC",
            useHTML: true,
            formatter() {
                // @ts-ignore
                let out = `<b style="color:${this.point.color}">◉</b> <b>${this.point.custom?.name || this.point.name}</b><br/>` +
                    `<span style="color:#888">Count: </span><b class="badge" style="background-color:${this.point.color}">${Number(this.point.y).toLocaleString()}</b><hr style="margin: 8px 0" />`

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
                // style: {
                //     padding: "0 10px"
                // },
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
