import { merge } from "highcharts"
import PowerSet from "../../../PowerSet";
import Chart    from "./Chart";


export default function PieChart({
    column,
    dataSet,
    fullDataSet,
    use3d,
    donut,
    options,
    colorOptions,
    denominator
}: {
    column: app.DataRequestDataColumn
    dataSet: PowerSet
    fullDataSet: PowerSet
    use3d?: boolean
    donut?: boolean
    options?: Partial<Highcharts.Options>
    colorOptions: app.ColorOptions
    denominator?: string
})
{
    return <Chart
        column={column}
        dataSet={dataSet}
        fullDataSet={fullDataSet}
        type="pie"
        key={column.name}
        colorOptions={colorOptions}
        denominator={denominator}
        options={merge({
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
        }, options)}
    />
}