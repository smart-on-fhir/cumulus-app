import { useEffect, useMemo, useState } from "react"
import { Link }                         from "react-router-dom"
import { AlertError }                   from "../generic/Alert"
import Loader                           from "../generic/Loader"
import TransmissionView                 from "../Subscriptions/TransmissionView"
import { humanizeColumnName }           from "../../utils"
import aggregator, {
    DataPackage,
    Study,
    // StudyPeriod
} from "../../Aggregator"


interface Site {
    id  : string
    name: string
}

interface Transmission {
    dataStart: Date
    dataEnd  : Date
    date     : Date
    siteId   : string | number
}

async function load(studyId: string, version: string) {
    const periods  = (await aggregator.getStudyPeriods(studyId)).filter(p => p.version === version)
    const packages = await aggregator.filterPackages({ study: studyId, version })
    // const uniquePackages = packages.reduce((prev, cur) => {
    //     if (!prev.find(p => p.name === cur.name)) {
    //         prev.push(cur)
    //     }
    //     return prev
    // }, [] as DataPackage[])

    // const uniquePeriods = periods.reduce((prev, cur) => {
    //     if (!prev.find(x => x.site === cur.site)) {
    //         prev.push(cur)
    //     }
    //     return prev
    // }, [] as StudyPeriod[])

    const sites = periods.map(p => ({
        id  : p.site,
        name: humanizeColumnName(p.site)
    }))

    const transmissions = periods.map(p => ({
        dataStart: new Date(p.earliest_date),
        dataEnd  : new Date(p.latest_date),
        date     : new Date(p.last_data_update),
        siteId   : p.site as any
    }))

    return {
        periods,
        packages,//: uniquePackages,
        sites,
        transmissions
    }
}

export default function StudyView({ study, version }: { study: Study, version: string }) {
    const [loading      , setLoading] = useState(true)
    const [error        , setError  ] = useState<Error | string | null>(null)
    // const [periods      , setPeriods] = useState<StudyPeriod[]>([])
    const [sites        , setSites  ] = useState<Site[]>([])
    const [transmissions, setTransmissions] = useState<Transmission[]>([])
    const [packages     , setPackages     ] = useState<DataPackage[]>([])

    const abortController = useMemo(() => new AbortController(), [])
    const studyId = study.id

    useEffect(() => {
        setError(null)
        setLoading(true)
        load(studyId, version)
            .then(result => {
                // setPeriods(result.periods)
                setSites(result.sites)
                setTransmissions(result.transmissions)
                setPackages(result.packages)
            })
            .catch(setError)
            .finally(() => {
                if (!abortController.signal.aborted) {
                    setLoading(false)
                }
            })

        return () => {
            // Note that aggregator requests are global and are meant to be
            // cached, therefore we don't abort them. We just need to prevent
            // the unmounted component from trying to render when those requests
            // are completed 
            abortController.abort()
        }
    }, [ studyId, abortController, version ])

    if (abortController.signal.aborted) {
        return null
    }

    if (loading) {
        return <Loader msg="Loading..." />
    }

    if (error) {
        return <AlertError>{ error + "" }</AlertError>
    }

    return (
        <>
            <h1>
                <i className="material-symbols-outlined mr-05" style={{ verticalAlign: "text-bottom", fontSize: "1.2em" }}>experiment</i>
                { humanizeColumnName(study.label) }
            </h1>
            <p className="color-muted">Description not available</p>
            <div className="row gap-2 wrap">
                <div className="col col-8 responsive">
                    <h5 className="mt-2">Study Periods</h5>
                    <hr className="mb-1" />
                    { transmissions.length ? 
                        // @ts-ignore
                        <TransmissionView sites={ sites } transmissions={ transmissions } /> :
                        <p className="color-muted">Study periods data not available</p>
                    }

                    <h5 className="mt-2">Packages</h5>
                    <hr className="mb-1" />
                    { packages.map((p, i) => {
                        const [, name] = p.id.trim().split("__")
                        return (
                            <div key={i}>
                                <i className="material-symbols-outlined color-brand-2" style={{ fontSize: 18, verticalAlign: "middle" }}>
                                    { p.type === "flat" ? "table" : "deployed_code" }
                                </i> <Link
                                    to={`/explorer?path=${encodeURIComponent(`/studies/${study.id}/${version}/${p.id}`)}`}
                                    // reloadDocument
                                    className="link"
                                >
                                    {humanizeColumnName(name)}
                                </Link>
                                <small className="color-muted"> - { Number(p.total).toLocaleString() }</small>
                            </div>
                        )
                    })}
                </div>
                <div className="col" style={{ wordBreak: "break-all", minWidth: "15rem" }}>
                    <h5 className="mt-2">Metadata</h5>
                    <hr className="mb-1" />
                    <br />
                    <b>ID</b>
                    <div className="color-muted">{ study.id }</div>
                    <br />
                    <b>Version</b>
                    <div className="color-muted">{ version }</div>
                </div>
            </div>
        </>
    )
}
