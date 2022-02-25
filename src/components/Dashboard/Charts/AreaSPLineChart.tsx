import PowerSet from "../../../PowerSet";
import Chart    from "./Chart";


export default function AreaSPLineChart({
    column,
    groupBy,
    dataSet
}: {
    column: app.DataRequestDataColumn,
    dataSet: PowerSet,
    groupBy?: app.DataRequestDataColumn | null
})
{
    return <Chart
        column={column}
        groupBy={groupBy}
        dataSet={dataSet}
        type="areaspline"
        key={ [column.name, groupBy?.name || ""].join("-") }
    />
}