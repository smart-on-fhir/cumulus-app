import React     from "react"
import { app }   from "../../../types"
import Highcharts from "../../../highcharts"


interface ChartProps {
    transmissions?: app.Transmission[]
    sites?: app.DataSite[]
}


export default class Chart extends React.Component<ChartProps>
{
    buildChartOptions(): Highcharts.Options
    {
        const { transmissions = [], sites = [] } = this.props

        const series: {
            site      : app.DataSite,
            dataStart : number,
            dataEnd   : number,
            lastUpdate: number,
            failed   ?: boolean,
            comment  ?: string
        }[] = [];

        transmissions.forEach(t => {
            const site = sites.find(s => s.id === t.siteId);
            
            if (site) {
                let entry = series.find(x => x.site.id === t.siteId);

                if (entry) {
                    
                    // Use the earliest dataStart date
                    if (t.dataStart) {
                        entry.dataStart = Math.min(+entry.dataStart || 0, +t.dataStart)
                    }

                    // Use the lates dataEnd date
                    if (t.dataEnd) {
                        entry.dataEnd = Math.max(+entry.dataEnd || 0, +t.dataEnd)
                    }
                    
                    // Use the lates date as lastUpdate date
                    if (t.date) {
                        entry.lastUpdate = entry.lastUpdate ? 
                            Math.max(entry.lastUpdate, new Date(t.date).valueOf()) :
                            +t.date
                    }

                    // Set to failed if the latest transmission failed
                    if (t.date && new Date(t.date).valueOf() === entry.lastUpdate) {
                        entry.failed = !!t.failed
                    }

                    // Accumulate all comments
                    if (t.comment) {
                        entry.comment += t.comment + "\n";
                    }
                }
                else {
                    series.push({
                        site,
                        dataStart : t.dataStart ? new Date(t.dataStart).valueOf() : NaN,
                        dataEnd   : t.dataEnd   ? new Date(t.dataEnd).valueOf() : NaN,
                        lastUpdate: t.date      ? new Date(t.date).valueOf() : NaN,
                        failed    : !!t.failed,
                        comment   : t.comment || ""
                    })
                }
            }
        })

        const overlapStart = series.reduce((prev, cur) => cur.dataStart  ? Math.max(prev, cur.dataStart ) : prev, -Infinity);
        const overlapEnd   = series.reduce((prev, cur) => cur.dataEnd    ? Math.min(prev, cur.dataEnd   ) : prev,  Infinity);
        const lastUpdate   = series.reduce((prev, cur) => cur.lastUpdate ? Math.max(prev, cur.lastUpdate) : prev, -Infinity);
        
        return {
            chart: {
                inverted: true,
                height: Math.max(series.length * 80 + 20, 150),
                backgroundColor: "transparent",
                plotBackgroundColor: "#FFF",
                plotShadow: true,
                spacingTop: 20,
                spacingRight: 3
            },
            credits: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            title: {
                text: ""
            },
            xAxis: {
                categories: series.map(s => s.site.name),
                lineWidth: 0,
                labels: {
                    padding: 0,
                    align: "right",
                    style: {
                        fontSize: "13px",
                        fontWeight: "bold",
                        width: 120,
                        lineHeight: "15px"
                    }
                },
                plotBands: series.map((s, i) => {
                    return (!s.dataStart || !s.dataEnd || !s.lastUpdate) ?
                    {
                        from : i - 0.5,
                        to   : i + 0.5,
                        color: "#8882",
                        borderWidth: 0.5,
                        borderColor: "#ccc",
                        label: {
                            text   : "<i>Data not available yet</i>",
                            y      : 3,
                            x      : 15,
                            useHTML: true,
                            align  : "center",
                            style: {
                                color: "#0007",
                                fontSize: "13px"
                            }
                        }
                    } : null
                }).filter(Boolean) as any
            },  
            yAxis: {
                type          : "datetime",
                offset        : 0,
                startOnTick   : false,
                endOnTick     : false,
                panningEnabled: true,
                minPadding    : 0.02,
                maxPadding    : 0.2,
                lineWidth     : 0,
                lineColor     : "#999",
                gridLineColor : "#EEE",
                gridLineWidth : 1,
                gridZIndex    : 0,
                max           : Date.now() + 1000*60*60*24*100,
                title: {
                    text: ""
                },
                plotBands: (overlapStart && overlapEnd) ? [{
                    from : overlapStart,
                    to   : overlapEnd,
                    color: "#BE96",
                }] : undefined,
                plotLines: [

                    // LAST UPDATE
                    {
                        value: lastUpdate,
                        color: "#E00",
                        width: 2,
                        label: {
                            text : "LAST UPDATE",
                            style: {
                                fontSize  : "11px",
                                color     : "#777",
                                fontWeight: "bold"
                            }
                        }
                    },

                    // RANGE START
                    {
                        value    : overlapStart,
                        color    : "#069A",
                        width    : 1,
                        dashStyle: "Dash",
                        label: {
                            text     : new Date(overlapStart).toLocaleDateString(),
                            rotation : 0,
                            y        : -8,
                            textAlign: "center",
                            style: {
                                color     : "#069C",
                                fontWeight: "bold"
                            }
                        }
                    },

                    // RANGE END
                    {
                        value    : overlapEnd,
                        color    : "#069A",
                        width    : 1,
                        dashStyle: "Dash",
                        label: {
                            text     : new Date(overlapEnd).toLocaleDateString(),
                            rotation : 0,
                            y        : -8,
                            textAlign: "center",
                            style: {
                                color: "#069C",
                                fontWeight: "bold"
                            }
                        }
                    }
                ]
            },
            tooltip: {
                useHTML        : true,
                headerFormat   : "",
                borderColor    : "#0006",
                backgroundColor: "#FFFE",
                outside        : true,
                followPointer  : true,
                hideDelay      : 60,
                pointFormatter() {
                    return String(
                        `<b style="font-size: 15px" class="color-blue-dark">${this.category}</b><hr/>` +
                        `<table>` +
                        `<tr>` +
                            `<th style="text-align: right">Data from:</th>` +
                            `<td>${new Date(this.options.low!).toLocaleString()}</td>` +
                        `</tr>` +
                        `<tr>` +
                            `<th style="text-align: right">Data to:</th>` +
                            `<td>${new Date(this.options.high!).toLocaleString()}</td>` +
                        `</tr>` +
                        (this.options.custom!.lastUpdate ? `<tr>` +
                            `<th style="text-align: right">Last Update:</th>` +
                            `<td>${new Date(this.options.custom!.lastUpdate).toLocaleString()}</td>` +
                        `</tr>` : "") +
                        (this.options.custom!.failed ? `<tr>` +
                            `<th class="color-red center" colspan="2"><hr/><h6>Latest data fetch failed!</h6></th>` +
                        `</tr>` : "") +
                        (this.options.custom!.comment ? `<tr>` +
                            `<td class="color-blue-dark center" colspan="2"><hr/><p>${
                                this.options.custom!.comment.split(/\n/).join("</p><p>")
                            }</p></td>` +
                        `</tr>` : "") +
                        `</table>`
                    )
                },
                style: {
                    fontSize: "13px",
                    fontFamily: "sans-serif"
                }
            },
            series: [
                {
                    name: "Data Range",
                    type: "columnrange",
                    data: series.map(s => ({
                        low: s.dataStart,
                        high: s.dataEnd,
                        color: s.failed ? "rgba(255,170,0,0.7)" : "rgba(100,170,250,0.7)",
                        borderColor: s.failed ? "rgb(220,0,0)" : "rgba(1, 1, 1, 0.5)",
                        custom: {
                            lastUpdate: s.lastUpdate,
                            failed: !!s.failed,
                            comment: s.comment
                        }
                    })),
                    edgeWidth   : 0.5,
                    borderWidth : 0.5,
                    borderRadius: 3,
                    pointPadding: 0.1,
                    groupPadding: 0.05,
                    showInLegend: false
                }
            ]
        }
    }

    shouldComponentUpdate() {
        return false
    }

    componentDidMount() {
        const options = this.buildChartOptions()
        console.log(this.props.transmissions, options)
        Highcharts.chart("transmission-chart", options);
    }

    render() {
        return (
            <div>
                <div id="transmission-chart" />
            </div>
        )
    }
}
