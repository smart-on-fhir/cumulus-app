import { useState }               from "react"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import EndpointListWrapper        from "../generic/EndpointListWrapper"
import "./home.scss"


export default function Home() {
    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>Cumulus</title>
                </Helmet>
            </HelmetProvider>
            <div className="home-page container">
                <Projects />
                <Graphs />
                <Subscriptions />
                <Sites />
            </div>
        </>
    )
}

function Projects() {
    return (
        <EndpointListWrapper endpoint="/api/projects?order=updatedAt:desc">
            { (data: app.Project[]) => {
                return (
                    <div className="projects">
                        { data.map((project, i) => (
                            <Link to={ `/projects/${project.id}` } className="card card-project" key={i} title={ project.description || undefined }>
                                <h4>{ project.name }</h4>
                                <hr/>
                                <p>{ project.description }</p>
                            </Link>
                        ))}
                    </div>
                )
            }}
        </EndpointListWrapper>
    )
}

function Graphs() {

    const [selected, setSelected] = useState(0)

    return (
        <EndpointListWrapper endpoint="/api/views?order=updatedAt:desc&limit=7">
            { (data: app.Project[]) => {
                if (!selected && data.length) {
                    setTimeout(() => setSelected(data[0].id))
                }
                return (
                    <div className="graphs-row card">
                        <div className="graphs">
                            { selected && <Link to={`/views/${selected}`}>
                                <img alt="Current Graph" src={`/api/views/${selected}/screenshot`} />
                            </Link> }
                        </div>
                        <div className="graphs-list">
                            <h4>Latest Graphs</h4>
                            <hr/>
                            { data.map((item, i) => (
                                <li key={i}>
                                    <Link
                                        to={ `/views/${item.id}` }
                                        className={"link" + (selected === item.id ? " color-brand-2" : "")}
                                        title={ item.description || undefined }
                                        onMouseEnter={() => setSelected(item.id)}
                                    >
                                        { item.name }
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link to="/views/?view=column&group=subscription" className="link"><b className="color-brand-2">Browse All...</b></Link>
                            </li>
                        </div>
                    </div>
                )
            }}
        </EndpointListWrapper>
    )
}

function Subscriptions() {
    return <EndpointListWrapper endpoint="/api/requests?order=updatedAt:desc&limit=5">
        { (data: app.DataSite[]) => {
            return (
                <div className="card subscriptions">
                    <h4><i className="icon fa-solid fa-database" /> Data Subscriptions</h4>
                    <hr/>
                    { data.map((item, i) => (
                        <li key={i}>
                            <Link
                                to={`/requests/${ item.id }`}
                                className="link"
                                title={ item.description?.replace(/<.*?>/g, "") }
                            >
                                { item.name }
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link to="/requests/" className="link"><b className="color-brand-2">Browse All...</b></Link>
                    </li>
                </div>
            )
        }}
    </EndpointListWrapper>
}

function Sites() {
    return <EndpointListWrapper endpoint="/api/data-sites?order=updatedAt:desc&limit=5">
        { (data: app.DataSite[]) => {
            return (
                <div className="card sites">
                    <h4><i className="icon fa-solid fa-location-dot" /> Healthcare Sites</h4>
                    <hr/>
                    { data.map((item, i) => (
                        <li key={i}>
                            <Link
                                to={`/sites/${ item.id }`}
                                className="link"
                                title={ item.description || undefined }
                            >
                                { item.name }
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link to="/sites/" className="link"><b className="color-brand-2">Browse All...</b></Link>
                    </li>
                </div>
            )
        }}
    </EndpointListWrapper>
}


