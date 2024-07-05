import { useCallback, useEffect, useState } from "react"
import MetricsChart                         from "./MetricsChart"
import MetricsStaticGrid                    from "./MetricsStaticGrid"
import { AlertError }                       from "../../generic/Alert"
import { Tabs }                             from "../../generic/Tabs"
import Loader                               from "../../generic/Loader"
import { app }                              from "../../../types"
import { request }                          from "../../../backend"
import { humanizeColumnName }               from "../../../utils"

const aspectRatio = "2/1";
const chartHeight = "50%";



function pickColumns(metadata: app.DataRequest["metadata"])
{
    const cols = [ ...metadata!.cols.filter(c => !["denominator", "std_dev", "max"].includes(c.name)) ]
    const out  = { groupBy: "", stratifyBy: "", valueColumn: "" }

    let i = cols.findIndex(c => c.name === "resource" || c.name === "id")
    out.groupBy = cols.splice(i, 1)[0].name

    i = cols.findIndex(c => c.name === "numerator" || c.name === "percentage" || c.name === "average")
    out.valueColumn = cols.splice(i, 1)[0].name

    out.stratifyBy = cols[0].name

    return out;
}

export default function DataViewer({ subscription }: { subscription: app.DataRequest }) {
    
    const [loading, setLoading] = useState(false)
    const [error  , setError  ] = useState<Error | string | null>(null)
    const [data   , setData   ] = useState<Record<string, any>[] | null>(null)

    const requestId = subscription.id

    const loadData = useCallback(() => {
        setLoading(true)
        setError(null)
        return request(`/api/requests/${requestId}/raw-data`)
            .then(setData, setError)
            .finally(() => setLoading(false))
    }, [requestId]);

    useEffect(() => { loadData() }, [loadData])

    if (loading) {
        return <Loader />
    }

    if (error) {
        return <AlertError>{ error }</AlertError>
    }

    if (!data) {
        return null
    }

    const cols = pickColumns(subscription.metadata)

    return <Tabs selectedIndex={0}>
        {[
            {
                name: "Data Graph",
                children: <div className="pl-05 pr-05" style={{ aspectRatio }}>
                    <MetricsChart
                        data={data}
                        height={chartHeight}
                        groupBy={cols.groupBy}
                        stratifyBy={cols.stratifyBy}
                        valueColumn={cols.valueColumn}
                    />
                </div>
            }, {
                name: "Data Grid",
                children: <div className="p-05 pt-1" style={{ aspectRatio }}>
                    <MetricsStaticGrid
                        columns={subscription.metadata!.cols.map(c => ({
                            name : c.name,
                            label: humanizeColumnName(c.name),
                            searchable: true,
                            type: c.dataType === "boolean" ?
                                "boolean" :
                                (c.dataType === "float" || c.dataType === "integer") ?
                                    "number" :
                                    "string",
                        }))}
                        rows={data}
                        groupBy={cols.groupBy}
                        stratifyBy={cols.stratifyBy}
                        height={"calc(100% - 3.22rem)"} // exclude search-bar height
                    />
                </div>
            }
        ]}
    </Tabs>
}
