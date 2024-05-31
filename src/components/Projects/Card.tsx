import moment          from "moment"
import { useNavigate } from "react-router"
import Markdown        from "../generic/Markdown"
import Grid            from "../generic/Grid"
import { app }         from "../../types"
import "./Projects.scss"


export default function StudyAreaCard({ model, footer, short }: {
    model: app.Project
    short?: boolean
    footer?: {
        graphsCount: number
    }
})
{
    const navigate = useNavigate();

    return (
        <div className={"col project" + (short ? " short" : "") } onClick={() => navigate(`/projects/${model.id}`)}>
            <header><h3><i className="fa-solid fa-book color-muted" /> { model.name }</h3></header>
            <div className="main-wrap small">
                <main>
                    <Markdown>{ model.description }</Markdown>
                </main>
            </div>
            { footer && <>
                <footer>
                    <Grid cols="1fr 5fr 1fr" className="small center">
                        <i className="nowrap">
                            <span className="color-muted">Graphs: </span>
                            <span className="color-brand-2">{ footer.graphsCount }</span>
                        </i>
                        <i className="nowrap">
                            <span className="color-muted">Subscriptions: </span>
                            <span className="color-brand-2">{ model.Subscriptions?.length || 0 }</span>
                        </i>
                        <i className="nowrap">
                            <span className="color-muted">Updated: </span>
                            <span className="color-brand-2">{ moment(model.updatedAt).format("M/D/Y") }</span>
                        </i>
                    </Grid>
                </footer>
            </> }
        </div>
    )
}