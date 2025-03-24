import { useCallback, useEffect, useState } from "react"
import { useParams }                        from "react-router"
import { HelmetProvider, Helmet }           from "react-helmet-async"
import { Data, getStudyData }               from "./lib"
import PageHeader                           from "../generic/PageHeader"
import Breadcrumbs                          from "../generic/Breadcrumbs"
import Loader                               from "../generic/Loader"
import { AlertError }                       from "../generic/Alert"
import Terminology                          from "../../Terminology"
import aggregator                           from "../../Aggregator"
import { humanizeColumnName }               from "../../utils"

export default function ViewStudy({ studyId }: { studyId?: string }) {

    const { id: idParam } = useParams()

    const id = String(studyId || idParam || "")

    const [data   , setData   ] = useState<Data[]>([])
    const [loading, setLoading] = useState(true)
    const [error  , setError  ] = useState<Error | string | null>(null)

    const load = useCallback(() => {
        setLoading(true)
        setError(null)

        Promise.all([
            aggregator.getStudyPeriods(id),
            aggregator.getPackages()
        ])
            .then(([periods, packages]) => getStudyData(periods, packages))
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false))
    }, [id])

    useEffect(() => load(), [load])

    if (loading) {
        return <div><br /><Loader /></div>
    }

    if (error) {
        return <AlertError>{ error + "" }</AlertError>
    }

    console.log(data)
    
    const study = data[0]


    if (!study) {
        return <AlertError>Study not found</AlertError>
    }

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>List {Terminology.study.namePlural}</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home"    , href: "/" },
                { name: Terminology.study.namePlural, href: "/studies" },
                { name: humanizeColumnName(study.study), href: "/studies/" + study.study },
            ]} />
            <PageHeader
                title={humanizeColumnName(study.study)}
                icon={Terminology.study.icon}
                description={`Description not available`} />

            <div className="row gap-2 wrap">
                <div className="col col-8 responsive">
                    <h5 className="mt-2">Versions</h5>
                    <hr className="mb-1" />
                    <table className="table table-border-x table-hover">
                        <thead>
                            <tr>
                                <th>Version</th>
                                <th className="right">Sites</th>
                                <th className="right">Last Data Update</th>
                                <th className="right">Packages</th>
                                <th className="right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            { data.length > 1 ?
                                data.slice(1).map((row, i) => (
                                    <tr key={i} style={row.type === "study" ? { background: "#8881" } : undefined }>
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
                </div>
                <div className="col" style={{ wordBreak: "break-all", minWidth: "15rem" }}>
                    <h5 className="mt-2">Metadata</h5>
                    <hr className="mb-1" />
                    <b>ID</b>
                    <div className="color-muted">{ study.study }</div>
                    <br />
                    <b>Packages</b>
                    <div className="color-muted">{ study.packages }</div>
                    <br />
                    <b>Total</b>
                    <div className="color-muted">{ Number(study.total).toLocaleString() }</div>
                    <br />
                    <b>Last Data Update</b>
                    <div className="color-muted">{ study.updated.toDateString() }</div>
                </div>
            </div>
        </div>
    )
}
