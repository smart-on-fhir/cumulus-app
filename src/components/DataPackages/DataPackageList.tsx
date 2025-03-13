import { useCallback, useEffect, useState } from "react"
import { Link }                             from "react-router-dom"
import { HelmetProvider, Helmet }           from "react-helmet-async"
import Breadcrumbs                          from "../generic/Breadcrumbs"
import PageHeader                           from "../generic/PageHeader"
import Loader                               from "../generic/Loader"
import { AlertError }                       from "../generic/Alert"
import StaticGrid                           from "../generic/StaticGrid"
import Terminology                          from "../../Terminology"
import aggregator, { DataPackage }          from "../../Aggregator"
import { highlight, humanizeColumnName }    from "../../utils"


export default function DataPackageList() {
    const [data   , setData   ] = useState<DataPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [error  , setError  ] = useState<Error | string | null>(null)

    const load = useCallback(() => {
        setLoading(true)
        setError(null)

        aggregator.getPackages()
            .then(packages => setData(packages))
            .catch(setError)
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => load(), [load])

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>List {Terminology.dataPackage.namePlural}</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home"    , href: "/" },
                { name: Terminology.dataPackage.namePlural }
            ]} />
            <PageHeader
            title={Terminology.dataPackage.namePlural}
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
                                            </i><Link to={`./${row.id}`} className="link">{
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
                                },
                                {
                                    name      : "last_data_update",
                                    type      : "string",
                                    label     : "Last Data Update",
                                    searchable: true,
                                    value     : row => new Date(row.last_data_update).toLocaleDateString(),
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
                        />
                    </div>
            }
        </div>
    )
}
