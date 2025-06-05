import { useCallback, useEffect, useState } from "react"
import { useParams }                        from "react-router-dom"
import { Data, getStudyData }               from "./lib"
import PageHeader                           from "../generic/PageHeader"
import Breadcrumbs                          from "../generic/Breadcrumbs"
import Loader                               from "../generic/Loader"
import { AlertError }                       from "../generic/Alert"
import MetaDataList                         from "../generic/MetaDataList"
import Terminology                          from "../../Terminology"
import aggregator                           from "../../Aggregator"
import { classList, humanizeColumnName }    from "../../utils"

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
    
    const study = data[0]


    if (!study) {
        return <AlertError>Study not found</AlertError>
    }

    const latestVersion = data.sort((a, b) => String(b.versionString || "0").localeCompare(String(a.versionString || "0")))[0].versionString

    return (
        <div className="container">
            <title>List {Terminology.study.namePlural}</title>
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
                                data
                                    // .slice(1)
                                    .map((row, i) => (
                                    <tr key={i}
                                    className={ classList({
                                        "color-muted": row.type === "study",
                                        "bg-brand-2" : latestVersion === row.versionString,
                                        "bg-grey"    : row.type === "study"
                                    }) }>
                                        <td>{row.version} {latestVersion === row.versionString && <span className="badge bg-brand-2">Current</span>}</td>
                                        <td className="right">{row.site}</td>
                                        <td className="right">
                                            <span data-tooltip="The last time data was inserted into this study version by any of the site participants">{row.updated.toDateString()}</span>
                                        </td>
                                        <td className="right">{row.packages}</td>
                                        <td className="right">{ Number(row.total).toLocaleString() }</td>
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
                    <MetaDataList items={[
                        {
                            icon : Terminology.study.icon,
                            label: Terminology.study.nameSingular + " ID",
                            value: study.study
                        },
                        {
                            icon : Terminology.dataPackage.icon,
                            label: Terminology.dataPackage.namePlural,
                            value: study.packages
                        },
                        {
                            icon : "calculate",
                            label: "Total",
                            value: Number(study.total).toLocaleString()
                        },
                        {
                            icon : "event_available",
                            label: "Last Data Update",
                            value: study.updated.toDateString()
                        }
                    ]} />
                </div>
            </div>
        </div>
    )
}
