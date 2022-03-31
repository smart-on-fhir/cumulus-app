import { merge } from "highcharts"
import PowerSet from "../../../PowerSet";
import Chart    from "./Chart";


export default function BarChart({
    column,
    dataSet,
    fullDataSet,
    groupBy,
    use3d,
    stack,
    options,
    colorOptions,
    denominator,
    column2,
    column2type
}: {
    column: app.DataRequestDataColumn
    groupBy?: app.DataRequestDataColumn | null
    dataSet: PowerSet
    fullDataSet: PowerSet
    use3d?: boolean
    stack?: boolean
    options?: Partial<Highcharts.Options>
    colorOptions: app.ColorOptions
    denominator?: string
    column2    ?: app.DataRequestDataColumn | null
    column2type?: string
})
{   
    return <Chart
        column={column}
        groupBy={groupBy}
        dataSet={dataSet}
        fullDataSet={fullDataSet}
        type="bar"
        key={ [column.name, groupBy?.name || ""].join("-") }
        colorOptions={colorOptions}
        denominator={denominator}
        column2={column2}
        column2type={column2type}
        options={merge({
            chart: {
                options3d: {
                    enabled: !!use3d,
                    alpha: 10,
                    beta: 15,
                    depth: 80,
                    fitToPlot: true,
                    viewDistance: 100,
                    axisLabelPosition: null
                }
            },
            plotOptions: {
                bar: {
                    stacking: stack ? "normal" : undefined
                }
            },
            yAxis: {
                title: {
                    text: use3d ? "" : "Count"
                }
            },
            xAxis: {
                offset: use3d ? 5 : 0
            }
        }, options)}
    />
}