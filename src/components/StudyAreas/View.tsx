import { useAuth }        from "../../auth"
import DataRequestLink    from "../DataRequests/DataRequestLink"
import { createViewPage } from "../generic/EndpointViewWrapper"
import Grid               from "../generic/Grid"
import Markdown           from "../generic/Markdown"
import ViewThumbnail      from "../Views/ViewThumbnail"
import { app }            from "../../types"


export default function View() {

    const { user } = useAuth();

    return createViewPage<app.StudyArea>({
        basePath  : "/study-areas",
        endpoint  : "/api/study-areas",
        namePlural: "Study Areas",
        icon      : <i className="fa-solid fa-book color-brand-2" />,
        canUpdate : user?.permissions.includes("Tags.update"),
        canDelete : user?.permissions.includes("Tags.delete"),
        renderView: data => {

            const graphs: app.View[] = [];

            data.Subscriptions?.forEach(sub => {
                sub.Views?.forEach(view => {
                    graphs.push(view)
                })
            })
            
            return <>
                <div className="mt-2 mb-1">
                    <Markdown>{ data.description }</Markdown>
                </div>

                <div className="row gap-2 mt-2 wrap">
                    <div className="col col-5 mb-2 responsive">
                        <h5>
                            <i className="fa-solid fa-database color-brand-2" />
                            <span className="color-muted"> Subscriptions</span>
                        </h5>
                        <hr className="mb-05"/>
                        { data.Subscriptions?.length ? 
                            <div className="link-list">
                                { data.Subscriptions.map((s, i) => (
                                    <DataRequestLink key={i} request={s} href={"/requests/" + s.id}/>
                                )) }
                            </div> :
                            <p className="color-muted">No subscriptions attached yet</p>
                        }
                    </div>
                    <div className="col col-10 mb-2 responsive">
                        <h5>
                            <i className="fa-solid fa-chart-pie color-brand-2" />
                            <span className="color-muted"> Graphs</span>
                        </h5>
                        <hr/>
                        { graphs.length ? 
                            <Grid className="view-browser view-browser-column" cols="18em">
                                { graphs.map((g, i) => <ViewThumbnail key={i} view={g} showDescription={200} />) }
                            </Grid> :
                            <p className="color-muted">No graphs attached yet</p>
                        }
                    </div>
                    
                </div>
            </>
        }
    })
}
