import { useCallback, useEffect, useState } from "react"
import MetricsChart                         from "./MetricsChart"
import MetricsStaticGrid                    from "./MetricsStaticGrid"
import { AlertError }                       from "../../generic/Alert"
import { Tabs }                             from "../../generic/Tabs"
import Loader                               from "../../generic/Loader"
import { app, JSONScalar }                  from "../../../types"
import { request }                          from "../../../backend"
import { humanizeColumnName }               from "../../../utils"
import aggregator, { DataPackage }          from "../../../Aggregator"


const aspectRatio = "2/1";
const chartHeight = "50%";

interface ColumnDefinition {
    name     : string
    dataType?: string
    type    ?: string
    extDtype?: string
}

type Data = Record<string, JSONScalar>

function pickColumns(columns: ColumnDefinition[]) {
    const cols = [ ...columns.filter(c => !["denominator", "std_dev", "max"].includes(c.name)) ]
    const out  = { groupBy: "", stratifyBy: "", valueColumn: "" }

    let i = cols.findIndex(c => c.name === "resource" || c.name === "id")
    out.groupBy = cols.splice(i, 1)[0].name

    i = cols.findIndex(c => c.name === "numerator" || c.name === "percentage" || c.name === "average")
    out.valueColumn = cols.splice(i, 1)[0].name

    out.stratifyBy = cols[0].name

    return out;
}

export function FlatPackageDataViewer({ pkg }: { pkg: DataPackage }) {
    const [loading, setLoading] = useState(false)
    const [error  , setError  ] = useState<Error | string | null>(null)
    const [data   , setData   ] = useState<any>(null)

    const loadData = useCallback(() => {
        setLoading(true)
        setError(null)
        return aggregator.getPackageJson(pkg.s3_path || "").then(setData, setError).finally(() => setLoading(false))
    }, [pkg.s3_path]);

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

    const out = pickColumns(data.schema.fields)

    return <Viewer
        columns={data.schema.fields as unknown as ColumnDefinition[]}
        data={data.data}
        groupBy={out.groupBy}
        stratifyBy={out.stratifyBy}
        valueColumn={out.valueColumn}/>
}

export default function DataViewer({ subscription }: { subscription: app.Subscription }) {
    
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

    const cols = pickColumns(subscription.metadata!.cols as unknown as ColumnDefinition[])

    return <Viewer
        columns={subscription.metadata!.cols as unknown as ColumnDefinition[]}
        data={data}
        groupBy={cols.groupBy}
        stratifyBy={cols.stratifyBy}
        valueColumn={cols.valueColumn}/>
}

function Viewer({
    data,
    groupBy,
    stratifyBy,
    valueColumn,
    columns
}: {
    data: Data[]
    groupBy: string
    stratifyBy: string
    valueColumn: string
    columns: ColumnDefinition[]
}) {
    return (
        <Tabs selectedIndex={0}>
            {[
                {
                    name: "Data Graph",
                    children: <div className="pl-05 pr-05" style={{ aspectRatio }}>
                        <MetricsChart
                            data={data}
                            height={chartHeight}
                            groupBy={groupBy}
                            stratifyBy={stratifyBy}
                            valueColumn={valueColumn}
                        />
                    </div>
                }, {
                    name: "Data Grid",
                    children: <div className="p-05 pt-1" style={{ aspectRatio }}>
                        <MetricsStaticGrid
                            columns={columns.map(c => {
                                const type = c.dataType || c.extDtype || c.dataType
                                return {
                                    name : c.name,
                                    label: humanizeColumnName(c.name),
                                    searchable: true,
                                    type: type === "boolean" ?
                                        "boolean" :
                                        (type === "float" || type === "integer" || type === "Int64") ?
                                            "number" :
                                            "string",
                                }
                            })}
                            rows={data}
                            groupBy={groupBy}
                            stratifyBy={stratifyBy}
                            height={"calc(100% - 3.22rem)"} // exclude search-bar height
                        />
                    </div>
                }
            ]}
        </Tabs>
    )
}
