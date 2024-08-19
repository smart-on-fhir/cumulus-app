import { createDeletePage } from "../generic/EndpointDeleteWrapper"
import Clip                 from "../generic/Clip"
import SubscriptionLink      from "../Subscriptions/SubscriptionLink"
import Grid                 from "../generic/Grid"
import { app }              from "../../types"


export default function DeleteRequestGroup()
{
    return createDeletePage<app.RequestGroup>({
        endpoint: "/api/request-groups",
        namePlural: "Subscription Groups",
        nameSingular: "Subscription Group",
        icon: <i className="fa-solid fa-folder color-brand-2" />,
        query: "subscriptions=true",
        renderView: data => <>
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
                                    <SubscriptionLink key={i} request={s} href={"/requests/" + s.id} />
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
        </>
    })
}
