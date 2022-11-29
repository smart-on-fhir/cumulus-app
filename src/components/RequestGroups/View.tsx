import { createViewPage } from "../generic/EndpointViewWrapper"
import Clip               from "../generic/Clip"
import Grid from "../generic/Grid"
import DataRequestLink from "../DataRequests/DataRequestLink"


export default function RequestGroupView()
{
    return createViewPage<app.RequestGroup>({
        basePath: "/groups",
        endpoint: "/api/request-groups",
        namePlural: "Request Groups",
        icon: <i className="fa-solid fa-folder color-brand-2" />,
        query: "subscriptions=true",
        renderView : data => <>
            <div className="mt-2 mb-1" style={{ whiteSpace: "pre-wrap" }}>
                <b>Description:</b> {
                    data.description ?
                        <Clip max={400} txt={ data.description } /> :
                        <span className="color-muted">No description provided</span>
                }
            </div>
            <div className="mt-2 row gap wrap">
                <div className="col col-4 responsive">
                    { data.requests && data.requests.length ?
                        <>
                            <h6 className="color-brand-2">
                                <i className="fa-solid fa-link color-brand-2" /> Associated Data Subscriptions
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
                            <span className="material-icons-round color-blue">
                                info_outline
                            </span> No subscriptions are associated with this group.
                        </div>
                    }
                </div>
            </div>
        </>
    })
}
