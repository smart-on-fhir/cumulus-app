import { useEffect, useMemo, useState } from "react"
import { useParams, Link }              from "react-router-dom"
import { HelmetProvider, Helmet }       from "react-helmet-async"
import TransmissionView                 from "../Subscriptions/TransmissionView"
import { AlertError }                   from "../generic/Alert"
import Loader                           from "../generic/Loader"
import Breadcrumbs                      from "../generic/Breadcrumbs"
import PageHeader                       from "../generic/PageHeader"
import aggregator, { DataPackage }      from "../../Aggregator"
import Terminology                      from "../../Terminology"
import { humanizeColumnName }           from "../../utils"


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

export default function ViewStudyVersion() {

    const {id, version} = useParams()

    const [loading      , setLoading] = useState(true)
    const [error        , setError  ] = useState<Error | string | null>(null)
    // const [periods      , setPeriods] = useState<StudyPeriod[]>([])
    const [sites        , setSites  ] = useState<Site[]>([])
    const [transmissions, setTransmissions] = useState<Transmission[]>([])
    const [packages     , setPackages     ] = useState<DataPackage[]>([])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const abortController = useMemo(() => new AbortController(), [id, version])

    useEffect(() => {
        setError(null)
        setLoading(true)
        load(id!, version!)
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
    }, [ id, abortController, version ])

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
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>{humanizeColumnName(id!)}</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home"    , href: "/" },
                { name: Terminology.study.namePlural, href: "/studies" },
                { name: humanizeColumnName(id!), href: "/studies/" + id },
                { name: "Version " + version },
            ]} />
            <PageHeader
                title={ <>{ humanizeColumnName(id!) } <span className="color-muted">/ {version}</span></> }
                icon={Terminology.study.icon}
                description={`Description not available`} />
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
                                    to={`/packages/${p.id}`}
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
                    <b>Study</b>
                    <Link className="link" to={`../`}>{ id }</Link>
                    <br />
                    <b>Version</b>
                    <div className="color-muted">{ version }</div>
                    <br />
                    <b>Sites</b>
                    <div className="color-muted">{ sites.length.toLocaleString() }</div>
                    <br />
                    <b>Packages</b>
                    <div className="color-muted">{ packages.length.toLocaleString() }</div>
                    <br />
                    <b>Total</b>
                    <div className="color-muted">{ packages.reduce((prev, cur) => prev + cur.total, 0).toLocaleString() }</div>
                    <br />
                    <b>Last Data Update</b>
                    <div className="color-muted">{ new Date(packages.map(p => +new Date(p.last_data_update)).sort().pop()!).toDateString() }</div>
                </div>
            </div>
        </div>
    )
}
