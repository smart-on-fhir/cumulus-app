import { useEffect, useMemo, useState } from "react"
import ColumnsTable                     from "./ColumnsTable"
import Loader                           from "../generic/Loader"
import { AlertError }                   from "../generic/Alert"
import aggregator                       from "../../Aggregator"
import { DataPackage }                  from "../../Aggregator"
import { humanizeColumnName }           from "../../utils"
import { app }                          from "../../types"


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

    const cols = Object.keys(pkg.columns).map(name => {
        let type = String(pkg.columns[name])
            .replace("year" , "date:YYYY")
            .replace("month", "date:YYYY-MM")
            .replace("week" , "date:YYYY-MM-DD")
            .replace("day"  , "date:YYYY-MM-DD") as app.supportedDataType;
        return {
            name,
            label      : humanizeColumnName(name),
            description: humanizeColumnName(name),
            dataType   : type
        }
    });

    return (
        <>
            <h5 className="mt-2 color-blue-dark">Data Package</h5>
            <hr />
            <table>
                <tbody>
                    <tr>
                        <th className="right pr-1 pl-1 nowrap">Last data update: </th>
                        <td>{ new Date(pkg.last_data_update).toLocaleString() }</td>
                    </tr>
                    <tr>
                        <th className="right pr-1 pl-1 nowrap">Total Rows: </th>
                        <td>{ Number(pkg.total).toLocaleString() }</td>
                    </tr>
                    <tr>
                        <th className="right pr-1 pl-1 nowrap">Study: </th>
                        <td>{ pkg.study }</td>
                    </tr>
                    <tr>
                        <th className="right pr-1 pl-1 nowrap">S3 Path: </th>
                        <td><span className="color-muted" style={{ wordBreak: "break-all" }}>{ pkg.s3_path || "" }</span></td>
                    </tr>
                </tbody>
            </table>
            <br />
            <h5 className="mt-2 color-blue-dark">Data Elements</h5>
            <hr />
            <ColumnsTable cols={cols} />
        </>
    )
}