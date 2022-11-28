import moment                     from "moment"
import { Helmet, HelmetProvider } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import Breadcrumbs                from "../Breadcrumbs"
import DataRequestLink            from "../DataRequests/DataRequestLink"
import EndpointViewWrapper        from "../generic/EndpointViewWrapper"
import Grid                       from "../generic/Grid"
import ViewThumbnail              from "../Views/ViewThumbnail"


export default function ViewProject() {
    return (
        <div className="container">
            <EndpointViewWrapper endpoint="/api/projects">
                { (data: app.Project) => {

                    const graphs: app.View[] = [];

                    data.Subscriptions?.forEach(sub => {
                        sub.Views?.forEach(view => {
                            graphs.push(view)
                        })
                    })
                
                    return <>
                        <HelmetProvider>
                            <Helmet>
                                <title>{ data.name }</title>
                            </Helmet>
                        </HelmetProvider>    
                        <Breadcrumbs links={[
                            { name: "Home", href: "/" },
                            { name: "Projects", href: "/projects" },
                            { name: data.name }
                        ]} />
                        <div className="row gap mt-2">
                            <div className="col middle">
                                <h4 className="mb-05 mt-0"><i className="fa-solid fa-book color-brand-2" /> { data.name }</h4>
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
                        <div className="row gap mb-1 mt-05 wrap">
                            <div className="col col-3 responsive center">
                                <i>
                                    <span className="color-muted">Created: </span>
                                    <span className="color-brand-2">{ moment(data.createdAt).format("M/D/Y") }</span>
                                </i>
                            </div>
                            <div className="col col-3 responsive center">
                                <i>
                                    <span className="color-muted">Updated: </span>
                                    <span className="color-brand-2">{ moment(data.updatedAt).format("M/D/Y") }</span>
                                </i>
                            </div>
                            <div className="col col-3 responsive center">
                                <i>
                                    <span className="color-muted">Graphs: </span>
                                    <span className="color-brand-2">{graphs.length}</span>
                                </i>
                            </div>
                            <div className="col col-3 responsive center">
                                <i>
                                    <span className="color-muted">Subscriptions: </span>
                                    <span className="color-brand-2">{data.Subscriptions?.length || 0}</span>
                                </i>
                            </div>
                        </div>
                        <div className="mt-2 mb-1" style={{ whiteSpace: "pre-wrap" }}>{ data.description }</div>
                        
                        <div className="row gap-2 mt-2 wrap">
                            <div className="col col-4 mb-2 responsive">
                                <h5>
                                    <i className="fa-solid fa-database color-brand-2" />
                                    <span className="color-muted"> Subscriptions</span>
                                </h5>
                                <hr className="mb-05"/>
                                { data.Subscriptions?.length ? 
                                    <div className="link-list">
                                        { data.Subscriptions.map((s, i) => (
                                            <DataRequestLink key={i} request={s} href={"/requests/" + s.id}/>
                                        )) }
                                    </div> :
                                    <p className="color-muted">No subscriptions attached yet</p>
                                }
                            </div>
                            <div className="col col-6 mb-2 responsive">
                                <h5>
                                    <i className="fa-solid fa-chart-pie color-brand-2" />
                                    <span className="color-muted"> Graphs</span>
                                </h5>
                                <hr/>
                                { graphs.length ? 
                                    <Grid className="view-browser view-browser-column" cols="20em">
                                        { graphs.map((g, i) => <ViewThumbnail key={i} view={g} showDescription={200} />) }
                                    </Grid> :
                                    <p className="color-muted">No graphs attached yet</p>
                                }
                            </div>
                            
                        </div>
                    </>
                }}
            </EndpointViewWrapper>
        </div>
    )
}