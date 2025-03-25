import { useCallback, useEffect, useState } from "react"
import { Link }                       from "react-router-dom"
import { HelmetProvider, Helmet }     from "react-helmet-async"
import { Data, getStudyData }         from "./lib"
import Breadcrumbs                    from "../generic/Breadcrumbs"
import PageHeader                     from "../generic/PageHeader"
import Loader                         from "../generic/Loader"
import { AlertError }                 from "../generic/Alert"
import Terminology                    from "../../Terminology"
import aggregator                     from "../../Aggregator"
import { humanizeColumnName }         from "../../utils"


async function loadData() {
    return Promise.all([
        aggregator.getAllStudyPeriods(),
        aggregator.getPackages()
    ])
}


export default function ListStudies() {
    const [data   , setData   ] = useState<Data[]>([])
    const [loading, setLoading] = useState(true)
    const [error  , setError  ] = useState<Error | string | null>(null)

    const load = useCallback(() => {
        setLoading(true)
        setError(null)

        loadData()
            .then(([periods, packages]) => getStudyData(periods, packages))
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => load(), [load])

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>List {Terminology.study.namePlural}</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home"    , href: "/" },
                { name: Terminology.study.namePlural, href: "/studies" }
            ]} />
            <div className="row">
                <div className="col">
                    <PageHeader
                    title={Terminology.study.namePlural}
                    icon={Terminology.study.icon}
                    description={`List all available ${Terminology.study.namePlural}`} />
                </div>
                <div className="col col-0 middle">
                    <Link to="./new" className="btn btn-virtual">
                        <b className="color-green">
                            <i className="fa-solid fa-circle-plus" /> Create Study
                        </b>
                    </Link>
                </div>
            </div>
            <hr className="mb-0"/>
            { loading ?
                <div><br /><Loader /></div> :
                error ?
                    <AlertError>{ error + "" }</AlertError> :
                    <table className="table table-border-x table-hover">
                        <thead>
                            <tr>
                                <th style={{ width: "15%" }}>Study</th>
                                <th>Version</th>
                                <th className="right">Sites</th>
                                <th className="right">Last Data Update</th>
                                <th className="right">Packages</th>
                                <th className="right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                        { data.length > 0 ?
                            data.map((row, i) => (
                                <tr key={i} style={
                                    {}//row.type === "study" ? { background: "#8881" } : undefined
                                }>
                                    <td className="nowrap">
                                        { !!row.study && <b>
                                            <i className="material-symbols-outlined icon color-brand-2">
                                                { Terminology.study.icon }
                                            </i> <Link to={`./${row.study}`} className="link">{ humanizeColumnName(row.study) }</Link>
                                        </b> }
                                    </td>
                                    <td>{row.version}</td>
                                    <td className="right color-muted">{row.site}</td>
                                    <td className="right color-muted">
                                        <span data-tooltip="The last time data was inserted into this study version by any of the site participants">{row.updated.toDateString()}</span>
                                    </td>
                                    <td className="right color-muted">{row.packages}</td>
                                    <td className="right color-muted">{ Number(row.total).toLocaleString() }</td>
                                </tr>
                            )) :
                            <tr>
                                <td colSpan={6} className="center">No Data</td>
                            </tr>
                        }
                        </tbody>
                    </table>
            }
        </div>
    )
}
