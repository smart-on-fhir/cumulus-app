import { useCallback, useState }   from "react"
import { useParams }               from "react-router"
import { Link }                    from "react-router-dom"
import { HelmetProvider, Helmet }  from "react-helmet-async"
import DataViewer                  from "./DataViewer"
import ColumnsTable                from "./ColumnsTable"
import DataPackageViewer           from "./DataPackageViewer"
import Markdown                    from "../generic/Markdown"
import Breadcrumbs                 from "../generic/Breadcrumbs"
import Loader                      from "../generic/Loader"
import { AlertError }              from "../generic/Alert"
import { Format }                  from "../Format"
import Tag                         from "../Tags/Tag"
import ViewsBrowser                from "../Views/ViewsBrowser"
import { useAuth }                 from "../../auth"
import { request }                 from "../../backend"
import { useBackend }              from "../../hooks"
import { app }                     from "../../types"
import aggregator, { DataPackage } from "../../Aggregator"


export default function SubscriptionView(): JSX.Element
{
    const { id } = useParams()
    const { user } = useAuth()
    const [dataPackage, setDataPackage] = useState<DataPackage | null>(null)

    const { loading, error, result: model } = useBackend<app.Subscription>(
        useCallback(async () => {
            const subscription = await request("/api/requests/" + id + "?group=true&graphs=true&tags=true")

            // If package ID is set fetch the dataPackage for further info
            if (subscription.dataURL) {
                const pkg = await aggregator.getPackage(subscription.dataURL)
                setDataPackage(pkg || null)
            }

            return subscription;
        }, [id]),
        true
    )

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
                            <table style={{ tableLayout: "fixed" }}>
                                <tbody>
                                    <tr>
                                        <th className="right pr-1 pl-1" style={{ width: "9em" }}>Group:</th>
                                        <td>{
                                            model.group ?
                                                <Link to={`/groups/${model.group.id}`} className="link" title={model.group.description}>{ model.group.name }</Link> :
                                                "GENERAL"
                                            }
                                        </td>
                                    </tr>
                                    { !model.dataURL && 
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
                                    }
                                    
                                    <tr>
                                        <th className="right pr-1 pl-1">Created:</th>
                                        <td><Format value={ model.createdAt } format="date-time" /></td>
                                    </tr>
                                    { model.dataURL && (
                                        <tr>
                                            <th className="right pr-1 pl-1 top nowrap">Data Package:</th>
                                            <td className="ellipsis" title={ model.dataURL }>{ model.dataURL }</td>
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
                                    { !model.dataURL && model.metadata?.total && <tr>
                                        <th className="right pr-1 pl-1 nowrap">Total rows:</th>
                                        <td>{ Number(model.metadata.total).toLocaleString()}</td>
                                    </tr>}
                                </tbody>
                            </table>
                        </div>

                        <br />

                        { dataPackage ?
                            <DataPackageViewer { ...dataPackage } /> :
                            model.metadata?.cols ?
                            <>
                                <h5 className="color-blue-dark">Data Elements</h5>
                                <hr/>
                                <ColumnsTable cols={model.metadata?.cols} />
                                <br/>
                            </> :
                            null
                        }

                        { model.metadata?.type === "flat" && <div className="mt-2"><DataViewer subscription={model} /></div> }
                    </div>
                </div>
                { !isFlatData && 
                    <div className="col col-4 responsive" style={{ minWidth: "20rem" }}>
                        { (model.completed || model.dataURL) && <>
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
                { !model.dataURL && <a
                    aria-disabled={!model.metadata}
                    className="btn btn-blue pl-1 pr-1 m-1"
                    // https://smart-cumulus.herokuapp.com/requests/undefined/api/requests/10/data?format=csv
                    href={`${process.env.REACT_APP_BACKEND_HOST || ""}/api/requests/${id}/data?format=csv`}>
                    <b> Export Data </b>
                </a> }
                { !model.dataURL && user?.role === "admin" && <Link
                    className="btn btn-blue pl-1 pr-1 m-1"
                    to={`/requests/${model.id}/import`}
                    ><b> Import Data </b></Link>
                }
                { user?.role === "admin" && <Link
                    className="btn btn-blue pl-1 pr-1 m-1"
                    to={`/requests/${model.id}/edit`}
                    ><b> Edit Subscription </b></Link>
                }
            </div>
        </div>
    )
}
