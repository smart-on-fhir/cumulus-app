import moment                     from "moment"
import { Helmet, HelmetProvider } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import Breadcrumbs                from "../Breadcrumbs"
import Clip                       from "../generic/Clip"
import MenuButton                 from "../MenuButton"
import EndpointListWrapper        from "../generic/EndpointListWrapper"
import "./Projects.scss"


export default function Projects()
{
    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>Cumulus Projects</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Projects" }
            ]} />
            <EndpointListWrapper endpoint="/api/projects?order=createdAt:asc">
                { (data: app.Project[]) => {
                    
                    if (!data.length) {
                        return <div className="center">
                            <br/>
                            <p>No projects found in the database! You can start by creating a new project.</p>
                            <br/>
                            <Link to="./new" className="btn btn-blue-dark pl-2 pr-2">Create Project</Link>
                        </div>
                    }

                    return (
                        <div className="row" style={{ margin: "0 -1rem" }}>
                            { data.map((project, i) => (
                                <div className="col project" key={i}>
                                    <h3>{ project.name }</h3>
                                    <p style={{ whiteSpace: "pre-wrap" }}><Clip max={600} txt={ project.description } /></p>
                                    <br/>
                                    <br/>
                                    <div style={{ flex: 1 }}/>
                                    <div className="row gap color-muted small mb-1" style={{ justifyContent: "space-around" }}>
                                        <div className="col col-0">
                                            <i>Graphs: <span className="color-brand-2">0</span></i>
                                        </div>
                                        <div className="col col-0">
                                            <i>Created: <span className="color-brand-2">{ moment(project.createdAt).format("M/D/Y") }</span></i>
                                        </div>
                                        <div className="col col-0">
                                            <i>Updated: <span className="color-brand-2">{ moment(project.updatedAt).format("M/D/Y") }</span></i>
                                        </div>
                                    </div>
                                    <hr/>
                                    <div className="center">
                                        <div className="btn btn-blue mt-2 p-0">
                                            <Link to={`/projects/${project.id}`} className="pl-2 pr-2"><b>Explore</b></Link>
                                            <MenuButton right items={[
                                                <Link to={ `/projects/${project.id}/edit` }>
                                                    <i className="fa-solid fa-pen-to-square color-blue-dark" /> Edit Project
                                                </Link>,
                                                <Link to={ `/projects/${project.id}/delete` }>
                                                    <i className="fa-solid fa-trash-can color-red" /> Delete Project
                                                </Link>
                                            ]}>
                                                <i className="fa-solid fa-caret-down small" />
                                            </MenuButton>
                                        </div>
                                    </div>
                                </div>
                            )) }
                        </div>
                    )
                }}
            </EndpointListWrapper>
        </>
    )
}