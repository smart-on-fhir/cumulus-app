import { useCallback, useEffect, useState } from "react"
import { Link, useSearchParams }            from "react-router-dom"
import Breadcrumbs                          from "../generic/Breadcrumbs"
import PageHeader                           from "../generic/PageHeader"
import Loader                               from "../generic/Loader"
import { AlertError }                       from "../generic/Alert"
import StaticGrid                           from "../generic/StaticGrid"
import Toggle                               from "../generic/Toggle"
import Terminology                          from "../../Terminology"
import aggregator, { DataPackage }          from "../../Aggregator"
import { highlight, humanizeColumnName }    from "../../utils"


export default function DataPackageList() {
    const [data   , setData   ] = useState<DataPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [error  , setError  ] = useState<Error | string | null>(null)
    const [URLSearchParams, SetURLSearchParams] = useSearchParams()

    const showAll = URLSearchParams.get("showAll") === "true"

    const load = useCallback(() => {
        setLoading(true)
        setError(null)

        aggregator.getPackages()
            .then(packages => setData(packages))
            .catch(setError)
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => load(), [load])

    const studyVersions: Record<string, string> = {}
    data.forEach(row => {
        const { study, version } = row
        if (!studyVersions[study] || +studyVersions[study] < +version) {
            studyVersions[study] = version
        }
    })

    return (
        <div className="container">
            <title>List {Terminology.dataPackage.namePlural}</title>
            <Breadcrumbs links={[
                { name: "Home"    , href: "/" },
                { name: Terminology.dataPackage.namePlural, href: "/packages" }
            ]} />
            <PageHeader
            title={
                <div className="row">
                    <div className="col">
                        { Terminology.dataPackage.namePlural }
                    </div>
                    <div className="col col-0 right middle">
                        <div style={{ fontSize: "1rem" }} >
                            <label className="pointer fw-400 pr-05" onClick={() => SetURLSearchParams({ showAll: showAll ? "false" : "true" })}>Show all versions</label>
                            <Toggle checked={showAll} onChange={ () => SetURLSearchParams({ showAll: showAll + "" }) } className="bg-brand-2" />
                        </div>
                    </div>
                </div>
            }
            icon={Terminology.dataPackage.icon}
            description={`List all available ${Terminology.dataPackage.namePlural}`} />
            { loading ?
                <div><br /><Loader /></div> :
                error ?
                    <AlertError>{ error + "" }</AlertError> :
                    <div className="simple-grid">
                        <StaticGrid columns={[
                                {
                                    name      : "name",
                                    type      : "string",
                                    label     : "Package",
                                    searchable: true,
                                    value     : row => humanizeColumnName(row.name),
                                    render    : (row, col, search) => (
                                        <>
                                            <i className="material-symbols-outlined icon mr-05 ml-1 color-brand-2">
                                                { row.type === "flat" ? "table" : "deployed_code" }
                                            </i><Link to={`/packages/${row.id}`} className="link">{
                                                highlight(humanizeColumnName(row.name), search)
                                            }</Link>
                                        </>
                                    )
                                },
                                {
                                    name      : "study",
                                    type      : "string",
                                    label     : "Study",
                                    searchable: true,
                                },
                                {
                                    name      : "version",
                                    type      : "string",
                                    label     : "Version",
                                    value     : row => row.version + "",
                                    searchable: true,
                                    headerStyle: { textAlign: "center" },
                                    style      : { textAlign: "center" },
                                },
                                {
                                    name      : "last_data_update",
                                    type      : "string",
                                    label     : "Last Data Update",
                                    searchable: true,
                                    value     : row => new Date(row.last_data_update).toLocaleDateString(),
                                    headerStyle: { textAlign: "center" },
                                    style      : { textAlign: "center" },
                                },
                                {
                                    name       : "total",
                                    type       : "number",
                                    label      : "Total",
                                    value      : row => row.total.toLocaleString(),
                                    searchable : true,
                                    style      : { textAlign: "right" },
                                    headerStyle: { textAlign: "right" }
                                }
                            ]}
                            rows={data}
                            maxHeight={"calc(100vh - 20.25rem)"}
                            onSelectionChange={(sel) => console.log(sel)}
                            groupBy="study"
                            groupLabel={study => <>
                                <i className="material-symbols-outlined icon mr-05 color-brand-2">{Terminology.study.icon}</i>
                                {humanizeColumnName(study)}
                            </>}
                            filter={row => {
                                return showAll || row.version === studyVersions[row.study]
                            }}
                        />
                    </div>
            }
        </div>
    )
}
