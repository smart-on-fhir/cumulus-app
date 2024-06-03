import { Link }           from "react-router-dom"
import StudyAreaCard      from "./Card"
import { createListPage } from "../generic/EndpointListWrapper"
import Grid               from "../generic/Grid"
import { useAuth }        from "../../auth"
import { app }            from "../../types"
import "./StudyAreas.scss"


export default function List()
{
    const { user } = useAuth();
    const canCreate = user?.permissions.includes("StudyAreas.create")

    return createListPage<app.StudyArea[]>({
        namePlural: "Study Areas",
        endpoint  : "/api/study-areas",
        icon      : <i className="fa-solid fa-book color-brand-2" />,        
        canCreate,
        renderList: data => {

            if (!data.length) {
                return <div className="center">
                    <br/>
                    <p>No study areas found in the database! You can start by creating a new study area.</p>
                    <br/>
                    <Link to="./new" className="btn btn-blue-dark pl-2 pr-2">Create Study Area</Link>
                </div>
            }

            return (
                <Grid cols="22em" gap="1rem">
                    { data.map((model, i) => {
                        const graphsCount = model.Subscriptions?.reduce((prev, cur) => {
                            return prev + (cur.Views?.length || 0)
                        }, 0) || 0
                        
                        return <StudyAreaCard key={i} model={model} footer={{ graphsCount }} />
                    }) }
                </Grid>
            )
        }
    });
}

