import PowerSet from "../../../PowerSet";
import Chart    from "./Chart";


export default function SPLineChart({
    column,
    groupBy,
    dataSet,
    fullDataSet,
    options = {},
    colorOptions,
    denominator
}: {
    column: app.DataRequestDataColumn
    dataSet: PowerSet
    fullDataSet: PowerSet
    groupBy?: app.DataRequestDataColumn | null
    options?: Partial<Highcharts.Options>
    colorOptions: app.ColorOptions,
    denominator?: string
})
{
    return <Chart
        column={column}
        groupBy={groupBy}
        dataSet={dataSet}
        fullDataSet={fullDataSet}
        options={options}
        key={ [column.name, groupBy?.name || ""].join("-") }
        type="spline"
        colorOptions={colorOptions}
        denominator={denominator}
    />
}
