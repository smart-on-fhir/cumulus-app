import { ReactNode, useCallback, useState }  from "react"
import { Navigate, useParams }    from "react-router-dom"
import { Link }                   from "react-router-dom"
import DataViewer                 from "./DataViewer"
import ColumnsTable               from "./ColumnsTable"
import DataPackageViewer          from "./DataPackageViewer"
import PackageVersionCheck        from "./PackageVersionCheck"
import IconItem                   from "../generic/IconItem"
import { Format }                 from "../Format"
import Tag                        from "../Tags/Tag"
import { StratifiedTemplates, Templates } from "../TemplateManager"
import ViewsBrowser               from "../Views/ViewsBrowser"
import Breadcrumbs                from "../generic/Breadcrumbs"
import Loader                     from "../generic/Loader"
import PageHeader                 from "../generic/PageHeader"
import { AlertError }             from "../generic/Alert"
import MetaDataList               from "../generic/MetaDataList"
import { useAuth }                from "../../auth"
import { deleteOne, request }     from "../../backend"
import { useBackend }             from "../../hooks"
import { app }                    from "../../types"
import Terminology                from "../../Terminology"


export default function SubscriptionView({ id }: { id?: number }): ReactNode
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

    const isPending       = !model.dataURL && !model.completed
    const isFlatData      = model.metadata?.type === "flat"
    const canHaveCharts   = !isFlatData && (model.dataURL || model.completed)
    const canCreateGraphs = !isPending && user!.permissions.includes("Graphs.create") //&& !model.dataURL
    const canEdit         = user!.permissions.includes("Subscriptions.update")
    const canDelete       = user!.permissions.includes("Subscriptions.delete")// && !model.dataURL
    const canExport       = user!.permissions.includes("Subscriptions.export") && !model.dataURL
    const canImport       = canEdit && !model.dataURL

    return (
        <div>
            <title>{Terminology.subscription.nameSingular}: {model.name}</title>
            <Breadcrumbs historic links={[
                { name: "Home", href: "/" },
                { name: Terminology.subscription.namePlural, href: "/requests" },
                { name: model.name, href: "/requests/" + model.id }
            ]}/>
            <PageHeader
                title={ model.name }
                icon={ model.metadata?.type === "flat" ? "table" : "deployed_code" }
                description={ model.description }
            />

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
                        <ViewsBrowser requestId={ model.id } minColWidth="13rem"
                            footer={
                                <>
                                    <Templates subscription={model} />
                                    <StratifiedTemplates subscription={model} />
                                </>
                            }
                        />
                    </> }

                    {/* Columns -------------------------------------------- */}
                    { model.metadata?.cols && <>
                        <h5 className="mt-2">Data Elements</h5>
                        <hr className="mb-0"/>
                        <ColumnsTable cols={model.metadata?.cols} />
                    </> }
                </div>

                <div className="col" style={{ wordBreak: "break-all", minWidth: "16rem", maxWidth: "26rem" }}>
                    <div style={{ position: "sticky", top: "3em" }}>
                        <h5 className="mt-2">Metadata</h5>
                        <hr className="mb-1"/>

                        <MetaDataList items={[
                            {
                                icon : Terminology.subscriptionGroup.icon,
                                label: Terminology.subscriptionGroup.nameSingular,
                                value: model.group ?
                                    <Link to={`/groups/${model.group.id}`} className="link" title={model.group.description}>{ model.group.name }</Link> :
                                    "GENERAL"
                            },
                            model.Tags && {
                                icon : Terminology.tag.icon,
                                label: Terminology.tag.namePlural,
                                value: model.Tags.length ?
                                    model.Tags.map((t, i) => <Tag tag={t} key={i} />) :
                                    "No tag assigned"
                            },
                            !model.dataURL &&  {
                                icon : "event_available",
                                label: "Last Data Update",
                                value: model.completed ?
                                    <Format value={ model.completed } format="date-time" /> :
                                    "Pending"
                            },
                            {
                                icon : "event_available",
                                label: "Created",
                                value: <Format value={ model.createdAt } format="date-time" />
                            },
                            {
                                icon : "event_available",
                                label: "Updated",
                                value: <Format value={ model.updatedAt } format="date-time" />
                            },
                            model.dataURL && {
                                icon : Terminology.dataPackage.icon,
                                label: Terminology.dataPackage.nameSingular,
                                value: <Link className="link" to={`/packages/${model.dataURL}`}>{ model.dataURL }</Link>
                            },
                            !model.dataURL && model.metadata?.total && {
                                icon : "calculate",
                                label: "Total Rows",
                                value: Number(model.metadata.total).toLocaleString()
                            }
                        ]} />
                        
                        {/* Data Package Info ------------------------------ */}
                        { model.dataURL && <DataPackageViewer packageId={ model.dataURL } /> }

                        <h5 className="mt-2">Actions</h5>
                        <hr className="mb-1"/>

                        {/* Add Graph -------------------------------------- */}
                        { canCreateGraphs && <IconItem icon="add_photo_alternate" className="mb-1">
                            <Link className="link" to={`/requests/${model.id}/create-view`} title={`Click here to create new view from the data provided from this ${Terminology.subscription.nameSingular.toLowerCase()}`}>
                                Add Graph
                            </Link>
                            <div className="color-muted small">Create new Graph from the data in this {Terminology.subscription.nameSingular}</div>
                        </IconItem> }

                        {/* Edit ------------------------------------------- */}
                        { canEdit && <IconItem icon="tune" className="mb-1">
                            <Link className="link" to={`/requests/${model.id}/edit`}>
                                Edit
                            </Link>
                            <div className="color-muted small">Modify {Terminology.subscription.nameSingular} properties</div>
                        </IconItem> }

                        {/* Export Data ------------------------------------ */}
                        { canExport && <IconItem icon="download" className="mb-1">
                            <a aria-disabled={!model.metadata} className="link" href={`${REACT_APP_BACKEND_HOST}/api/requests/${id}/data?format=csv`}>
                                Export Data
                            </a>
                            <div className="color-muted small">Download the {Terminology.subscription.nameSingular} data as CSV</div>
                        </IconItem> }

                        {/* Import Data ------------------------------------ */}
                        { canImport && <IconItem icon="upload" className="mb-1">
                            <Link className="link" to={`/requests/${model.id}/import`}>
                                Import Data
                            </Link>
                            <div className="color-muted small">Upload CSV data into this {Terminology.subscription.nameSingular}</div>
                        </IconItem> }

                        {/* Delete ----------------------------------------- */}
                        { canDelete && <IconItem icon="delete" className="mb-1">
                            <span className="link" onClick={destroy}>
                                Delete
                            </span>
                            <div className="color-muted small">Delete this {Terminology.subscription.nameSingular}</div>
                        </IconItem> }
                    </div>
                </div>
            </div>
        </div>
    )
}
