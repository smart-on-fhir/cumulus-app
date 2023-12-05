import moment                     from "moment"
import { Helmet, HelmetProvider } from "react-helmet-async"
import { Link, useNavigate }      from "react-router-dom"
import Breadcrumbs                from "../generic/Breadcrumbs"
import Clip                       from "../generic/Clip"
import MenuButton                 from "../generic/MenuButton"
import EndpointListWrapper        from "../generic/EndpointListWrapper"
import Grid                       from "../generic/Grid"
import { useAuth }                from "../../auth"
import { app }                    from "../../types"
import "./Projects.scss"


export default function List()
{
    const { user } = useAuth();
    const navigate = useNavigate();

    const canUpdate = user?.permissions.includes("StudyAreas.update")
    const canDelete = user?.permissions.includes("StudyAreas.delete")

    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>Cumulus Study Areas</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Study Areas" }
            ]} />
            <EndpointListWrapper endpoint="/api/projects?order=createdAt:asc">
                { (data: app.Project[]) => {
                    
                    if (!data.length) {
                        return <div className="center">
                            <br/>
                            <p>No study areas found in the database! You can start by creating a new study area.</p>
                            <br/>
                            <Link to="./new" className="btn btn-blue-dark pl-2 pr-2">Create Study Area</Link>
                        </div>
                    }

                    return (
                        <Grid cols="25em" gap="2rem">
                            { data.map((project, i) => {

                                const graphsCount = project.Subscriptions?.reduce((prev, cur) => {
                                    return prev + (cur.Views?.length || 0)
                                }, 0) || 0
                                
                                return (
                                    <div className="col project" key={i} onClick={() => navigate(`/projects/${project.id}`)}>
                                        <h3>{ project.name }</h3>
                                        <p style={{ whiteSpace: "pre-wrap" }}><Clip max={600} txt={ project.description } /></p>
                                        <br/>
                                        <br/>
                                        <div style={{ flex: 1 }}/>
                                        <Grid cols="1fr 5fr 1fr" className="small center mb-05">
                                            <i className="nowrap">
                                                <span className="color-muted">Graphs: </span>
                                                <span className="color-brand-2">{ graphsCount }</span>
                                            </i>
                                            <i className="nowrap">
                                                <span className="color-muted">Subscriptions: </span>
                                                <span className="color-brand-2">{ project.Subscriptions?.length || 0 }</span>
                                            </i>
                                            <i className="nowrap">
                                                <span className="color-muted">Updated: </span>
                                                <span className="color-brand-2">{ moment(project.updatedAt).format("M/D/Y") }</span>
                                            </i>
                                        </Grid>
                                        <hr/>
                                        <div className="center">
                                            <div className="btn btn-blue mt-2" onClick={e => {
                                                e.stopPropagation()
                                                e.preventDefault()
                                            }}>
                                                <Link to={`/projects/${project.id}`} className="pl-2 pr-2"><b>Explore</b></Link>
                                                { (canUpdate || canDelete) && <MenuButton right items={[
                                                    canUpdate ? <Link to={ `/projects/${project.id}/edit` }>
                                                        <i className="fa-solid fa-pen-to-square color-blue-dark" /> Edit Study Area
                                                    </Link> : null,
                                                    canDelete ? <Link to={ `/projects/${project.id}/delete` }>
                                                        <i className="fa-solid fa-trash-can color-red" /> Delete Study Area
                                                    </Link> : null
                                                ]}>
                                                    <i className="fa-solid fa-caret-down small" />
                                                </MenuButton> }
                                            </div>
                                        </div>
                                    </div>
                                )
                                
                            }) }
                        </Grid>
                    )
                }}
            </EndpointListWrapper>
        </>
    )
}