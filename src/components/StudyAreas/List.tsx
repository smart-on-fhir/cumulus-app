import { Link }       from "react-router-dom"
import StudyAreaCard  from "./Card"
import createListPage from "../generic/EndpointListWrapper"
import Grid           from "../generic/Grid"
import { useAuth }    from "../../auth"
import { app }        from "../../types"
import Terminology    from "../../Terminology"
import "./StudyAreas.scss"


export default function ListStudyAreas()
{
    const { user } = useAuth();
    const canCreate = user?.permissions.includes("StudyAreas.create")
    const baseUrl = "/study-areas"

    return createListPage<app.StudyArea[]>({
        namePlural: Terminology.studyArea.namePlural,
        endpoint  : "/api/study-areas",
        icon      : <span className="icon material-symbols-outlined color-brand-2">{Terminology.studyArea.icon}</span>,
        canCreate,
        baseUrl,
        renderList: data => {

            if (!data.length) {
                return <div className="center">
                    <br/>
                    <p>No {Terminology.studyArea.namePlural} found in the database! You can start by creating a new {Terminology.studyArea.nameSingular}.</p>
                    <br/>
                    <Link to={`${baseUrl}/new`} className="btn btn-blue-dark pl-2 pr-2">Create {Terminology.studyArea.nameSingular}</Link>
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

