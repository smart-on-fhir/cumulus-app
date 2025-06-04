import { useEffect, useMemo, useState } from "react"
import { Link }                         from "react-router-dom"
import Loader                           from "../generic/Loader"
import { AlertError }                   from "../generic/Alert"
import MetaDataList                     from "../generic/MetaDataList"
import aggregator                       from "../../Aggregator"
import { DataPackage }                  from "../../Aggregator"
import Terminology                      from "../../Terminology"
import { humanizeColumnName }           from "../../utils"


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
        <MetaDataList items={[
            {
                icon : "event_available",
                label: "Last Data Update",
                value: new Date(pkg.last_data_update).toLocaleString()
            },
            {
                icon : "calculate",
                label: "Total Rows",
                value: Number(pkg.total).toLocaleString()
            },
            {
                icon : Terminology.study.icon,
                label: Terminology.study.nameSingular,
                value: <Link to={`/studies/${pkg.study}`} className="link">{ humanizeColumnName(pkg.study) }</Link>
            },
        ]} />
    )
}