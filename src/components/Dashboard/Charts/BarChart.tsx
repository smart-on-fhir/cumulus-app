import PowerSet from "../../../PowerSet";
import BaseChart from "./BaseChart";
import { generateSeries } from "../utils";


export default function BarChart({
    column,
    dataSet,
    groupBy,
    use3d
}: {
    column: app.DataRequestDataColumn
    groupBy?: app.DataRequestDataColumn | null
    dataSet: PowerSet
    use3d?: boolean
})
{
    const groups = dataSet.group2(column.name, groupBy?.name);

    return <BaseChart options={{
        chart: {
            type: "bar",
            options3d: {
                enabled: !!use3d,
                alpha: 10,
                beta: 5,
                depth: 50,
                fitToPlot: true,
                viewDistance: 15
            }
        },
        title: {
            text: column.label + (groupBy ? ` by ${groupBy.label}` : "")
        },
        legend: {
            enabled: false
        },
        yAxis: {
            crosshair: true,
            title: {
                text: use3d ? "" : "Count",
                style: {
                    fontWeight: "bold",
                    fontSize: "120%"
                }
            }
        },
        xAxis: {
            type: column.dataType === "string" ? "category" : "linear",
            showEmpty: false,
            alignTicks: false,
            crosshair: !use3d
        },
        plotOptions: {
            bar: {
                borderColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: 2,
                borderWidth: 0.5,
            }
        },
        series: generateSeries("bar", column, groups, groupBy)
    }} />
}