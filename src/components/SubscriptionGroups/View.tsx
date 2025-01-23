import { Link }           from "react-router-dom"
import { createViewPage } from "../generic/EndpointViewWrapper"
import Grid               from "../generic/Grid"
import Markdown           from "../generic/Markdown"
import SubscriptionLink   from "../Subscriptions/SubscriptionLink"
import { useAuth }        from "../../auth"
import { app }            from "../../types"


export default function SubscriptionGroupView()
{
    const { user } = useAuth();

    const canUpdate    = user?.permissions.includes("SubscriptionGroups.update")
    const canDelete    = user?.permissions.includes("SubscriptionGroups.delete")
    const canCreateSub = user?.permissions.includes("Subscriptions.create")

    return createViewPage<app.SubscriptionGroup>({
        basePath: "/groups",
        endpoint: "/api/request-groups",
        namePlural: "Data Source Groups",
        icon: <i className="fa-solid fa-folder color-brand-2" />,
        query: "subscriptions=true",
        canDelete,
        canUpdate,
        renderView : data => <>
            { data.description ? <Markdown>{ data.description }</Markdown> : <span className="color-muted">No description provided</span> }
            <div className="mt-2 row gap wrap">
                <div className="col col-4 responsive">
                    <div className="row gap mt-2">
                        <div className="col col-0 top responsive">
                            <h6 className="color-brand-2">
                                <i className="fa-solid fa-link color-brand-2" /> Associated Data Sources
                            </h6>
                        </div>
                        { canCreateSub && <div className="col col-0 right nowrap middle">
                            <div>
                                <Link to={`/requests/new?groupId=${data.id}`} className="btn btn-virtual" title="Create new Data Source in this group">
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
                            </span> No Data Sources are associated with this group.
                        </div>
                    }
                </div>
            </div>
        </>
    })
}
