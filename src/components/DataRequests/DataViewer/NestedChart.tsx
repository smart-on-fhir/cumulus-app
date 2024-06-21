import Chart            from "./Chart"
import { CUMULUS_ALL }  from "./lib"
import { COLOR_THEMES } from "../../Dashboard/config"


export default function NestedChart({ data, height }: { data: Record<string, any>[], height: number | string }) {
    return <Chart options={{
        chart: {
            style: {
                fontSize  : "16px",
                fontFamily: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
                color     : "#222"
            },
            backgroundColor: "transparent",
            height,
            spacingTop: 10,
            spacingBottom: 10
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
        colors: COLOR_THEMES.find(t => t.id === "smart2")?.colors,
        xAxis: {
            type: "category",
            labels: {
                style: {
                    fontSize: "13px"
                }
            },
            lineWidth: 0
        },
        yAxis: {
            endOnTick: false,
            labels: {
                style: {
                    fontSize: "13px"
                }
            },
            gridLineColor: "#0002",
            gridLineDashStyle: "ShortDash",
            title: {
                text: "Average",
                style: {
                    fontWeight: "700"
                }
            }
        },
        plotOptions: {
            column: {
                borderRadius: 3,
                colorByPoint: true,
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
            type: "column",
            name: "All",
            data: data.filter(row => row.category === CUMULUS_ALL && row.id === CUMULUS_ALL).map(row => ({
                y: parseFloat(row.average),
                name: "Resources",
                drilldown: "level-1",
                custom: {
                    max: parseFloat(row.max)
                }
            }))
        }],
        drilldown: {
            series: buildDrilldownSeries(data) as any
        },
        tooltip: {
            headerFormat: "",
            pointFormat: '<b>{point.name}</b><br/>Average: {point.y:.2f}<br/>Max: {point.custom.max:,.0f}',
            style: {
                fontSize: "14px",
            },
            outside: true,
            backgroundColor: "#EEE"
        }
    }} />
}

function buildDrilldownSeries(data: Record<string, any>[]) {

    const groups: Record<string, typeof data> = {}
    data.forEach(row => {
        if(!groups[row.id]) {
            groups[row.id] = []
        }
        groups[row.id].push(row)
    })

    const series = []

    for (const id in groups) {
        series.push({
            type: "column",
            id,
            name: id,
            tooltip: {
                pointFormat: '<b>{series.name} > {point.name}</b><br/>Average: {point.y:.2f}<br/>Max: {point.custom.max:,.0f}',
            },
            data: groups[id].filter(r => r.category !== CUMULUS_ALL).map(r => (
                {
                    y   : parseFloat(r.average),
                    name: r.category,
                    showInLegend: true,
                    custom: {
                        max: parseFloat(r.max)
                    }
                }
            ))
        } as any)
    }

    series.push({
        type: "column",
        id  : "level-1",
        name: "Resources",
        data: data.filter(r => r.id !== CUMULUS_ALL && r.category === CUMULUS_ALL).map(r => ({
            y   : parseFloat(r.average),
            name: r.id,
            drilldown: (() => {
                const sub = groups[r.id]
                if (!sub || !sub.length) return;
                const rows = sub.filter(r => r.category !== CUMULUS_ALL)
                if (!rows.length) return;
                return r.id
            })(),
            showInLegend: true,
            custom: {
                max: parseFloat(r.max)
            }
        }))
    })

    return series
}
