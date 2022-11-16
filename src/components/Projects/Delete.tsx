import { Helmet, HelmetProvider } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import moment                     from "moment"
import EndpointDeleteWrapper      from "../generic/EndpointDeleteWrapper"
import { AlertError }             from "../Alert"
import Breadcrumbs                from "../Breadcrumbs"
import Loader                     from "../Loader"
import Clip from "../generic/Clip"


export default function DeleteProject()
{
    return (
        <div className="container">
            <EndpointDeleteWrapper endpoint="/api/projects">
                {({ loading, data, onSubmit, error }) => <>
                    <HelmetProvider>
                        <Helmet>
                            <title>Delete Project</title>
                        </Helmet>
                    </HelmetProvider>
                    <Breadcrumbs links={[
                        { name: "Home"    , href: "/" },
                        { name: "Projects", href: "/projects" },
                        { name: data.name , href: "/projects/" + data.id },
                        { name: "Delete Project" }
                    ]} />
                    <h1 className="color-brand-2 center mt-2 mb-2">Please Confirm!</h1>
                    { error && <AlertError>{ error }</AlertError> }
                    <div className="panel mt-1">
                        <h4><i className="fa-solid fa-book color-brand-2" /> { data.name }</h4>
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
                        <div className="mt-2 mb-1" style={{ whiteSpace: "pre-wrap" }}>
                            <Clip max={400} txt={ data.description } />
                        </div>
                    </div>
                    <div className="center pt-2 pb-1">
                        <Link style={{ minWidth: "12em" }} className="btn pl-2 pr-2 mr-1 color-green" to="..">Cancel</Link>
                        <button style={{ minWidth: "12em" }} className="btn btn-brand-2 pl-2 pr-2" onClick={() => onSubmit()} disabled={loading}>
                            Delete Project{ loading && <>&nbsp;<Loader msg="" /></> }
                        </button>
                    </div>
                </> }
            </EndpointDeleteWrapper>
        </div>
    )
}
