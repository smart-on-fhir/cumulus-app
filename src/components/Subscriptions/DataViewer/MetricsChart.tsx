import Highcharts                               from "highcharts"
import Chart                                    from "./Chart"
import { CUMULUS_ALL, CUMULUS_NONE }            from "./lib"
import { humanizeColumnName, pluralize, roundToPrecision } from "../../../utils"

const COLOR_NEGATIVE  = "#E60"
const COLOR_POSITIVE  = "#6A0"
const COLOR_NEUTRAL   = "#4a90e2"
const ROUND_PRECISION = 2
const FONT_SIZE       = 15


export default function MetricsChart({
    data,
    height,
    groupBy,
    stratifyBy,
    valueColumn
}: {
    data: Record<string, any>[]
    height: number | string
    groupBy: string
    stratifyBy: string
    valueColumn: string
}) {

    for (const row of data) {
        if ("average" in row) row.average = +row.average
        if ("max"     in row) row.max     = +row.max
        if ("std_dev" in row) row.std_dev = +row.std_dev
        if ("median"  in row) row.median  = +row.median
    }

    const groups = groupData(data, groupBy)

    const isPctChart = valueColumn === "numerator" || valueColumn === "percentage"

    const Level1: any = {
        name: "All",
        type: "bar",
        id  : "level-1",
        color: COLOR_NEUTRAL + "88",
        data: data.filter(r => r[stratifyBy] === CUMULUS_ALL && r[groupBy] === CUMULUS_ALL).map(r => ({
            y        : r[valueColumn],
            name     : "All " + pluralize(humanizeColumnName(groupBy)),
            dataLabels: {
                enabled: true,
                align: "end",
                inside : false,
                style: {
                    textDecoration: "none",
                    fontWeight: "400",
                    fontSize: FONT_SIZE,
                    textOutline: "1px #FFF9"
                }
            },
            custom: {
                data: {
                    Average: r.average,
                    Median: r.median,
                    Max: r.max,
                    "Standard Deviation": r.std_dev
                }
            }
        }))
    }

    const Level2: any = {
        type: "bar",
        id  : "level-2",
        name: "All Resources",
        data: []
    }

    if (isPctChart) {
        data.filter(r => r[groupBy] !== CUMULUS_ALL && r[stratifyBy] === CUMULUS_ALL).forEach(r => {
            const pctY   = (r.denominator - r.numerator) / r.denominator * 100
            const pctN   = r.numerator / r.denominator * 100
            const drilldown = (() => {
                const sub = groups[r[groupBy]]
                if (!sub || !sub.length) return;
                const rows = sub.filter(r => r[stratifyBy] !== CUMULUS_ALL).reduce((prev, cur) => prev + cur[valueColumn], 0)
                if (!rows) return;
                return r[groupBy]
            })();
            Level2.data.push({
                y    : pctY || null,
                name : r[groupBy],
                stack: r[groupBy],
                color: COLOR_POSITIVE,
                drilldown,
                custom: {
                    name: r[groupBy] + " - valid",
                    data: {
                        Total: r.denominator,
                        Valid: `${Number(r.denominator - r.numerator).toLocaleString()} (${round(pctY)})`,
                    }
                }
            }, {
                y    : pctN || null,
                name : r[groupBy],
                stack: r[groupBy],
                color: COLOR_NEGATIVE,
                drilldown,
                custom:  {
                    name: r[groupBy] + " - invalid",
                    data: {
                        Total  : r.denominator,
                        Invalid: `${r.numerator.toLocaleString()} (${round(pctN)})`
                    }
                }
            })
        })
    } else {
        data.filter(r => r[groupBy] !== CUMULUS_ALL && r[stratifyBy] === CUMULUS_ALL).forEach(r => {
            Level2.data.push({
                y   : r[valueColumn],
                name: r[groupBy],
                drilldown: (() => {
                    const sub = groups[r[groupBy]]
                    if (!sub || !sub.length) return;
                    const rows = sub.filter(r => r[stratifyBy] !== CUMULUS_ALL).reduce((prev, cur) => prev + cur[valueColumn], 0)
                    if (!rows) return;
                    return r[groupBy]
                })(),
                opacity: r[valueColumn] ? 1 : 0,
                dataLabels: {
                    enabled: true,
                    inside : false,
                    align  : "end",
                    style: {
                        textDecoration: "none",
                        fontWeight    : "400",
                        fontSize      : FONT_SIZE,
                        textOutline   : "1px #FFFC"
                    }
                },
                custom: {
                    data: {
                        Average: r.average,
                        Median: r.median,
                        Max: r.max,
                        "Standard Deviation": r.std_dev
                    }
                }
            })
        })
    }

    const Level3: any[] = Object.keys(groups).map(groupName => {
        const series = {
            type: "bar",
            id  : groupName,
            name: groupName,
            showInLegend: false,
            data: [] as any[]
        }

        if (isPctChart) {

            const children = groups[groupName].filter(r => r[stratifyBy] !== CUMULUS_ALL && r.numerator !== undefined)

            children.forEach(r => {
                const pctY = (r.denominator - r.numerator) / r.denominator * 100
                const pctN = r.numerator / r.denominator * 100
                let name = r[stratifyBy] === CUMULUS_NONE ? `No known ${stratifyBy}` : r[stratifyBy];
                if (name === null) {
                    name = groupName
                }
                series.data.push(
                    {
                        name,
                        color : COLOR_POSITIVE,
                        y     : pctY || null,
                        custom: {
                            name: name + " - valid",
                            data : {
                                Total: r.denominator,
                                Valid: `${Number(r.denominator - r.numerator).toLocaleString()} (${round(pctY)})`
                            }
                        }
                    },
                    {
                        name,
                        color : COLOR_NEGATIVE,
                        y     : pctN || null,
                        custom: {
                            name: name + " - invalid",
                            data : {
                                Total  : r.denominator,
                                Invalid: `${r.numerator.toLocaleString()} (${round(pctN)})`
                            }
                        }
                    }
                )
            })
        } else {
            groups[groupName].filter(r => r[stratifyBy] !== CUMULUS_ALL).forEach(r => {
                series.data.push({
                    y           : r[valueColumn],
                    name        : r[stratifyBy] === CUMULUS_NONE ? `No known ${stratifyBy}` : r[stratifyBy],
                    showInLegend: true,
                    custom      : { data: r },
                    dataLabels: {
                        enabled: true,
                        inside : false,
                        align  : "end",
                        style: {
                            textDecoration: "none",
                            fontWeight    : "400",
                            fontSize      : FONT_SIZE,
                            textOutline   : "1px #FFFC"
                        }
                    }
                })
            })
        }

        return series
    })

    const options: Highcharts.Options = {
        chart: {
            style: {
                fontSize  : FONT_SIZE + "px",
                fontFamily: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
                color     : "#222"
            },
            backgroundColor: "#FFF",
            height,
            spacingTop: 20,
            spacingBottom: 20,
            spacingLeft: 20,
            spacingRight: 30,
            animation: { duration: 0 }
        },
        caption: valueColumn === "numerator" ? {
            align: "right",
            verticalAlign: "top",
            x: -2,
            style: { fontWeight: "400", fontSize: "18px" },
            text: `<b style="color:${COLOR_POSITIVE}">✔︎</b> valid&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b style="color:${COLOR_NEGATIVE}">✘</b> invalid`
        } : undefined,
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
                    fontSize: FONT_SIZE + "px",
                    textDecoration: "none",
                    fontWeight: "500",
                    color: "#777"
                }
            },
            lineWidth: 0
        },
        yAxis: {
            lineWidth: 1,
            endOnTick: false,
            startOnTick: false,
            tickWidth: 1,
            tickLength: 6,
            max: isPctChart ? 100.05 : undefined,
            offset: 8,
            labels: {
                format: isPctChart ? `{value}%` : `{value}`,
                overflow: "allow",
                style: {
                    fontSize: FONT_SIZE * 0.9 + "px"
                }
            },
            gridLineColor: "#0000",
            gridLineDashStyle: "ShortDash",
            title: {
                text: isPctChart ? "" : humanizeColumnName(valueColumn),
                style: {
                    fontWeight: "700",
                    fontSize: FONT_SIZE * 1.1 + "px"
                }
            },
            gridZIndex: 8
        },
        plotOptions: {
            series: {
                animation: { duration: 0 }
            },
            bar: {
                color: COLOR_NEUTRAL,
                minPointLength: isPctChart ? 6 : 0,
                borderRadius: 4,
                stacking: "overlap",
                crisp: true,
                borderWidth: 2,
                clip: false,
                groupPadding: 0.1,
                pointPadding: 0.0
            }
        },
        tooltip: {
            headerFormat: "",
            style: {
                fontSize: FONT_SIZE + "px",
            },
            backgroundColor: "#FCFCFC",
            useHTML: true,
            formatter() {
                // @ts-ignore
                let out = `<b style="color:${this.point.color}">◉</b> <b>${this.point.custom?.name || this.point.name}</b><hr/><table><tbody>`

                // @ts-ignore
                for (let name in this.point.custom?.data) {
                    // @ts-ignore
                    const value = this.point.custom.data[name]
                    if (value !== undefined) {
                        out += `<tr><td style="text-align:right;font-weight:600;color:#888">${humanizeColumnName(name)}:</td><td>${value.toLocaleString()}</td></tr>`
                    }
                }

                return out + `</tbody></table>`
            }
        },
        drilldown: {
            activeAxisLabelStyle: {
                textDecoration: "none",
                fontWeight: "400"
            },
            animation: { duration: 0 },
            breadcrumbs: {
                relativeTo: "spacingBox",
                position: {
                    align: "left",
                    verticalAlign: "top",
                    x: 10,
                    y: 18
                }
            }
        }
    }

    if (Level1.data.length) {
        options.series = [Level1]
        options.drilldown!.series = [Level2, ...Level3]
    }
    if (Level2.data.length) {
        options.series = Level1 ? [Level1, Level2] : [Level2]
        options.drilldown!.series = Level3 as any
    }
    else {
        options.series = Level3 as any
    }

    return <Chart options={options} callback={chart => {

        // Enable drilldown animations after the initial render
        requestAnimationFrame(() => {
            try {
                if (chart) {
                    chart.update({
                        drilldown: {
                            animation: { duration: 200 }
                        }
                    }, false, true, false);
                }
            } catch {}
        });
    }} />
}

function groupData(data: Record<string, any>[], column: string) {
    const groups: Record<string, typeof data> = {}
    data.forEach(row => {
        if(!groups[row[column]]) {
            groups[row[column]] = []
        }
        groups[row[column]].push(row)
    })
    return groups
}

function round(n: number) {
    const out = roundToPrecision(n, ROUND_PRECISION)
    if (+out === n) {
        return out +  "%"
    }
    return "～" + out +  "%"
}
