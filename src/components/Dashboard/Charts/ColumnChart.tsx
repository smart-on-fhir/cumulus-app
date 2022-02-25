import PowerSet from "../../../PowerSet";
import Chart    from "./Chart";


export default function ColumnChart({
    column,
    dataSet,
    groupBy,
    use3d,
    stack
}: {
    column: app.DataRequestDataColumn,
    groupBy?: app.DataRequestDataColumn | null, 
    dataSet: PowerSet
    use3d?: boolean
    stack?: boolean
})
{
    return <Chart
        column={column}
        groupBy={groupBy}
        dataSet={dataSet}
        type="column"
        key={ [column.name, groupBy?.name || ""].join("-") }
        options={{
            chart: {
                type: "column",
                options3d: {
                    enabled: !!use3d,
                    alpha: 15,
                    beta: 15,
                    depth: 50,
                    fitToPlot: true,
                    viewDistance: 15,
                    axisLabelPosition: "auto"
                }
            },
            plotOptions: {
                column: {
                    stacking: stack ? "normal" : undefined
                }
            },
            yAxis: {
                title: {
                    text: use3d ? "" : "Count"
                }
            }
        }}
    />
}