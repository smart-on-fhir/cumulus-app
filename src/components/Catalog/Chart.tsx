import MAPPING       from "./DataMapping"
import Chart         from "../generic/Chart"
import { highlight } from "../../utils"
import Highcharts    from "../../highcharts"



export default function CatalogChart({ data, search, navigate }: { data: Record<string, any>[], search?: string, navigate?: (...args: any[]) => void })
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
            events: {
                click() {
                    if (!this.drilldown) {
                        navigate(this.custom.data.row)
                    }
                }
            },
            custom: {
                data: {
                    stratifier: stratifier? row[stratifier] : "",
                    // Label: row[label],
                    Count: row[count],
                    Description: row[description],
                    row
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
                animation: false,
                dataSorting: {
                    enabled: true
                }
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
                cursor: "pointer"
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

    return <Chart options={options} containerProps={{ id: "catalog-chart" }} />
}
