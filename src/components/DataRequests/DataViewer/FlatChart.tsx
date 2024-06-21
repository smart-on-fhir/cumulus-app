import Chart                  from "./Chart"
import { humanizeColumnName } from "../../../utils"


export default function FlatChart({ data, height }: { data: Record<string, any>[], height: number | string }) {
    return <Chart options={{
        chart: {
            style: {
                fontSize  : "16px",
                fontFamily: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
                color     : "#333333"
            },
            backgroundColor: "transparent",
            height,
            spacingTop: 20,
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
        xAxis: {
            type: "category",
            categories: data.map(row => humanizeColumnName(row.id)),
            labels: {
                style: {
                    fontSize: "14px"
                }
            },
            lineWidth: 0
        },
        yAxis: {
            max: 100,
            labels: {
                style: {
                    fontSize: "14px"
                },
                format: "{value}%"
            },
            gridLineColor: "#0002",
            gridLineDashStyle: "ShortDash",
            title: {
                text: ""
            }
        },
        series: [{
            type: "column",
            borderRadius: 3,
            color: "#4a90e2",
            dataLabels: {
                enabled: true,
                format: "{y}%"
            },
            data: data.map((row, i) => ({
                y   : parseFloat(row.percentage),
                name: humanizeColumnName(row.id),
                custom: {
                    numerator: parseFloat(row.numerator),
                    denominator: parseFloat(row.denominator)
                }
            }))
        }],
        tooltip: {
            headerFormat: "",
            pointFormat: '<b>{point.name}:</b> {point.y:.2f}%<br/>numerator: {point.custom.numerator:,.0f}<br/>denominator: {point.custom.denominator:,.0f}',
            style: {
                fontSize: "14px"
            },
            outside: true
        }
    }} />
}

