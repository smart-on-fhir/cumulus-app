import PowerSet from "../../../PowerSet";
import BaseChart from "./BaseChart";
import { generateSeries } from "../utils";


export default function ColumnChart({
    column,
    dataSet,
    groupBy,
    use3d
}: {
    column: app.DataRequestDataColumn,
    groupBy?: app.DataRequestDataColumn | null, 
    dataSet: PowerSet
    use3d?: boolean
})
{

    const groups = dataSet.removeTotal().group2(column.name, groupBy?.name);

    return <BaseChart key={[column.name, groupBy?.name].filter(Boolean).join("-")} options={{
        chart: {
            type: "column",
            options3d: {
                enabled: !!use3d,
                alpha: 5,
                beta: 10,
                depth: 50,
                fitToPlot: true,
                viewDistance: 15
            },
            zoomType: "xy"
        },
        title: {
            text: column.label + (groupBy ? ` by ${groupBy.label}` : "")
        },
        legend: {
            enabled: !!groupBy //&& !use3d
        },
        yAxis: {
            // visible: false,
            // width: 0,
            crosshair: false,
            title: {
                text: use3d ? "" : "Count",
                style: {
                    fontWeight: "bold",
                    fontSize: "120%"
                }
            }
        },
        plotOptions: {
            column: {
                borderColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: 2,
                borderWidth: 0.25,
            }
        },
        xAxis: {
            // title: {
            //     text: column.label,
            // },
            type: "category",
            // groupBy ? (groupBy.dataType === "string" ? "category" : "linear") :
            //     (column.dataType === "string" ? "category" : "linear"),
            // categories: Object.keys(groups),
            // type: groupBy ?
            //     groupBy.dataType === "string" ? "category" : "linear" :
            //     column.dataType === "string" ? "category" : "linear",
            // showEmpty: false,
            // alignTicks: false,
            crosshair: !use3d,
            lineColor: "rgba(0, 0, 0, 0.2)",
        },
        series: generateSeries("column", column, groups, groupBy)
    }} />
}