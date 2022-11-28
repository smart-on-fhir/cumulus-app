import { Helmet, HelmetProvider } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import moment                     from "moment"
import EndpointDeleteWrapper      from "../generic/EndpointDeleteWrapper"
import { AlertError }             from "../Alert"
import Breadcrumbs                from "../Breadcrumbs"
import Loader                     from "../Loader"
import Clip                       from "../generic/Clip"
import DataRequestLink            from "../DataRequests/DataRequestLink"
import Grid                       from "../generic/Grid"
import ViewThumbnail              from "../Views/ViewThumbnail"

interface Result {
    loading : boolean
    data    : app.Project
    onSubmit: () => void 
    error   : Error | string | null
}

export default function DeleteProject()
{
    return (
        <div className="container">
            <EndpointDeleteWrapper endpoint="/api/projects">
                {({ loading, data, onSubmit, error }: Result) => {
                
                    const graphs: app.View[] = [];

                    data.Subscriptions?.forEach(sub => {
                        sub.Views?.forEach(view => {
                            graphs.push(view)
                        })
                    })

                    return <>
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
                        <div className="panel panel-danger mt-1">
                            <h4><i className="fa-solid fa-book color-brand-2" /> { data.name }</h4>
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
                            <div className="mt-2 mb-1" style={{ whiteSpace: "pre-wrap" }}>
                                <Clip max={400} txt={ data.description } />
                            </div>

                            <div className="row gap-2 mt-2 wrap">
                                <div className="col col-4 mb-2 responsive">
                                    <h6>
                                        <i className="fa-solid fa-link-slash color-brand-2" />
                                        <span className="color-muted"> Linked Data Subscriptions</span>
                                    </h6>
                                    <hr className="mb-05"/>
                                    { data.Subscriptions?.length ?
                                        <>
                                            <div className="color-muted mb-05">These data subscriptions will no longer be linked to this project:</div>
                                            <div className="link-list">
                                                { data.Subscriptions?.map((s, i) => (
                                                    <DataRequestLink key={i} request={s} href={"/requests/" + s.id}/>
                                                )) }
                                            </div>
                                        </> :
                                        <p className="color-muted">No subscriptions linked</p>
                                    }
                                </div>
                                <div className="col col-6 mb-2 responsive">
                                    <h6>
                                        <i className="fa-solid fa-link-slash color-brand-2" />
                                        <span className="color-muted"> Linked Graphs</span>
                                    </h6>
                                    <hr className="mb-05"/>
                                    { graphs.length ? 
                                        <>
                                            <div className="color-muted">These graphs will no longer be linked to this project:</div>
                                            <Grid className="view-browser view-browser-column" cols="20em">
                                                { graphs.map((g, i) => <ViewThumbnail key={i} view={g} showDescription={200} />) }
                                            </Grid>
                                        </> :
                                        <p className="color-muted">No graphs linked</p>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="center pt-2 pb-1">
                            <Link style={{ minWidth: "12em" }} className="btn pl-2 pr-2 mr-1 color-green" to="..">Cancel</Link>
                            <button style={{ minWidth: "12em" }} className="btn btn-brand-2 pl-2 pr-2" onClick={() => onSubmit()} disabled={loading}>
                                Delete Project{ loading && <>&nbsp;<Loader msg="" /></> }
                            </button>
                        </div>
                    </>
                }}
            </EndpointDeleteWrapper>
        </div>
    )
}
