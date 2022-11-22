import moment                     from "moment"
import { Helmet, HelmetProvider } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import Breadcrumbs                from "../Breadcrumbs"
import DataRequestLink from "../DataRequests/DataRequestLink"
import EndpointViewWrapper        from "../generic/EndpointViewWrapper"
import ViewThumbnail from "../Views/ViewThumbnail"


export default function ViewTag() {
    return (
        <div className="container">
            <EndpointViewWrapper endpoint="/api/tags" query="creator=true&graphs=true&subscriptions=true">
                { (data: app.Tag) => <>
                    <HelmetProvider>
                        <Helmet>
                            <title>{ data.name }</title>
                        </Helmet>
                    </HelmetProvider>    
                    <Breadcrumbs links={[
                        { name: "Home", href: "/" },
                        { name: "Tags", href: "/tags" },
                        { name: data.name }
                    ]} />
                    <div className="row gap mt-2">
                        <div className="col middle">
                            <h4 className="mb-05 mt-0"><i className="fa-solid fa-tag color-brand-2" /> { data.name }</h4>
                        </div>
                        <div className="col col-0 right nowrap middle">
                            <div>
                                <Link to="./edit" className="btn btn-virtual">
                                    <i className="fa-solid fa-pen-to-square color-blue" title="Edit" />
                                </Link>
                                <Link to="./delete" className="btn btn-virtual" title="Delete">
                                    <i className="fa-solid fa-trash-can color-blue" />
                                </Link>
                            </div>
                        </div>
                    </div>
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
                        <div className="col col-0">
                            <i>
                                <span className="color-muted">Created by: </span>
                                <span className="color-brand-2">{ data.creator?.email }</span>
                            </i>
                        </div>
                    </div>
                    <div className="mt-2 mb-2" style={{ whiteSpace: "pre-wrap" }}>{ data.description }</div>
                    <div className="row gap-2 mt-2 wrap">
                        <div className="col col-6 responsive mb-2">
                            <h5><i className="fa-solid fa-chart-pie color-brand-2" /> Graphs</h5>
                            <hr/>
                            { data.graphs?.length ?
                                <>
                                    <p className="color-muted">This tag is assigned to the following graphs:</p>
                                    <div className="view-browser view-browser-column" style={{ minHeight: 0 }}>
                                    { data.graphs.map((v, i) => (
                                        <ViewThumbnail key={i} view={v} showDescription={200} />
                                    ))}
                                    </div>
                                </> :
                                <>
                                    <p className="color-brand-2">This tag is not assigned with any graphs</p>
                                    <br/>
                                    <Link to="/views" className="link">Browse all graphs</Link>
                                </>
                                
                            }
                        </div>
                        <div className="col col-4 responsive mb-2">
                            <h5><i className="fa-solid fa-database color-brand-2" /> Subscriptions</h5>
                            <hr/>
                            { data.subscriptions?.length ?
                                <>
                                    <p className="color-muted">This tag is assigned to the following data subscriptions:</p>
                                    { data.subscriptions.map((s, i) => (
                                        // @ts-ignore
                                        <DataRequestLink key={i} request={s} href={"/requests/" + s.id}/>
                                    ))}
                                </> :
                                <>
                                    <p className="color-brand-2">This tag is not assigned with any data subscriptions</p>
                                    <br/>
                                    <Link to="/requests" className="link">Browse all data subscriptions</Link>
                                </>
                                
                            }
                        </div>
                    </div>
                </> }
            </EndpointViewWrapper>
        </div>
    )
}