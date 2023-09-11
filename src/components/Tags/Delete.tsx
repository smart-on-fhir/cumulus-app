import { createDeletePage } from "../generic/EndpointDeleteWrapper"
import Clip                 from "../generic/Clip"
import DataRequestLink      from "../DataRequests/DataRequestLink"
import ViewThumbnail        from "../Views/ViewThumbnail"
import { app }              from "../../types"


export default function Delete()
{
    return createDeletePage<app.Tag>({
        endpoint    : "/api/tags",
        namePlural  : "Tags",
        nameSingular: "Tag",
        icon        : <i className="fa-solid fa-tag color-brand-2" />,
        query       : "creator=true&graphs=true&subscriptions=true",
        renderView  : data => <>
            { data.creator && <div className="mb-05">
                <span className="color-muted">Created by: </span>
                <span className="color-brand-2">{ data.creator.email }</span>
            </div> }
            <div className="mb-2" style={{ whiteSpace: "pre-wrap" }}>
                <span className="color-muted">Description: </span> {
                    data.description ? 
                        <Clip max={400} txt={ data.description } /> :
                        <span className="color-muted">No description provided</span>
                }
            </div>
            { (data.graphs!.length > 0 || data.subscriptions!.length > 0) && (
                <>
                    <div className="mt-05 row gap wrap">
                        { data.graphs?.length &&
                            <div className="col col-5 responsive">
                                <h6>
                                    <i className="fa-solid fa-link-slash color-brand-2" /> This tag will be removed from the following graphs:
                                </h6>
                                <hr/>
                                <div className="view-browser view-browser-list">
                                    { data.graphs.map((v: any, i: number) => (
                                        <ViewThumbnail
                                            key={i}
                                            view={ v }
                                            showDescription={200}
                                        />
                                    ))}
                                </div>
                            </div>
                        }
                        { data.subscriptions!.length &&
                            <div className="col col-5 responsive">
                                <h6>
                                    <i className="fa-solid fa-link-slash color-brand-2" /> This tag will be removed from the following subscriptions:
                                </h6>
                                <hr/>
                                <div className="link-list mt-05">
                                { data.subscriptions!.map((s: any, i: number) => (
                                    <DataRequestLink key={i} request={s} href={"/requests/" + s.id} />
                                ))}
                                </div>
                            </div>
                        }
                    </div>
                </>
            )}
        </>
    })
}
