import { useCallback, useEffect, useState } from "react"
import NestedChart                          from "./NestedChart"
import FlatChart                            from "./FlatChart"
import DataGrid                             from "./DataGrid"
import { AlertError }                       from "../../generic/Alert"
import { Tabs }                             from "../../generic/Tabs"
import Loader                               from "../../generic/Loader"
import { app }                              from "../../../types"
import { request }                          from "../../../backend"
import FlatGrid from "./FlatGrid"

const aspectRatio = "2/1";
const chartHeight = "50%";

function getDataType(metadata: app.DataRequest["metadata"]) {
    if (metadata?.type !== "flat") {
        return "cube"
    }

    const colNames = metadata.cols.map(c => c.name)
    
    if (colNames.includes("id") && colNames.includes("numerator") && colNames.includes("denominator") && colNames.includes("percentage")) {
        return "flat"
    }

    if (colNames.includes("id") && colNames.includes("category") && colNames.includes("average") && colNames.includes("max")) {
        return "nested"
    }

    return "other"
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

    const type = getDataType(subscription.metadata)

    if (type === "flat") {
        return <Tabs>
            {[
                {
                    name: "Data Graph",
                    children: <div className="pl-05 pr-05" style={{ aspectRatio }}>
                        <FlatChart data={data} height={chartHeight} />
                    </div>
                }, {
                    name: "Data Grid",
                    children: <div className="p-05 pt-1" style={{ aspectRatio }}>
                        <FlatGrid cols={subscription.metadata!.cols} rows={data} />
                    </div>
                }
            ]}
        </Tabs>
    }

    if (type === "nested") {
        return <Tabs>
            {[
                {
                    name: "Data Graph",
                    children: <div className="pl-05 pr-05" style={{ aspectRatio }}>
                        <NestedChart data={data} height={chartHeight} />
                    </div>
                }, {
                    name: "Data Grid",
                    children: <div className="p-05 pt-1" style={{ aspectRatio }}>
                        <DataGrid cols={subscription.metadata!.cols} rows={data} />
                    </div>
                }
            ]}
        </Tabs>
    }

    return null
}
