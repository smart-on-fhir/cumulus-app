import { Helmet, HelmetProvider } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import EndpointDeleteWrapper      from "../generic/EndpointDeleteWrapper"
import { AlertError }             from "../generic/Alert"
import Breadcrumbs                from "../generic/Breadcrumbs"
import Loader                     from "../generic/Loader"
import Clip                       from "../generic/Clip"
import DataRequestLink            from "../DataRequests/DataRequestLink"
import Grid                       from "../generic/Grid"


export default function DeleteSubscriptionGroup()
{
    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>Delete Subscription Group</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home"    , href: "/" },
                { name: "Subscription Groups", href: "/groups" },
                { name: "Delete Subscription Group" }
            ]} />
            <EndpointDeleteWrapper endpoint="/api/request-groups" query="subscriptions=true">{
                ({ data, error, loading, onSubmit }: {
                    data: app.RequestGroup
                    error?: any
                    loading?: boolean
                    onSubmit: any

                }) => (
                    <>
                        <h1 className="color-brand-2 center mt-2 mb-2">Please Confirm!</h1>

                        { error && <AlertError>{ error }</AlertError> }
                        
                        <div className="panel panel-danger mt-1">
                            <h4><i className="fa-solid fa-folder color-brand-2" /> { data.name }</h4>
                            <hr/>

                            <div className="wrap small mt-05">
                                <span className="nowrap mt-1 pr-1">
                                    <b className="color-muted">Created </b>
                                    <span className="color-brand-2">{ new Date(data.createdAt).toLocaleString() }</span>
                                </span>
                                <span className="nowrap mt-1 pr-1">
                                    <b className="color-muted">Updated </b>
                                    <span className="color-brand-2 nowrap">{ new Date(data.updatedAt).toLocaleString() }</span>
                                </span>
                            </div>
                            <div className="mt-2 mb-1" style={{ whiteSpace: "pre-wrap" }}>
                                <b>Description:</b> {
                                    data.description ?
                                        <Clip max={400} txt={ data.description } /> :
                                        <span className="color-muted">No description provided</span>
                                }
                            </div>
                            <div className="mt-05 row gap wrap">
                                <div className="col col-4 responsive">
                                    
                                    { data.requests && data.requests.length ?
                                        <>
                                            <h6 className="color-brand-2">
                                                <i className="fa-solid fa-link-slash color-brand-2" /> The following subscriptions will be reassigned to the default group:
                                            </h6>
                                            <hr/>
                                            <Grid gap="0 1rem" cols="22em" className="link-list mt-05">{
                                                data.requests?.map((s, i) => (
                                                    <DataRequestLink key={i} request={s} href={"/requests/" + s.id} />
                                                ))
                                            }</Grid>
                                        </> :
                                        <div>
                                            <hr className="mb-1"/>
                                            <span className="material-icons-round color-green">
                                                info_outline
                                            </span> No subscriptions are associated with this group.
                                            It can be safely deleted.
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="center pt-2 pb-1">
                            <Link style={{ minWidth: "12em" }} className="btn pl-2 pr-2 mr-1 color-green" to="..">Cancel</Link>
                            <button style={{ minWidth: "12em" }} className="btn btn-brand-2 pl-2 pr-2" onClick={() => onSubmit()} disabled={loading}>
                                Delete { loading && <>&nbsp;<Loader msg="" /></> }
                            </button>
                        </div>
                    </>
                )
            }</EndpointDeleteWrapper>
        </div>
    )
}
