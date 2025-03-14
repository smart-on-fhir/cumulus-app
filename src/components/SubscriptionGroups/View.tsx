import Link               from "../Link"
import { createViewPage } from "../generic/EndpointViewWrapper"
import Grid               from "../generic/Grid"
import Markdown           from "../generic/Markdown"
import SubscriptionLink   from "../Subscriptions/SubscriptionLink"
import { useAuth }        from "../../auth"
import { app }            from "../../types"
import Terminology        from "../../Terminology"
import { useMatch } from "react-router"


export default function SubscriptionGroupView({ id }: { id?: number })
{
    const { user } = useAuth();

    const canUpdate    = user?.permissions.includes("SubscriptionGroups.update")
    const canDelete    = user?.permissions.includes("SubscriptionGroups.delete")
    const canCreateSub = user?.permissions.includes("Subscriptions.create")

    const isInsideExplorer = useMatch("/explorer/*"); // Matches any route under /explorer
    const baseUrl = isInsideExplorer ? "/explorer/groups" : "/groups"

    return createViewPage<app.SubscriptionGroup>({
        basePath  : baseUrl,
        endpoint  : "/api/request-groups",
        namePlural: Terminology.subscriptionGroup.namePlural,
        icon      : <span className="icon material-symbols-outlined color-brand-2">{Terminology.subscriptionGroup.icon}</span>,
        query     : "subscriptions=true",
        canDelete,
        canUpdate,
        id,
        renderView : data => <>
            { data.description ? <Markdown>{ data.description }</Markdown> : <span className="color-muted">No description provided</span> }
            <div className="mt-2 row gap wrap">
                <div className="col col-4 responsive">
                    <div className="row gap mt-2">
                        <div className="col col-0 top responsive">
                            <h6 className="color-brand-2">
                                <i className="fa-solid fa-link color-brand-2" /> Associated {Terminology.subscription.namePlural}
                            </h6>
                        </div>
                        { canCreateSub && <div className="col col-0 right nowrap middle">
                            <div>
                                <Link to={`/requests/new?groupId=${data.id}`} className="btn btn-virtual" title={`Create new ${Terminology.subscription.nameSingular.toLowerCase()} in this ${Terminology.subscriptionGroup.nameSingular.toLowerCase()}`}>
                                    <i className="fa-solid fa-plus-circle color-blue" />
                                </Link>
                            </div>
                        </div> }
                    </div>
                    <hr/>
                    { data.requests && data.requests.length ?
                        <Grid gap="0 1rem" cols="22em" className="link-list mt-05">{
                            data.requests?.map((s, i) => (
                                <SubscriptionLink key={i} request={s} href={"/requests/" + s.id} />
                            ))
                        }</Grid> :
                        <div className="mt-1">
                            <span className="material-icons-round color-blue">
                                info_outline
                            </span> No {Terminology.subscription.namePlural.toLowerCase()} are associated with this {Terminology.subscriptionGroup.nameSingular.toLowerCase()}.
                        </div>
                    }
                </div>
            </div>
        </>
    })
}
