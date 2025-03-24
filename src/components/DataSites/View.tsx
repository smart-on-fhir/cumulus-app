import { Fragment, useCallback, useEffect, useState } from "react"
import moment                     from "moment"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { useParams }              from "react-router"
import { Link }                   from "react-router-dom"
import Breadcrumbs                from "../generic/Breadcrumbs"
import PageHeader                 from "../generic/PageHeader"
import Loader                     from "../generic/Loader"
import { AlertError }             from "../generic/Alert"
import Terminology                from "../../Terminology"
import aggregator, { Site }       from "../../Aggregator"
import { humanizeColumnName }     from "../../utils"


function PreLoad()
{
    const {id} = useParams()
    const [site   , setSite   ] = useState<Site>()
    const [loading, setLoading] = useState(true)
    const [error  , setError  ] = useState<Error | string | null>(null)

    const load = useCallback(() => {
        setLoading(true)
        setError(null)
        aggregator.getSites()
        .then(_sites => _sites.find(s => s.id === id))
        .then(_site  => setSite(_site))
        .catch(setError)
        .finally(() => setLoading(false))
    }, [id])

    useEffect(() => load(), [load])

    if (loading) {
        return (
            <div className="container">
                <Loader />
            </div>
        )
    }

    if (error) {
        return (
            <div className="container">
                <AlertError>{ error + "" }</AlertError>
            </div>
        )
    }

    return <ViewSite site={site} />
}

export default function ViewSite({ site }: { site?: Site })
{
    if (!site) {
        return <PreLoad/>
    }

    const numStudies = Object.keys(site.studies).length
    
    let earliest   = Infinity
    let latest     = -Infinity
    let lastUpdate = -Infinity

    for (const study in site.studies) {
        for (const version in site.studies[study]) {
            const period = site.studies[study][version]
            if (period.earliest_date) {
                earliest = Math.min(earliest, moment(period.earliest_date).valueOf())
            }
            if (period.latest_date) {
                latest = Math.max(latest, moment(period.latest_date).valueOf())
            }
            if (period.last_data_update) {
                lastUpdate = Math.max(lastUpdate, moment(period.last_data_update).valueOf())
            }
        }
    }

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>{site.name}</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home"    , href: "/" },
                { name: Terminology.site.namePlural, href: "/sites" },
                { name: site.name, href: "/sites/" + site.id }
            ]} />
            <PageHeader
                title={ site.name }
                icon={ Terminology.site.icon }
                description="Description not available" />
            
            <div className="row gap-2 wrap">
                <div className="col col-8 responsive">
                    <h5 className="mt-2">{Terminology.study.namePlural}</h5>
                    <hr className="mb-1" />
                    { numStudies > 0 ?
                        Object.keys(site.studies).map(id => {
                            return <Fragment key={id}>
                                <div className="mb-05">
                                    <i className="material-symbols-outlined icon color-brand-2 mr-05">{ Terminology.study.icon }</i>
                                    <Link to={`/studies/${id}`} className="link">
                                        <b>{humanizeColumnName(id)}</b>
                                    </Link>
                                </div>
                                { Object.keys(site.studies[id]).map((version, i) => {
                                    return <div key={i} className="mb-05 ml-1">
                                        <i className="material-symbols-outlined icon color-muted mr-05">history</i>
                                        <Link to={`/studies/${id}/${version}`} className="link">Version {version}</Link>
                                        <span  className="color-muted"> - { new Date(site.studies[id][version].last_data_update).toDateString() }</span>
                                    </div>
                                })}
                                <br/>
                            </Fragment>
                        }) :
                        <div className="text-muted">This {Terminology.site.nameSingular.toLowerCase()} is not participating in any {Terminology.study.namePlural.toLowerCase()} yet</div>
                    }

                    <h5 className="mt-2">Timeline</h5>
                    <hr className="mb-1" />
                    <Timeline site={site} />
                </div>
                <div className="col" style={{ wordBreak: "break-all", minWidth: "15rem" }}>
                    <h5 className="mt-2">Metadata</h5>
                    <hr className="mb-1" />
                    <b>ID</b>
                    <div className="color-muted">{ site.id }</div>

                    { isFinite(earliest) && <>
                        <br />
                        <b>Earliest Data</b>
                        <div className="color-muted">{ new Date(earliest).toLocaleString() }</div>
                    </> }
                    { isFinite(latest) && <>
                        <br />
                        <b>Latest Data: </b>
                        <div className="color-muted">{ new Date(latest).toLocaleString() }</div>
                    </> }
                    { isFinite(lastUpdate) && <>
                        <br />
                        <b>Last Data Update: </b>
                        <div className="color-muted">{ new Date(lastUpdate).toLocaleString() }</div>
                    </> }
                </div>
            </div>
        </div>
    )
}

function Timeline({ site }: { site: Site }) {
    return (
        <div>
            { getTimelineEvents(site).map((e, i) => {
                return (
                    <div key={i} className="row" style={{ padding: "0.4em 0" }} >
                        <div className="col col-0">
                            <span className="material-symbols-outlined color-brand-2 mr-05">calendar_clock</span>
                        </div>
                        <span className="col color-muted" style={{ flex: "0 1 10rem" }}>{ new Date(e.date).toDateString() }</span>
                        <div className="col">{ e.msg }</div>
                    </div>
                )
            })}
        </div>
    )
}

function getTimelineEvents(site: Site) {
    const events: any[] = []
    for (const study in site.studies) {
        for (const version in site.studies[study]) {
            const info = site.studies[study][version]
            events.push({
                date: info.last_data_update,
                msg : <div>Inserted data in the <b>{humanizeColumnName(study)}</b> study - version {version}</div>
            })
        }
    }
    return events.sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf())
}
