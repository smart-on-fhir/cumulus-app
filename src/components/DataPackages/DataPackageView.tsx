import { useEffect, useState }     from "react"
import { useParams, Link, useSearchParams } from "react-router-dom"
import { operators }               from "../Dashboard/config"
import Grid                        from "../generic/Grid"
import Prefetch                    from "../generic/Prefetch"
import ColumnsTable                from "../Subscriptions/ColumnsTable"
import SubscriptionLink            from "../Subscriptions/SubscriptionLink"
import Loader                      from "../generic/Loader"
import { AlertError }              from "../generic/Alert"
import PageHeader                  from "../generic/PageHeader"
import Breadcrumbs                 from "../generic/Breadcrumbs"
import IconItem                    from "../generic/IconItem"
import MetaDataList                from "../generic/MetaDataList"
import { PackageStratifiedTemplates, PackageTemplates } from "../TemplateManager"
import { FlatPackageDataViewer }   from "../Subscriptions/DataViewer"
import ViewsBrowser                from "../Views/ViewsBrowser"
import aggregator, { DataPackage } from "../../Aggregator"
import Terminology                 from "../../Terminology"
import { app }                     from "../../types"
import { useAuth }                 from "../../auth"
import { escapeForFileName, humanizeColumnName } from "../../utils"


function Preload() {
    const { id } = useParams()

    const [pkg    , setPkg    ] = useState<any>()
    const [loading, setLoading] = useState(true)
    const [error  , setError  ] = useState<Error | string | null>(null)

    useEffect(() => {
        // setLoading(true)
        aggregator.getPackage(id!)
            .then(pkg => setPkg(pkg))
            .catch(setError)
            .finally(() => setLoading(false));
    }, [id])

    if (loading) {
        return <Loader msg="Loading..." />
    }

    if (error) {
        return <AlertError>{ error + "" }</AlertError>
    }

    return <DataPackageView pkg={pkg} />
}

export default function DataPackageView({ pkg }: { pkg?: DataPackage }) {

    const { user } = useAuth()
    const [query, setQuery] = useSearchParams()

    const filter = query.get("filter") || ""
    const filters = filter ? filter.split(",") : []

    if (!pkg) {
        return <Preload />
    }

    const cols = Object.values(pkg.columns);

    const canCreateGraphs = user!.permissions.includes("Graphs.create") && pkg.type !== "flat"

    const humanizedPkgName = humanizeColumnName(pkg.name)

    return (
        <div>
            <title>{humanizedPkgName}</title>
            <Breadcrumbs historic links={[
                { name: "Home"    , href: "/" },
                { name: Terminology.dataPackage.namePlural, href: "/packages" },
                { name: humanizedPkgName, href: "/packages/" + pkg.id },
            ]} />
            <PageHeader
                title={ <>{ humanizedPkgName }<span className="color-muted fw-400"> / { pkg.version }{ pkg.site && " / " + humanizeColumnName(pkg.site) }</span></> }
                icon={pkg.type === "flat" ? "table" : "deployed_code" }
                description="Description not available"
            />

            { filters.map((f, i) => {
                const [left, operator, right] = f.split(":")
                return (
                    <div className="form-control color-muted row wrap middle" style={{ padding: "0.5ex 1ex", gap: "0.5ch", display: "inline-flex", width: "auto", margin: "0.25rem" }} key={i}>
                        <b className="col-0 pr-05 color-brand-2">Filter:</b>
                        <div className="col-0 nowrap"><span className="color-blue-dark">{humanizeColumnName(left)}</span></div>
                        <div className="col-0">→</div>
                        <div className="col-0 nowrap"><span className="color-blue-dark">{operators.find(op => op.id === operator).label}</span></div>
                        <div className="col-0">→</div>
                        <div className="col-0 nowrap"><span className="color-blue-dark">{right}</span></div>
                        <div className="col" />
                        <div className="col-0 link color-brand-2 nowrap pl-05" title="Remove filter" onMouseDown={() => {
                            const next = filters.filter((_, y) => y !== i).filter(Boolean).join(",")
                            if (next) {
                                query.set("filter", next)
                            } else {
                                query.delete("filter")
                            }
                            setQuery(query)
                        }}>
                            <i className="fa-solid fa-circle-xmark pointer"/>
                        </div>
                    </div>
                )
            }) }

            <div className="row gap-2 wrap">
                <div className="col col-8 responsive">
                    { pkg.type === "flat" && <div className="mt-2"><FlatPackageDataViewer pkg={pkg} /></div> }
                    { pkg.type !== "flat" && <>
                        <h5 className="mt-2">Graphs</h5>
                        <hr/>

                        { filter ?
                            <div className="view-browser view-browser-grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(13rem, 1fr))` }}>
                                <PackageTemplates pkg={pkg} key={pkg.id + ":" + filter} filter={filter} />
                                <PackageStratifiedTemplates pkg={pkg} key={pkg.id + "-stratified:" + filter} filter={filter} />
                            </div> :
                            <ViewsBrowser key={ pkg.id + ":" + filter } pkgId={ pkg.id } minColWidth="13rem"
                                header={ <PackageTemplates pkg={pkg} key={pkg.id} /> }
                                footer={ <PackageStratifiedTemplates pkg={pkg} key={pkg.id + "-stratified"} /> }
                            />
                        }
                    </> }
                    <h5 className="mt-2">Columns</h5>
                    <hr className="mb-1" />
                    <ColumnsTable cols={cols} />
                    <h5 className="mt-2">{Terminology.subscription.namePlural}</h5>
                    <hr className="mb-1" />
                    <PackageSubscriptionsList pkg={pkg} />
                </div>
                <div className="col" style={{ wordBreak: "break-all", minWidth: "16rem", maxWidth: "26rem" }}>
                    <div style={{ position: "sticky", top: "4rem" }}>
                        <h5 className="mt-2">Metadata</h5>
                        <hr className="mb-1" />
                        <MetaDataList items={[
                            {
                                icon : Terminology.dataPackage.icon,
                                label: Terminology.dataPackage.nameSingular + " Name",
                                value: pkg.name
                            },
                            {
                                icon : Terminology.dataPackage.icon,
                                label: Terminology.dataPackage.nameSingular + " ID",
                                value: pkg.id
                            },
                            {
                                icon : "event_available",
                                label: "Last Data Update",
                                value: new Date(pkg.last_data_update).toLocaleString()
                            },
                            {
                                icon : "calculate",
                                label: "Total",
                                value: Number(pkg.total).toLocaleString()
                            },
                            {
                                icon : Terminology.study.icon,
                                label: Terminology.study.nameSingular,
                                value: <>
                                    <Link to={`/studies/${pkg.study}`} className="link">
                                        { humanizeColumnName(pkg.study) }
                                    </Link>
                                    <span className="color-muted"> / </span>
                                    <Link to={`/studies/${pkg.study}/${pkg.version}`} className="link">
                                        { pkg.version }
                                    </Link>
                                </>
                            },
                            pkg.site && {
                                icon : Terminology.site.icon,
                                label: Terminology.site.nameSingular,
                                value: <Link className="link" to={`/sites/${pkg.site}`}>{ humanizeColumnName(pkg.site) }</Link>
                            },
                            // {
                            //     label: Terminology.dataPackage.nameSingular + " Type",
                            //     value: pkg.type || "cube"
                            // },
                            // {
                            //     label: "S3 Path",
                            //     value: pkg.s3_path || ""
                            // },
                        ]} />
                       

                        <h5 className="mt-2">Actions</h5>
                        <hr className="mb-1"/>

                        {/* Add Graph -------------------------------------- */}
                        { canCreateGraphs && <IconItem icon="add_photo_alternate" className="mb-1">
                            <Link className="link" to={`/requests/${pkg.id}/create-view`} title={`Click here to create new view from the data provided from this ${Terminology.dataPackage.nameSingular.toLowerCase()}`}>
                                Add Graph
                            </Link>
                            <div className="color-muted small">Create new Graph from the data in this package</div>
                        </IconItem> }

                        {/* Export Data ---------------------------------------- */}
                        <IconItem icon="download" className="mb-1">
                            <a aria-disabled={!pkg.s3_path} download={escapeForFileName(pkg.name) + ".csv"} className="link" href={`${REACT_APP_BACKEND_HOST}/api/aggregator/from-parquet/?s3_path=${encodeURIComponent(pkg.s3_path!)}&type=csv`}>
                                Export Data
                            </a>
                            <div className="color-muted small">Download the package data as CSV</div>
                        </IconItem>

                        {/* Create Subscription -------------------------------- */}
                        <IconItem icon="add_circle" className="mb-1">
                            <Link className="link" to={`/requests/new?packageId=${encodeURIComponent(pkg.id)}`} state={{ dataPackage: pkg }}>
                                Create {Terminology.subscription.nameSingular}
                            </Link>
                            <div className="color-muted small">Create a copy of this package to take advantage of additional features available in the dashboard</div>
                        </IconItem>

                        {/* Request Line-level Data --------------------------- */}
                        <IconItem icon="badge" className="mb-1" aria-disabled>
                            <Link className="link" to="">
                                Request Line-level Data
                            </Link>
                            <div className="color-muted small">Not implemented yet</div>
                        </IconItem>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PackageSubscriptionsList({ pkg }: { pkg: DataPackage }) {
    return (
        <Prefetch path={`/api/requests?where=dataURL:startsWith:${pkg.study}__${pkg.name}`}>
            { (data: app.Subscription[]) => {
                if (!data.length) {
                    return <div className="color-muted mt-05">No {Terminology.subscription.namePlural} have been created from this package.</div>
                }
                return (
                    <Grid gap="0 1rem" cols="18em" className="link-list mt-05">
                        { data.map((s, i) => (
                            <SubscriptionLink key={i} request={s} href={"/requests/" + s.id}/>
                        ))}
                    </Grid>
                )
            }}
        </Prefetch>
    )
}
