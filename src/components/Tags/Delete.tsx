import { Helmet, HelmetProvider } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import moment                     from "moment"
import EndpointDeleteWrapper      from "../generic/EndpointDeleteWrapper"
import { AlertError }             from "../Alert"
import Breadcrumbs                from "../Breadcrumbs"
import Loader                     from "../Loader"
import Clip                       from "../generic/Clip"
import DataRequestLink            from "../DataRequests/DataRequestLink"
import ViewThumbnail              from "../Views/ViewThumbnail"


export default function DeleteTag()
{
    return (
        <div className="container">
            <EndpointDeleteWrapper endpoint="/api/tags" query="creator=true&graphs=true&subscriptions=true">
                {({ loading, data, onSubmit, error }) => <>
                    <HelmetProvider>
                        <Helmet>
                            <title>Delete Tag</title>
                        </Helmet>
                    </HelmetProvider>
                    <Breadcrumbs links={[
                        { name: "Home"   , href: "/" },
                        { name: "Tags"   , href: "/tags" },
                        { name: data.name, href: "/tags/" + data.id },
                        { name: "Delete Tag" }
                    ]} />
                    <h1 className="color-brand-2 center mt-2 mb-2">Please Confirm!</h1>
                    { error && <AlertError>{ error }</AlertError> }
                    <div className="panel panel-danger mt-1">
                        <h4><i className="fa-solid fa-tag color-brand-2" /> { data.name }</h4>
                        <hr/>
                        <div className="row gap mb-2 mt-05">
                            <div className="col col-0">
                                <i>
                                    <span className="color-muted">Created: </span>
                                    <span className="color-brand-2">{ moment(data.createdAt).format("M/D/Y") }</span>
                                </i>
                            </div>
                            <div className="col col-0">
                                <i>
                                    <span className="color-muted">Updated: </span>
                                    <span className="color-brand-2">{ moment(data.updatedAt).format("M/D/Y") }</span>
                                </i>
                            </div>
                            { data.creator && <div className="col col-0">
                                <i>
                                    <span className="color-muted">Created by: </span>
                                    <span className="color-brand-2">{ data.creator.email }</span>
                                </i>
                            </div> }
                        </div>
                        <div className="mt-2 mb-2" style={{ whiteSpace: "pre-wrap" }}>
                            <Clip max={400} txt={ data.description } />
                        </div>
                        { (data.graphs?.length > 0 || data.subscriptions?.length > 0) && (
                            <>
                                <div className="mt-05 row gap wrap">
                                    { data.graphs?.length &&
                                        <div className="col col-6 responsive">
                                            <h6>
                                                <i className="fa-solid fa-link-slash color-brand-2" /> This tag will be removed from the following graphs:
                                            </h6>
                                            <hr/>
                                            <div className="view-browser view-browser-column" style={{ minHeight: 0 }}>
                                            { data.graphs.map((v: any, i: number) => (
                                                <ViewThumbnail
                                                    key={i}
                                                    view={ v }
                                                    showDescription={200}
                                                />
                                            ))}
                                            </div>
                                        </div>
                                    }
                                    { data.subscriptions?.length &&
                                        <div className="col col-4 responsive">
                                            <h6>
                                                <i className="fa-solid fa-link-slash color-brand-2" /> This tag will be removed from the following data subscriptions:
                                            </h6>
                                            <hr/>
                                            { data.subscriptions.map((s: any, i: number) => (
                                                <DataRequestLink key={i} request={s} href={"/requests/" + s.id} />
                                            ))}
                                        </div>
                                    }
                                </div>
                            </>
                        )}
                    </div>
                    
                    <div className="center pt-2 pb-1">
                        <Link style={{ minWidth: "12em" }} className="btn pl-2 pr-2 mr-1 color-green" to="..">Cancel</Link>
                        <button style={{ minWidth: "12em" }} className="btn btn-brand-2 pl-2 pr-2" onClick={() => onSubmit()} disabled={loading}>
                            Delete Tag{ loading && <>&nbsp;<Loader msg="" /></> }
                        </button>
                    </div>
                </> }
            </EndpointDeleteWrapper>
        </div>
    )
}
