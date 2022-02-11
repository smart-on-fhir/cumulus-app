import PowerSet from "../../../PowerSet";
import BaseChart from "./BaseChart";
import { generateSeries } from "../utils";


export default function BarChart({
    column,
    dataSet,
    groupBy,
    use3d
}: {
    column: app.DataRequestDataColumn,
    groupBy?: app.DataRequestDataColumn | null, 
    dataSet: PowerSet<any>
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
        series: generateSeries("bar", groups, groupBy)
    }} />
}