import { useEffect, useMemo, useState } from "react"
import ColumnsTable                     from "./ColumnsTable"
import TransmissionView                 from "./TransmissionView"
import Loader                           from "../generic/Loader"
import Alert, { AlertError }            from "../generic/Alert"
import aggregator                       from "../../Aggregator"
import { DataPackage, StudyPeriod }     from "../../Aggregator"
import { humanizeColumnName }           from "../../utils"
import { app }                          from "../../types"


export default function DataPackageViewer({ packageId }: { packageId: string }) {

    const [pkg    , setPkg    ] = useState<DataPackage>()
    const [periods, setPeriods] = useState<StudyPeriod[]>([])
    const [loading, setLoading] = useState(true)

    const abortController = useMemo(() => new AbortController(), [])

    useEffect(() => {
        aggregator.getPackage(packageId).then(pkg => {
            if (!pkg) {
                return null
            }
            return aggregator.getStudyPeriods(pkg!.study).then(
                p => {
                    setPeriods(p)
                    setPkg(pkg)
                })
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

    const sites = periods.map(p => ({ id: p.site, name: humanizeColumnName(p.site) }))
    // .reduce((prev, cur) => {
    //     if (!prev.find(x => x.id === cur.id)) {
    //         prev.push(cur)
    //     }
    //     return prev
    // }, [] as any[])

    const transmissions = periods.map(p => ({
        dataStart: new Date(p.earliest_date),
        dataEnd  : new Date(p.latest_date),
        date     : new Date(p.last_data_update),
        siteId   : p.site as any
    }))

    return (
        <>
            <h5 className="mt-2 color-blue-dark">
                <i className="fas fa-table"/> Package Data
            </h5>
            <hr />
            <div className="row nowrap gap mb-1">
                <div className="col col-7">
                    <p className="nowrap">
                        <b>Last data update: </b>
                        <span className="color-blue-dark">{ new Date(pkg.last_data_update).toLocaleString() }</span>
                    </p>
                </div>
                <div className="col col-auto"></div>
                <div className="col col-0">
                    <p>
                        <b>Total Rows: </b>
                        <span className="color-blue-dark">{ Number(pkg.total).toLocaleString() }</span>
                    </p>
                </div>
            </div>
            <div>
                <b>Study: </b>
                <span className="color-blue-dark">{ pkg.study }</span>
            </div>
            <div>
                <b>S3 Path: </b>
                <span className="color-muted" style={{ wordBreak: "break-all" }}>{ pkg.s3_path || "" }</span>
            </div>
            <br />
            <ColumnsTable cols={cols} />
            <h5 className="mt-2 color-blue-dark">
                <i className="fa-solid fa-database"/> Study Data
            </h5>
            <hr className="mb-05" />
            { loading ?
                <p><Loader msg="Loading study periods" /></p> :
                transmissions.length > 0 ?
                    <TransmissionView
                        // @ts-ignore
                        sites={ sites }
                        transmissions={ transmissions }
                    /> :
                    <Alert color="orange">
                        <b><i className="fa-regular fa-circle-xmark" />&nbsp;Study periods data not available</b>
                    </Alert>
                }
        </>
    )
}