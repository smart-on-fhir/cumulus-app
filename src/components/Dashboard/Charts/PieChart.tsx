import PowerSet  from "../../../PowerSet";
import BaseChart from "./BaseChart";


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
    const { series } = dataSet.getChartData("pie", column)

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
            enabled: true
        },
        plotOptions: {
            pie: {
                innerSize  : donut ? "50%" : 0,
                depth      : 50,
                // startAngle : 20,
                borderColor: "rgba(0, 0, 0, 0.5)",
                borderWidth: 0.25,
                slicedOffset: use3d ? 20 : 10,
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><span style="opacity:0.5;font-weight:400"> - {point.percentage:.1f} %</span>'
                }

            }
        },
        series
    }} />
}