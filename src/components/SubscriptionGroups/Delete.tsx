import { createDeletePage } from "../generic/EndpointDeleteWrapper"
import Clip                 from "../generic/Clip"
import SubscriptionLink     from "../Subscriptions/SubscriptionLink"
import Grid                 from "../generic/Grid"
import { app }              from "../../types"
import Terminology          from "../../Terminology"


export default function DeleteSubscriptionGroup()
{
    return createDeletePage<app.SubscriptionGroup>({
        endpoint: "/api/request-groups",
        namePlural: Terminology.subscriptionGroup.namePlural,
        nameSingular: Terminology.subscriptionGroup.nameSingular,
        icon: <span className="icon material-symbols-outlined color-brand-2">{Terminology.subscriptionGroup.icon}</span>,
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
                                <i className="fa-solid fa-link-slash color-brand-2" /> The
                                following {Terminology.subscription.namePlural.toLowerCase()} will
                                be reassigned to the default {Terminology.subscriptionGroup.nameSingular.toLowerCase()}:
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
                            </span> No {Terminology.subscription.namePlural.toLowerCase()} are associated with this {Terminology.subscriptionGroup.nameSingular.toLowerCase()}.
                            It can be safely deleted.
                        </div>
                    }
                </div>
            </div>
        </>
    })
}
