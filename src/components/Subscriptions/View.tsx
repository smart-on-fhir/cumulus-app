import { useCallback, useState }  from "react"
import { Navigate, useParams }    from "react-router"
import { Link }                   from "react-router-dom"
import { HelmetProvider, Helmet } from "react-helmet-async"
import DataViewer                 from "./DataViewer"
import ColumnsTable               from "./ColumnsTable"
import DataPackageViewer          from "./DataPackageViewer"
import Markdown                   from "../generic/Markdown"
import Breadcrumbs                from "../generic/Breadcrumbs"
import Loader                     from "../generic/Loader"
import { AlertError }             from "../generic/Alert"
import { Format }                 from "../Format"
import Tag                        from "../Tags/Tag"
import ViewsBrowser               from "../Views/ViewsBrowser"
import { useAuth }                from "../../auth"
import { deleteOne, request }     from "../../backend"
import { useBackend }             from "../../hooks"
import { app }                    from "../../types"
import PackageVersionCheck        from "./PackageVersionCheck"
import { Templates }              from "../TemplateManager"
import Terminology                from "../../Terminology"


export default function SubscriptionView({ id }: { id?: number }): JSX.Element
{
    const params   = useParams()
    const { user } = useAuth()
    const [ deleted, setDeleted ] = useState(false)

    id = id || +params.id!

    const { loading, error, result: model } = useBackend<app.Subscription>(
        useCallback(() => request("/api/requests/" + id + "?group=true&graphs=true&tags=true"), [id]),
        true
    )

    const destroy = useCallback(() => {
        if (window.confirm(
            `Deleting this ${Terminology.subscription.nameSingular.toLowerCase()} ` +
            `will also delete all the graphs associated with it! Are you sure?`)) {
            deleteOne("requests", id + "").then(() => setDeleted(true))
        }
    }, [id]);

    if (deleted) {
        return <Navigate to="/requests" />
    }

    if (loading && !model) {
        return <Loader/>
    }

    if (error) {
        return <AlertError>{ error + "" }</AlertError>
    }

    if (!model) {
        return <AlertError>Failed to load {Terminology.subscription.nameSingular}</AlertError>
    }

    const isFlatData      = model.metadata?.type === "flat"
    const canHaveCharts   = !isFlatData && (model.dataURL || model.completed)
    const canCreateGraphs = user!.permissions.includes("Graphs.create") //&& !model.dataURL
    const canEdit         = user!.permissions.includes("Subscriptions.update")
    const canDelete       = user!.permissions.includes("Subscriptions.delete")// && !model.dataURL
    const canExport       = user!.permissions.includes("Subscriptions.export") && !model.dataURL
    const canImport       = canEdit && !model.dataURL
    const isPending       = !model.dataURL && !model.completed

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>{Terminology.subscription.nameSingular}: {model.name}</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs historic links={[
                { name: "Home", href: "/" },
                { name: Terminology.subscription.namePlural, href: "/requests" },
                { name: model.name, href: "/requests/" + model.id }
            ]}/>
            <header className="ml-3">
                <h2>
                    <i className="material-symbols-outlined mr-05" style={{ verticalAlign: "middle", fontSize: "1.4em", marginLeft: "-3rem" }}>
                        { model.metadata?.type === "flat" ? "table" : "deployed_code" }
                    </i>
                    { model.name }
                </h2>
                { model.description && <div>
                    <Markdown>{ model.description || "" }</Markdown>
                    <br/>
                </div> }
            </header>

            { model.dataURL && <PackageVersionCheck pkgId={model.dataURL} /> }

            <div className="row gap-2 wrap">
                <div className="col col-8 responsive">
                    
                    {/* Empty View ----------------------------------------- */}
                    { isPending && <>
                        <h5 className="mt-2">&nbsp;</h5>
                        <hr/>
                        <div className="col middle">
                            <p>This {Terminology.subscription.nameSingular} is currently empty. Please begin by uploading CSV data.</p>
                            <p className="center mt-1">
                                <Link className="btn btn-blue" to={`/requests/${model.id}/import`}>
                                    <b>Upload CSV Data</b>
                                </Link>
                            </p>
                        </div>
                    </> }

                    {/* Flat Chart View ------------------------------------ */}
                    { isFlatData && <div className="mt-2"><DataViewer subscription={model} /></div> }
                    
                    {/* Charts --------------------------------------------- */}
                    { canHaveCharts && (model.completed || model.dataURL) && <>
                        <h5 className="mt-2">Graphs</h5>
                        <hr/>
                        <ViewsBrowser requestId={ model.id } minColWidth="10rem" header={
                            <Templates subscription={model} />
                        }  />
                    </> }

                    {/* Columns -------------------------------------------- */}
                    { model.metadata?.cols && <>
                        <h5 className="mt-2">Data Elements</h5>
                        <hr className="mb-0"/>
                        <ColumnsTable cols={model.metadata?.cols} />
                    </> }
                </div>

                <div className="col" style={{ wordBreak: "break-all", minWidth: "16rem" }}>
                    <div style={{ position: "sticky", top: "3em" }} className="col">
                        <h5 className="mt-2">Metadata</h5>
                        <hr className="mb-1"/>
                        
                        {/* Group ------------------------------------------ */}
                        <div>
                            <b>Group</b>
                            { model.group ?
                                <div>
                                    <Link to={`/groups/${model.group.id}`} className="link" title={model.group.description}>{ model.group.name }</Link>
                                </div> :
                                <div className="color-muted">GENERAL</div>
                            }
                        </div>

                        {/* Tags ------------------------------------------- */}
                        { model.Tags && <div>
                            <br />
                            <b>Tags</b>
                            <div>{
                                model.Tags.length ?
                                    model.Tags.map((t, i) => <Tag tag={t} key={i} />) :
                                    <span className="color-muted">No tag assigned</span>
                            }</div>
                        </div> }

                        {/* Last Data Update (local) ----------------------- */}
                        { !model.dataURL && <div>
                            <br />
                            <b>Last Data Update</b>
                            <div className="color-muted">{
                                model.completed ?
                                <Format value={ model.completed } format="date-time" /> :
                                "Pending"
                            }</div>
                        </div> }

                        {/* Created ---------------------------------------- */}
                        <div>
                            <br />
                            <b>Created</b>
                            <div className="color-muted"><Format value={ model.createdAt } format="date-time" /></div>
                        </div>

                        {/* Updated ---------------------------------------- */}
                        <div>
                            <br />
                            <b>Updated</b>
                            <div className="color-muted"><Format value={ model.updatedAt } format="date-time" /></div>
                        </div>

                        {/* Data Package ----------------------------------- */}
                        { model.dataURL && (
                            <div>
                                <br />
                                <b>Data Package</b>
                                {/* <div className="color-muted">{ model.dataURL }</div> */}
                                <div>
                                    <Link className="link" to={`/packages/${model.dataURL}`}>{ model.dataURL }</Link>
                                </div>
                            </div>
                        )}

                        {/* Total Rows ------------------------------------- */}
                        { !model.dataURL && model.metadata?.total && <div>
                            <br />
                            <b>Total Rows</b>
                            <div className="color-muted">{ Number(model.metadata.total).toLocaleString()}</div>
                        </div>}

                        {/* Data Package Info ------------------------------ */}
                        { model.dataURL && <DataPackageViewer packageId={ model.dataURL } /> }

                        <h5 className="mt-2">Actions</h5>
                        <hr className="mb-1"/>

                        {/* Add Graph -------------------------------------- */}
                        { canCreateGraphs && <p className="mb-05">
                            <Link className="link" to={`/requests/${model.id}/create-view`} title={`Click here to create new view from the data provided from this ${Terminology.subscription.nameSingular.toLowerCase()}`}>
                                <i className="material-symbols-outlined mr-05 color-brand-2 icon big">add_photo_alternate</i>
                                Add Graph
                            </Link>
                        </p> }

                        {/* Edit ------------------------------------------- */}
                        { canEdit && <p className="mb-05">
                            <Link className="link" to={`/requests/${model.id}/edit`}>
                                <i className="material-symbols-outlined mr-05 color-brand-2 icon big">tune</i>
                                Edit
                            </Link>
                        </p> }

                        {/* Export Data ------------------------------------ */}
                        { canExport && <p className="mb-05">
                            <a aria-disabled={!model.metadata} className="link" href={`${process.env.REACT_APP_BACKEND_HOST || ""}/api/requests/${id}/data?format=csv`}>
                                <i className="material-symbols-outlined mr-05 color-brand-2 icon big">download</i>
                                Export Data
                            </a>
                        </p> }

                        {/* Import Data ------------------------------------ */}
                        { canImport && <p className="mb-05">
                            <Link className="link" to={`/requests/${model.id}/import`}>
                                <i className="material-symbols-outlined mr-05 color-brand-2 icon big">upload</i>
                                Import Data
                            </Link>
                        </p> }

                        {/* Delete ----------------------------------------- */}
                        { canDelete && <p className="mb-05">
                            <span className="link" onClick={destroy}>
                                <i className="material-symbols-outlined mr-05 color-brand-2 icon big">delete</i>
                                Delete
                            </span>
                        </p> }
                    </div>
                </div>
            </div>
        </div>
    )
}
