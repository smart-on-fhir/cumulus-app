import PowerSet from "../../../PowerSet";
import BaseChart from "./BaseChart";


export default function AreaSPLineChart({
    column,
    groupBy,
    dataSet
}: {
    column: app.DataRequestDataColumn,
    dataSet: PowerSet,
    groupBy?: app.DataRequestDataColumn | null
})
{

    const { series, categories } = dataSet.getChartData("areaspline", column, groupBy)

    return <BaseChart options={{
        chart: {
            type: "areaspline"
        },
        title: {
            text: column.label + (groupBy ? ` by ${groupBy.label}` : "")
        },
        legend: {
            enabled: !!groupBy
        },
        yAxis: {
            title: {
                text: "Count",
                style: {
                    fontWeight: "bold",
                    fontSize: "120%"
                }
            }
        },
        xAxis: {
            type: groupBy ? groupBy.dataType === "string" ? "category" : "linear" :
            column.dataType === "string" ? "category" : "linear",
            // showEmpty: false,
            // alignTicks: false,
            // crosshair: true
            categories,
        },
        plotOptions: {
            areaspline: {
                fillOpacity: 0.1
            }
        },
        series
    }} />
}