import PowerSet from "../../../PowerSet";
import Chart    from "./Chart";


export default function AreaSPLineChart({
    column,
    groupBy,
    dataSet,
    fullDataSet,
    options,
    colorOptions,
    denominator,
    column2,
    column2type,
    column2opacity = 1
}: {
    column: app.DataRequestDataColumn
    dataSet: PowerSet
    fullDataSet: PowerSet
    groupBy?: app.DataRequestDataColumn | null
    options?: Partial<Highcharts.Options>
    colorOptions: app.ColorOptions
    denominator?: string
    column2    ?: app.DataRequestDataColumn | null
    column2type?: string
    column2opacity?: number
})
{
    return <Chart
        column={column}
        groupBy={groupBy}
        dataSet={dataSet}
        fullDataSet={fullDataSet}
        options ={options}
        colorOptions={colorOptions}
        denominator={denominator}
        type="areaspline"
        key={ [column.name, groupBy?.name || "", options?.annotations?.length || ""].join("-") }
        column2={column2}
        column2type={column2type}
        column2opacity={column2opacity}
    />
}