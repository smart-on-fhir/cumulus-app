import PowerSet from "../../../PowerSet";
import BaseChart from "./BaseChart";
import { generateSeries } from "../utils";


export default function PieChart({
    column,
    dataSet,
    use3d,
    donut
}: {
    column: app.DataRequestDataColumn
    dataSet: PowerSet
    use3d?: boolean
    donut?: boolean
})
{
    const groups = dataSet.group2(column.name);

    return <BaseChart options={{
        chart: {
            type: "pie",
            options3d: {
                enabled: !!use3d,
                alpha: 45,
                beta: 0,
                depth: 350
            }
        },
        title: {
            text: column.label
        },

        legend: {
            enabled: true//!!groupBy && !use3d
        },
        // yAxis: {
        //     visible: false
        // },
        // xAxis: {
        //     visible: false
        // },
        plotOptions: {
            pie: {
                // depth: 50,
                innerSize  : donut ? "50%" : 0,
                depth      : 50,

                // startAngle : 20,
                borderColor: "rgba(0, 0, 0, 0.5)",
                borderWidth: 0.25,
                
                // opacity: 0.9,
                shadow: {
                    opacity: 0.05,
                    width: 3,
                    offsetY: 1,
                    offsetX: 2,
                    color: "#000",
                },
                // slicedOffset: 50,

            }
        },
        series: generateSeries("pie", column, groups)
    }} />
}