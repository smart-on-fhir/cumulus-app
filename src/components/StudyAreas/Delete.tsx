import { createDeletePage } from "../generic/EndpointDeleteWrapper"
import Clip                 from "../generic/Clip"
import SubscriptionLink      from "../Subscriptions/SubscriptionLink"
import Grid                 from "../generic/Grid"
import ViewThumbnail        from "../Views/ViewThumbnail"
import { app }              from "../../types"


export default function Delete()
{
    return createDeletePage<app.StudyArea>({
        endpoint    : "/api/study-areas",
        namePlural  : "Study Areas",
        nameSingular: "Study Area",
        icon        : <i className="fa-solid fa-book color-brand-2" />,
        renderView  : data => {
            const graphs: app.View[] = [];

            data.Subscriptions?.forEach(sub => {
                sub.Views?.forEach(view => {
                    graphs.push(view)
                })
            })

            return <>
                <div className="mt-2 mb-1" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    <Clip max={400} txt={ data.description } />
                </div>

                <div className="row gap-2 mt-2 wrap">
                    <div className="col col-4 mb-2 responsive">
                        <h6>
                            <i className="fa-solid fa-link-slash color-brand-2" />
                            <span className="color-muted"> Linked Subscriptions</span>
                        </h6>
                        <hr className="mb-05"/>
                        { data.Subscriptions?.length ?
                            <>
                                <div className="color-muted mb-05">These subscriptions will no longer be linked to this study area:</div>
                                <div className="link-list">
                                    { data.Subscriptions?.map((s, i) => (
                                        <SubscriptionLink key={i} request={s} href={"/requests/" + s.id}/>
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
                                <div className="color-muted">These graphs will no longer be linked to this study area:</div>
                                <Grid className="view-browser view-browser-column" cols="20em">
                                    { graphs.map((g, i) => <ViewThumbnail key={i} view={g} showDescription={200} />) }
                                </Grid>
                            </> :
                            <p className="color-muted">No graphs linked</p>
                        }
                    </div>
                </div>
            </>
        }
    })
}
