import { useEffect, useState }     from "react"
import { useParams }               from "react-router"
import { HelmetProvider, Helmet }  from "react-helmet-async"
import Link                        from "../Link"
import Grid                        from "../generic/Grid"
import Prefetch                    from "../generic/Prefetch"
import ColumnsTable                from "../Subscriptions/ColumnsTable"
import SubscriptionLink            from "../Subscriptions/SubscriptionLink"
import Loader                      from "../generic/Loader"
import { AlertError }              from "../generic/Alert"
import PageHeader                  from "../generic/PageHeader"
import Breadcrumbs                 from "../generic/Breadcrumbs"
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
        setLoading(true)
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

    const canCreateGraphs = user!.permissions.includes("Graphs.create") //&& !model.dataURL

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>{humanizeColumnName(pkg.name)}</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home"    , href: "/" },
                { name: Terminology.dataPackage.namePlural, href: "/packages" },
                { name: humanizeColumnName(pkg.name) },
            ]} />
            <PageHeader
                title={ <>{ humanizeColumnName(pkg.name) }<span className="color-muted"> / { pkg.version }</span></> }
                icon={pkg.type === "flat" ? "table" : "deployed_code" }
                description="Description not available"
            />
            <div className="row gap-2 wrap">
                <div className="col col-8 responsive">
                    { pkg.type === "flat" && <div className="mt-2"><FlatPackageDataViewer pkg={pkg} /></div> }
                    { pkg.type !== "flat" && <>
                        <h5 className="mt-2">Graphs</h5>
                        <hr/>
                        
                        <ViewsBrowser pkgId={ pkg.id } header={
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
                <div className="col" style={{ wordBreak: "break-all", minWidth: "16rem" }}>
                    <div style={{ position: "sticky", top: "4rem" }}>
                        <h5 className="mt-2">Metadata</h5>
                        <hr className="mb-1" />
                        <div className="mb-1">
                            <b>Package Name</b>
                            <div className="color-muted">{ pkg.name }</div>
                        </div>
                        <div className="mb-1">
                            <b>Package ID</b>
                            <div className="color-muted">{ pkg.id }</div>
                        </div>
                        <div className="mb-1">
                            <b>Last Data Update</b>
                            <div className="color-muted">{ new Date(pkg.last_data_update).toLocaleString() }</div>
                        </div>
                        <div className="mb-1">
                            <b>Total</b>
                            <div className="color-muted">{ Number(pkg.total).toLocaleString() }</div>
                        </div>
                        <div className="mb-1">
                            <b>Study</b>
                            <div>
                                <Link to={`/studies/${pkg.study}`} className="link">
                                    { humanizeColumnName(pkg.study) }
                                </Link>
                                <span className="color-muted"> / </span>
                                <Link to={`/studies/${pkg.study}/${pkg.version}`} className="link">
                                    { pkg.version }
                                </Link>
                            </div>
                        </div>
                        <div className="mb-1">
                            <b>Type</b>
                            <div className="color-muted">{ pkg.type || "cube" }</div>
                        </div>
                        {/* <div className="mb-1">
                            <b>S3 Path</b>
                            <div className="color-muted">{ pkg.s3_path || "" }</div>
                        </div> */}
                       

                        <h5 className="mt-2">Actions</h5>
                        <hr className="mb-1"/>

                        {/* Add Graph -------------------------------------- */}
                        { canCreateGraphs && <div className="mb-1">
                            <Link className="link" to={`/requests/${pkg.id}/create-view`} title={`Click here to create new view from the data provided from this ${Terminology.dataPackage.nameSingular.toLowerCase()}`}>
                                <i className="material-symbols-outlined mr-05 color-brand-2 icon big">add_photo_alternate</i>
                                Add Graph
                            </Link>
                        </div> }

                        {/* Export Data ---------------------------------------- */}
                        { <div className="mb-1">
                            <a aria-disabled={!pkg.s3_path} download={escapeForFileName(pkg.name) + ".csv"} className="link" href={`${process.env.REACT_APP_BACKEND_HOST || ""}/api/aggregator/from-parquet/?s3_path=${encodeURIComponent(pkg.s3_path!)}&type=csv`}>
                                <i className="material-symbols-outlined mr-05 color-brand-2 icon big">download</i>
                                Export Data
                            </a>
                        </div> }

                        {/* Create Subscription -------------------------------- */}
                        <div className="mb-1">
                            <Link className="link" to={`/requests/new?packageId=${encodeURIComponent(pkg.id)}`} state={{ dataPackage: pkg }}>
                                <i className="material-symbols-outlined mr-05 color-brand-2 icon big">add_circle</i>
                                Create {Terminology.subscription.nameSingular}
                            </Link>
                        </div>

                        {/* Request Line-level Data --------------------------- */}
                        <div className="mb-1">
                            <Link className="link" to="" aria-disabled>
                                <i className="material-symbols-outlined mr-05 color-brand-2 icon big">badge</i>
                                Request Line-level Data
                            </Link>
                        </div>
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
