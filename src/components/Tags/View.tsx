import { Link }           from "react-router-dom"
import { useAuth }        from "../../auth"
import SubscriptionLink    from "../Subscriptions/SubscriptionLink"
import { createViewPage } from "../generic/EndpointViewWrapper"
import ViewThumbnail      from "../Views/ViewThumbnail"
import { app }            from "../../types"


export default function TagView({ id }: { id?: number }) {

    const { user } = useAuth();

    const canUpdate = user?.permissions.includes("Tags.update")
    const canDelete = user?.permissions.includes("Tags.delete")

    return createViewPage<app.Tag>({
        endpoint    : "/api/tags",
        namePlural  : "Tags",
        icon        : <i className="fa-solid fa-tag color-brand-2" />,
        query       : "creator=true&graphs=true&subscriptions=true",
        basePath    : "/tags",
        canUpdate,
        canDelete,
        id,
        renderView  : data => <>
            <div className="mt-05">
                <span className="color-muted">Created by: </span>
                <span className="color-brand-2">{ data.creator?.email }</span>
            </div>
            <div className="mt-05 mb-2" style={{ whiteSpace: "pre-wrap" }}>
                <span className="color-muted">Description: </span>{ data.description }
            </div>
            <div className="row gap-2 mt-2 wrap">
                <div className="col col-6 responsive mb-2">
                    <h5><i className="fa-solid fa-chart-pie color-brand-2" /> Graphs</h5>
                    <hr/>
                    { data.graphs?.length ?
                        <>
                            <p className="color-muted">This tag is assigned to the following graphs:</p>
                            <div className="view-browser view-browser-list">
                            { data.graphs.map((v, i) => (
                                <ViewThumbnail key={i} view={v} showDescription={200} />
                            ))}
                            </div>
                        </> :
                        <>
                            <p className="color-brand-2">This tag is not assigned with any graphs</p>
                            <br/>
                            <Link to="/views" className="link">Browse all graphs</Link>
                        </>
                        
                    }
                </div>
                <div className="col col-4 responsive mb-2">
                    <h5><i className="fa-solid fa-database color-brand-2" /> Data Sources</h5>
                    <hr/>
                    { data.subscriptions?.length ?
                        <>
                            <p className="color-muted">This tag is assigned to the following Data Sources:</p>
                            <div className="link-list mt-05">
                            { data.subscriptions.map((s, i) => (
                                // @ts-ignore
                                <SubscriptionLink key={i} request={s} href={"/requests/" + s.id}/>
                            ))}
                            </div>
                        </> :
                        <>
                            <p className="color-brand-2">This tag is not assigned with any Data Sources</p>
                            <br/>
                            <Link to="/requests" className="link">Browse all Data Sources</Link>
                        </>
                        
                    }
                </div>
            </div>
        </>
    })
}