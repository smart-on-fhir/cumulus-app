import { useEffect, useMemo, useState } from "react"
import Loader                           from "../generic/Loader"
import { AlertError }                   from "../generic/Alert"
import aggregator                       from "../../Aggregator"
import { DataPackage }                  from "../../Aggregator"


export default function DataPackageViewer({ packageId }: { packageId: string }) {

    const [pkg    , setPkg    ] = useState<DataPackage | null>(null)
    const [loading, setLoading] = useState(true)

    const abortController = useMemo(() => new AbortController(), [])

    useEffect(() => {
        aggregator.getPackage(packageId).then(pkg => {
            setPkg(pkg || null)
        }).finally(() => setLoading(false))

        return () => {
            // Note that aggregator requests are global and are meant to be
            // cached, therefore we don't abort them. We just need to prevent
            // the unmounted component from trying to render when those requests
            // are completed 
            abortController.abort()
        }
    }, [ packageId, abortController ])

    if (abortController.signal.aborted) {
        return null
    }

    if (loading) {
        return <Loader msg="Loading package..." />
    }

    if (!pkg) {
        return <AlertError>Package not found</AlertError>
    }

    return (
        <>
            <div className="col">
                <br />
                <b>Last Data Update</b>
                <div className="color-muted">{ new Date(pkg.last_data_update).toLocaleString() }</div>
            </div>
            <div className="col">
                <br />
                <b>Total Rows</b>
                <div className="color-muted">{ Number(pkg.total).toLocaleString() }</div>
            </div>
            <div className="col">
                <br />
                <b>Study</b>
                <div className="color-muted">{ pkg.study }</div>
            </div>
        </>
    )
}