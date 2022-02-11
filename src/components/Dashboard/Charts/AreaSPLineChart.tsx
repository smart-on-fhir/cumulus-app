import PowerSet from "../../../PowerSet";
import BaseChart from "./BaseChart";
import { generateSeries } from "../utils";

export default function AreaSPLineChart({
    column,
    groupBy,
    dataSet
}: {
    column: app.DataRequestDataColumn,
    dataSet: PowerSet<any>,
    groupBy?: app.DataRequestDataColumn | null
})
{
    const groups = dataSet.group2(column.name, groupBy?.name || "");

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
            showEmpty: false,
            alignTicks: false,
            crosshair: true
        },
        plotOptions: {
            areaspline: {
                fillOpacity: 0.1,
                dataSorting: {
                    enabled: true,
                    matchByName: false,
                    sortKey: "z"
                }
            }
        },
        series: generateSeries("areaspline", groups, groupBy)
    }} />
}