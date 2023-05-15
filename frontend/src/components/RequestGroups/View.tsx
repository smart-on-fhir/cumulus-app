import { Link }           from "react-router-dom"
import { createViewPage } from "../generic/EndpointViewWrapper"
import Clip               from "../generic/Clip"
import Grid               from "../generic/Grid"
import DataRequestLink    from "../DataRequests/DataRequestLink"
import { useAuth }        from "../../auth"


export default function RequestGroupView()
{
    const { user } = useAuth();

    const canUpdate    = user?.permissions.includes("RequestGroups.update")
    const canDelete    = user?.permissions.includes("RequestGroups.delete")
    const canCreateSub = user?.permissions.includes("DataRequests.create")

    return createViewPage<app.RequestGroup>({
        basePath: "/groups",
        endpoint: "/api/request-groups",
        namePlural: "Request Groups",
        icon: <i className="fa-solid fa-folder color-brand-2" />,
        query: "subscriptions=true",
        canDelete,
        canUpdate,
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
                    <div className="row gap mt-2">
                        <div className="col col-0 top responsive">
                            <h6 className="color-brand-2">
                                <i className="fa-solid fa-link color-brand-2" /> Associated Subscriptions
                            </h6>
                        </div>
                        { canCreateSub && <div className="col col-0 right nowrap middle">
                            <div>
                                <Link to={`/requests/new?groupId=${data.id}`} className="btn btn-virtual" title="Create new subscription in this group">
                                    <i className="fa-solid fa-plus-circle color-blue" />
                                </Link>
                            </div>
                        </div> }
                    </div>
                    <hr/>
                    { data.requests && data.requests.length ?
                        <Grid gap="0 1rem" cols="22em" className="link-list mt-05">{
                            data.requests?.map((s, i) => (
                                <DataRequestLink key={i} request={s} href={"/requests/" + s.id} />
                            ))
                        }</Grid> :
                        <div className="mt-1">
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
