import { useCallback }            from "react"
import { useParams }              from "react-router"
import { Link }                   from "react-router-dom"
import { HelmetProvider, Helmet } from "react-helmet-async"
import Markdown                   from "../generic/Markdown"
import { useAuth }                from "../../auth"
import { request }                from "../../backend"
import { useBackend }             from "../../hooks"
import Breadcrumbs                from "../generic/Breadcrumbs"
import { Format }                 from "../Format"
import ViewsBrowser               from "../Views/ViewsBrowser"
import Loader                     from "../generic/Loader"
import { AlertError }             from "../generic/Alert"
import { classList }              from "../../utils"
import Tag                        from "../Tags/Tag"
import TransmissionView           from "./Transmissions/TransmissionView"
import { app }                    from "../../types"
import DataViewer                 from "./DataViewer"
import ColumnsTable               from "./ColumnsTable"


export default function SubscriptionView(): JSX.Element
{
    const { id } = useParams()
    const { user } = useAuth();

    const { loading, error, result: model, execute: fetch } = useBackend<app.Subscription>(
        useCallback(() => request("/api/requests/" + id + "?group=true&graphs=true&tags=true"), [id]),
        true
    )

    const {
        loading: refreshing,
        error  : refreshError,
        execute: refresh
    } = useBackend(
        useCallback(() => request<app.Subscription>(`/api/requests/${id}/refresh`).then(fetch), [id, fetch])
    );

    if (loading && !model) {
        return <Loader/>
    }

    if (error) {
        return <AlertError>{ error + "" }</AlertError>
    }

    if (!model) {
        return <AlertError>Failed to load Subscription</AlertError>
    }

    const isFlatData = model.metadata?.type === "flat"

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>Subscription: {model.name}</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Subscriptions", href: "/requests" },
                { name: model.name }
            ]}/>
            <h3><i className="fas fa-database" /> { model.name }</h3>
            <div className="markdown">
                <Markdown>{ model.description || "" }</Markdown>
            </div>
            <br/>
            <div className="row gap-2 wrap">
                <div className="col col-6 responsive">
                    <div style={{ position: "sticky", top: "4rem" }}>
                        <h5 className="color-blue-dark">Status</h5>
                        <hr/>
                        <div className="left">
                            <table>
                                <tbody>
                                    <tr>
                                        <th className="right pr-1 pl-1">Group:</th>
                                        <td>{
                                            model.group ?
                                                <Link to={`/groups/${model.group.id}`} className="link" title={model.group.description}>{ model.group.name }</Link> :
                                                "GENERAL"
                                            }
                                        </td>
                                    </tr>
                                    { !model.dataURL?.startsWith("aggregator://") && 
                                        <>
                                            <tr>
                                                <th className="right pr-1 pl-1">Status:</th>
                                                <td>
                                                    {
                                                        model.completed ?
                                                        <>completed <Format value={ model.completed } format="date-time" /></> :
                                                        <span className="color-red">Pending</span>
                                                    }
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="right pr-1 pl-1 top">Refresh:</th>
                                                <td>
                                                    { model.refresh }
                                                    { user?.role === "admin" && model.refresh !== "none" && model.dataURL && (
                                                        <b className={classList({
                                                            "link ml-1": true,
                                                            "grey-out": refreshing || loading
                                                        })} onClick={refresh}>
                                                            { model.completed ? "Refresh Now" : "Fetch Data" }
                                                            &nbsp;
                                                            <i className={ classList({
                                                                "fa-solid": true,
                                                                "fa-rotate": refreshing || !!model.completed,
                                                                "fa-cloud-arrow-down": !refreshing && !model.completed,
                                                                "fa-spin grey-out": refreshing
                                                            })} />
                                                        </b>
                                                    )}
                                                    { refreshError && <AlertError>{ refreshError + "" }</AlertError> }
                                                </td>
                                            </tr>
                                        </>
                                    }
                                    
                                    <tr>
                                        <th className="right pr-1 pl-1">Created:</th>
                                        <td><Format value={ model.createdAt } format="date-time" /></td>
                                    </tr>
                                    { model.dataURL && (
                                        <tr>
                                            <th className="right pr-1 pl-1 top nowrap">Data URL:</th>
                                            <td className="color-muted ellipsis" title={ model.dataURL }>
                                                { model.dataURL }
                                            </td>
                                        </tr>
                                    )}
                                    { model.Tags && (
                                        <tr>
                                            <th className="right pr-1 pl-1">Tags:</th>
                                            <td>{
                                                model.Tags.length ?
                                                    model.Tags.map((t, i) => <Tag tag={t} key={i} />) :
                                                    <span className="color-muted">no tag assigned</span>
                                            }</td>
                                        </tr>
                                    )}
                                    { model.metadata?.total && <tr>
                                        <th className="right pr-1 pl-1 nowrap">Total rows:</th>
                                        <td>{ Number(model.metadata.total).toLocaleString()}</td>
                                    </tr>}
                                </tbody>
                            </table>
                        </div>
                        <br />

                        { model.transmissions && (
                            <>
                                <h5 className="color-blue-dark">Data Transmissions</h5>
                                <hr className="mb-05"/>
                                <TransmissionView
                                    sites={ model.requestedData?.dataSites || [] }
                                    transmissions={ model.transmissions }
                                />
                                <br />
                            </>
                        )}

                        <h5 className="color-blue-dark">Data Elements</h5>
                        <hr/>
                        <ColumnsTable cols={model.metadata?.cols} />

                        { model.metadata?.type === "flat" && <div className="mt-2"><DataViewer subscription={model} /></div> }
                    </div>
                </div>
                { !isFlatData && 
                    <div className="col col-4 responsive" style={{ minWidth: "20rem" }}>
                        { model.completed && <>
                            <h5 className="color-blue-dark">Dependent Graphs</h5>
                            <hr/>
                            <ViewsBrowser layout="column" requestId={ model.id } />
                        </> }
                        <br/>
                    </div>
                }
            </div>
            <hr className="center mt-1"/>
            <div className="center mt-1 mb-1">
                <a
                    aria-disabled={!model.metadata}
                    className="btn btn-blue pl-1 pr-1 mt-1 mb-1"
                    // https://smart-cumulus.herokuapp.com/requests/undefined/api/requests/10/data?format=csv
                    href={`${process.env.REACT_APP_BACKEND_HOST || ""}/api/requests/${id}/data?format=csv`}>
                    <b> Export Data </b>
                </a>
                { user?.role === "admin" && <Link
                    className="btn btn-blue pl-1 pr-1 m-1"
                    to={`/requests/${model.id}/import`}
                    ><b> Import Data </b></Link>
                }
                { user?.role === "admin" && <Link
                    className="btn btn-blue pl-1 pr-1 mt-1 mb-1"
                    to={`/requests/${model.id}/edit`}
                    ><b> Edit Subscription </b></Link>
                }
            </div>
        </div>
    )
}
