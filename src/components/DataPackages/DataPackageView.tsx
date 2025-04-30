import { useEffect, useState }     from "react"
import { useParams, Link }         from "react-router-dom"
import Grid                        from "../generic/Grid"
import Prefetch                    from "../generic/Prefetch"
import ColumnsTable                from "../Subscriptions/ColumnsTable"
import SubscriptionLink            from "../Subscriptions/SubscriptionLink"
import Loader                      from "../generic/Loader"
import { AlertError }              from "../generic/Alert"
import PageHeader                  from "../generic/PageHeader"
import Breadcrumbs                 from "../generic/Breadcrumbs"
import IconItem                    from "../generic/IconItem"
import { PackageTemplates }        from "../TemplateManager"
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

    if (!pkg) {
        return <Preload />
    }

    const cols = Object.keys(pkg.columns).map(name => {
        let type = String(pkg.columns[name])
            .replace("year" , "date:YYYY")
            .replace("month", "date:YYYY-MM")
            .replace("week" , "date:YYYY-MM-DD")
            .replace("day"  , "date:YYYY-MM-DD") as app.supportedDataType;
        return {
            name,
            label      : humanizeColumnName(name),
            description: humanizeColumnName(name),
            dataType   : type
        }
    });

    const canCreateGraphs = user!.permissions.includes("Graphs.create") && pkg.type !== "flat"

    return (
        <div>
            <title>{humanizeColumnName(pkg.name)}</title>
            <Breadcrumbs historic links={[
                { name: "Home"    , href: "/" },
                { name: Terminology.dataPackage.namePlural, href: "/packages" },
                { name: humanizeColumnName(pkg.name), href: "/packages/" + pkg.id },
            ]} />
            <PageHeader
                title={ <>{ humanizeColumnName(pkg.name) }<span className="color-muted fw-400"> / { pkg.version }{ pkg.site && " / " + humanizeColumnName(pkg.site) }</span></> }
                icon={pkg.type === "flat" ? "table" : "deployed_code" }
                description="Description not available"
            />
            <div className="row gap-2 wrap">
                <div className="col col-8 responsive">
                    { pkg.type === "flat" && <div className="mt-2"><FlatPackageDataViewer pkg={pkg} /></div> }
                    { pkg.type !== "flat" && <>
                        <h5 className="mt-2">Graphs</h5>
                        <hr/>
                        
                        <ViewsBrowser key={ pkg.id } pkgId={ pkg.id } minColWidth="13rem" header={
                            <PackageTemplates pkg={pkg} key={pkg.id} />
                        }  />
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
                        <IconItem icon={Terminology.dataPackage.icon} className="mb-1">
                            <b>{Terminology.dataPackage.nameSingular} Name</b>
                            <div className="color-muted">{ pkg.name }</div>
                        </IconItem>
                        <IconItem icon={Terminology.dataPackage.icon} className="mb-1">
                            <b>{Terminology.dataPackage.nameSingular} ID</b>
                            <div className="color-muted">{ pkg.id }</div>
                        </IconItem>
                        <IconItem icon="event_available" className="mb-1">
                            <b>Last Data Update</b>
                            <div className="color-muted">{ new Date(pkg.last_data_update).toLocaleString() }</div>
                        </IconItem>
                        <IconItem icon="calculate" className="mb-1">
                            <b>Total</b>
                            <div className="color-muted">{ Number(pkg.total).toLocaleString() }</div>
                        </IconItem>
                        <IconItem icon={Terminology.study.icon} className="mb-1">
                            <b>{Terminology.study.nameSingular}</b>
                            <div>
                                <Link to={`/studies/${pkg.study}`} className="link">
                                    { humanizeColumnName(pkg.study) }
                                </Link>
                                <span className="color-muted"> / </span>
                                <Link to={`/studies/${pkg.study}/${pkg.version}`} className="link">
                                    { pkg.version }
                                </Link>
                            </div>
                        </IconItem>
                        { pkg.site && <IconItem icon={Terminology.site.icon} className="mb-1">
                            <b>{Terminology.site.nameSingular}</b>
                            <Link className="link" to={`/sites/${pkg.site}`}>{ humanizeColumnName(pkg.site) }</Link>
                        </IconItem> }
                        {/* <IconItem icon="info" className="mb-1">
                            <b>{Terminology.dataPackage.nameSingular} Type</b>
                            <div className="color-muted">{ pkg.type || "cube" }</div>
                        </IconItem> */}
                        {/* <IconItem icon="info" className="mb-1">
                            <b>S3 Path</b>
                            <div className="color-muted">{ pkg.s3_path || "" }</div>
                        </IconItem> */}
                       

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
