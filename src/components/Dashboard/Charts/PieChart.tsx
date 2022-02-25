import PowerSet from "../../../PowerSet";
import Chart    from "./Chart";


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
    return <Chart
        column={column}
        dataSet={dataSet}
        type="pie"
        key={column.name}
        options={{
            chart: {
                type: "pie",
                options3d: {
                    enabled: !!use3d,
                    alpha: 45,
                    beta: 0,
                    depth: 350
                }
            },
            plotOptions: {
                pie: {
                    innerSize: donut ? "50%" : 0,
                    slicedOffset: use3d ? 30 : 10
                }
            }
        }}
    />
}