import { useCallback, useEffect, useState } from "react"
import { Link, useSearchParams }            from "react-router-dom"
import { Data, getStudyData }               from "./lib"
import Breadcrumbs                          from "../generic/Breadcrumbs"
import PageHeader                           from "../generic/PageHeader"
import Loader                               from "../generic/Loader"
import { AlertError }                       from "../generic/Alert"
import Toggle                               from "../generic/Toggle"
import Terminology                          from "../../Terminology"
import aggregator                           from "../../Aggregator"
import { humanizeColumnName }               from "../../utils"


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
    const [URLSearchParams, SetURLSearchParams] = useSearchParams()

    const showAll = URLSearchParams.get("showAll") === "true"

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
            <title>List {Terminology.study.namePlural}</title>
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
            <div className="mb-1 right middle">
                <label className="pointer fw-400 pr-05" onClick={() => SetURLSearchParams({ showAll: showAll ? "false" : "true" })}>Show all versions</label>
                <Toggle checked={showAll} onChange={ () => SetURLSearchParams({ showAll: showAll + "" }) } className="bg-brand-2" />
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
                                <th className="center">{ showAll ? "Version" : "Current Version" }</th>
                                <th className="right">Sites</th>
                                <th className="right">Last Data Update</th>
                                <th className="right">Packages</th>
                                <th className="right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                        { data.length > 0 ?
                            data
                            .filter(row => showAll || row.type === "study")
                            .map((row, i) => {
                                const latestVersion = row.versions?.sort((a, b) => b.localeCompare(a))[0];
                                return (
                                    <tr key={i}>
                                        <td className="nowrap">
                                            { !!row.study && <b>
                                                <i className="material-symbols-outlined icon color-brand-2">
                                                    { Terminology.study.icon }
                                                </i> <Link to={`./${row.study}${ showAll ? "" : "/" + latestVersion }`} className="link">{ humanizeColumnName(row.study) }</Link>
                                            </b> }
                                        </td>
                                        <td className="center">{ showAll ? row.version : latestVersion }</td>
                                        <td className="right">{row.site}</td>
                                        <td className="right">
                                            <span data-tooltip="The last time data was inserted into this study version by any of the site participants">{row.updated.toDateString()}</span>
                                        </td>
                                        <td className="right">{row.packages}</td>
                                        <td className="right">{ Number(row.total).toLocaleString() }</td>
                                    </tr>
                                )
                            }) :
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
