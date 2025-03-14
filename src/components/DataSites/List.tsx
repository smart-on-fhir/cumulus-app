import moment                               from "moment"
import Link                                 from "../Link"
import { useCallback, useEffect, useState } from "react"
import { Helmet, HelmetProvider }           from "react-helmet-async"
import PageHeader                           from "../generic/PageHeader"
import Loader                               from "../generic/Loader"
import { AlertError }                       from "../generic/Alert"
import Breadcrumbs                          from "../generic/Breadcrumbs"
import Terminology                          from "../../Terminology"
import aggregator                           from "../../Aggregator"
import { sortBy }                           from "../../utils"


function getSiteDate(site: any) {
    let date = -Infinity
    for (const study in site.studies) {
        for (const version in site.studies[study]) {
            const d = moment(site.studies[study][version].last_data_update).valueOf()
            if (d > date) {
                date = d
            }
        }
    }
    if (isFinite(date)) {
        return new Date(date).toDateString()
    }

    return ""
}


export default function ListSites()
{
    const [sites  , setSites  ] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error  , setError  ] = useState<Error | string | null>(null)

    const load = useCallback(() => {
        setLoading(true)
        setError(null)
        aggregator.getSites()
        .then(_sites => sortBy(_sites, "name"))
        .then(_sites => setSites(_sites))
        .catch(setError)
        .finally(() => setLoading(false))
    }, [])

    useEffect(() => load(), [load])

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>List Data Sites</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home"    , href: "/" },
                { name: Terminology.site.namePlural }
            ]} />
            <PageHeader
                title={Terminology.site.namePlural}
                icon={Terminology.site.icon}
                description="List of all the healthcare sites which have contributed data to Cumulus studies" />
            { loading && <Loader/> }
            { error && <AlertError>{ error + "" }</AlertError> }
            <hr className="mb-0"/>
            <table className="table table-border-x table-hover">
                <thead>
                    <tr>
                        <th style={{ width: "2.5em" }}></th>
                        <th>Site</th>
                        <th>Studies</th>
                        <th>Last Data Update</th>
                    </tr>
                </thead>
                <tbody>
                    { sites && sites.map((s, i) => (
                        <tr key={i}>
                            <td><i className="icon material-symbols-outlined color-muted">{Terminology.site.icon}</i></td>
                            <td><Link to={`/sites/${s.id}`} className="link">{s.name}</Link></td>
                            <td className="color-muted">{ Object.keys(s.studies).length } studies</td>
                            <td className="color-muted">{ getSiteDate(s) }</td>
                        </tr>
                    )) }
                </tbody>
            </table>
        </div>
    )
}
