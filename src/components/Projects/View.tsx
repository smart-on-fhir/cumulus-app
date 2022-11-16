import moment                     from "moment"
import { Helmet, HelmetProvider } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import Breadcrumbs                from "../Breadcrumbs"
import EndpointViewWrapper        from "../generic/EndpointViewWrapper"


export default function ViewProject() {
    return (
        <div className="container">
            <EndpointViewWrapper endpoint="/api/projects">
                { (data: app.Project) => <>
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
                    <div className="row gap color-muted small mb-1 mt-05">
                        <div className="col col-0">
                            <i>Graphs: <span className="color-brand-2">0</span></i>
                        </div>
                        <div className="col col-0">
                            <i>Created: <span className="color-brand-2">{ moment(data.createdAt).format("M/D/Y") }</span></i>
                        </div>
                        <div className="col col-0">
                            <i>Updated: <span className="color-brand-2">{ moment(data.updatedAt).format("M/D/Y") }</span></i>
                        </div>
                    </div>
                    <div className="mt-2 mb-1" style={{ whiteSpace: "pre-wrap" }}>{ data.description }</div>
                    <div className="row gap-2 mt-2">
                        <div className="col mb-2" style={{ minWidth: "20em", flex: 2 }}>
                            <h5><i className="fa-solid fa-chart-pie color-brand-2" /> Graphs</h5>
                            <hr/>
                            <p className="color-muted">TODO...</p>
                        </div>
                        <div className="col mb-2" style={{ minWidth: "20em" }}>
                            <h5><i className="fa-solid fa-database color-brand-2" /> Subscriptions</h5>
                            <hr/>
                            <p className="color-muted">TODO...</p>
                        </div>
                    </div>
                </> }
            </EndpointViewWrapper>
        </div>
    )
}