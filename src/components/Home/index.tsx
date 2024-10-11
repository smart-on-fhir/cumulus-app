import { useCallback, useState }  from "react"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import EndpointListWrapper        from "../generic/EndpointListWrapper"
import Loader                     from "../generic/Loader"
import { AlertError }             from "../generic/Alert"
import StudyAreaCard              from "../StudyAreas/Card"
import { useAuth }                from "../../auth"
import { app }                    from "../../types"
import { useBackend }             from "../../hooks"
import { request }                from "../../backend"
import Aggregator                 from "../../Aggregator"
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
                <StudyAreas />
                <Graphs />
                <SubscriptionsAndSites />
            </div>
        </>
    )
}

function StudyAreas() {
    const { user } = useAuth();
    const canCreate = user?.permissions.includes("StudyAreas.create")
    return (
        <EndpointListWrapper endpoint="/api/study-areas?order=updatedAt:desc">
            { (data: app.StudyArea[]) => {
                if (!data.length) {
                    return <div className="study-areas center card">
                        <div>
                        <p>No Study Areas found in the database.</p>
                        { canCreate && <div className="mt-1 mb-1">
                            <Link to="/study-areas/new" className="link bold color-green">
                                <i className="fa-solid fa-circle-plus" /> Create Study Area
                            </Link>
                        </div> }
                        </div>
                    </div>
                }
                return (
                    <div className="study-areas">
                        { data.map((model, i) => (
                            <StudyAreaCard key={i} model={model} short />
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
        <EndpointListWrapper endpoint="/api/views?order=updatedAt:desc&limit=7&attributes=id,name,description,updatedAt">
            { (data: app.StudyArea[]) => {

                if (!selected && data.length) {
                    setTimeout(() => setSelected(data[0].id))
                }
                
                return (
                    <div className="graphs-row card">
                        <div className="graphs">
                            { data.length ? !!selected && <Link to={`/views/${selected}`}>
                                <img alt="Current Graph" src={`/api/views/${selected}/screenshot`} />
                            </Link> : <p className="color-muted center">No preview available</p> }
                        </div>
                        <div className="graphs-list">
                            <h4>Latest Graphs</h4>
                            <hr/>
                            { data.length ?
                                <>
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
                                </> :
                                <p>
                                    No Graphs found in the database. You can start by selecting one of the
                                    existing <Link to="requests" className="link">subscriptions</Link> and
                                    then you can create new graph from it's data.
                                </p>
                            }
                        </div>
                    </div>
                )
            }}
        </EndpointListWrapper>
    )
}

function SubscriptionsAndSites() {

    const fetchData = useCallback(async () => {
        return Promise.all([
            request("/api/requests?order=updatedAt:desc&attributes=id,name,description,dataURL"),
            request("/api/data-sites?order=updatedAt:desc&limit=5&attributes=id,name,description"),
            Aggregator.getPackages()
        ]).then(async ([subscriptions, sites]) => {
            let toUpdate = 0
            let toDelete = 0
            for (const sub of subscriptions) {
                if (sub.dataURL) {
                    const id = await Aggregator.getLatestPackageId(sub.dataURL)
                    if (id === "") {
                        toDelete++
                    }
                    if (id && id !== sub.dataURL) {
                        toUpdate++
                    }
                }
            }
            return { subscriptions, sites, toDelete, toUpdate }
        })
    }, [])

    const { error, loading, result } = useBackend<{
        subscriptions: app.Subscription[]
        sites        : app.DataSite[]
        toDelete     : number
        toUpdate     : number
    }>(fetchData, true);

    if (loading) {
        return <Loader />
    }

    if (error) {
        return <AlertError>{ error }</AlertError>
    }

    if (!result) {
        return <AlertError>Failed fetching data</AlertError>
    }

    const { subscriptions, sites, toDelete, toUpdate } = result

    return (
        <>
            <UpdateCheck toDelete={toDelete} toUpdate={toUpdate} />
            <Subscriptions data={subscriptions.slice(0, 5)} />
            <Sites data={sites} />
        </>
    )
}

function UpdateCheck({ toDelete, toUpdate }: { toDelete: number, toUpdate: number }) {
    if (!toDelete && !toUpdate) {
        return null
    }
    return (
        <div className="sync-notes card">
            <table>
                <tbody>
                    { toUpdate > 0 && <tr>
                        <td style={{ width: "1.5em" }}><i className="fas fa-info-circle color-orange" /></td>
                        <td>{toUpdate} subscription{toUpdate > 1 ? "s" : ""} can be updated to newer version</td>
                    </tr> }
                    { toDelete > 0 && <tr>
                        <td style={{ width: "1.5em" }}><i className="fas fa-times-circle color-red" /></td>
                        <td>{toDelete} subscription{toDelete > 1 ? "s are" : " is"} connected to data package{toDelete > 1 ? "s" : ""} that no longer exist</td>
                    </tr> }
                </tbody>
            </table>
        </div>
    )
}

function Subscriptions({ data }: { data: app.Subscription[] }) {
    const { user } = useAuth();
    const canCreate = user?.permissions.includes("Subscriptions.create")
    return (
        <div className="card subscriptions">
            <h4><i className="icon fa-solid fa-database" /> Subscriptions</h4>
            <hr/>
            { data.length ? 
                <>
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
                </> :
                <div>
                    <p>No Subscriptions found in the database.</p>
                    { canCreate && <div className="center mt-1 mb-1">
                        <Link to="/sites/new" className="link bold color-green">
                            <i className="fa-solid fa-circle-plus" /> Create Subscription
                        </Link>
                    </div> }
                </div>
            }
        </div>
    )
}

function Sites({ data }: { data: app.DataSite[] }) {
    
    const { user } = useAuth();
    const canCreate = user?.permissions.includes("DataSites.create")

    return (
        <div className="card sites">
            <h4><i className="icon fa-solid fa-location-dot" /> Healthcare Sites</h4>
            <hr/>
            
            { data.length ?
                <>
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
                </> : 
                    <div>
                        <p>No Healthcare Sites found in the database.</p>
                        { canCreate && <div className="center mt-1 mb-1">
                            <Link to="/sites/new" className="link bold color-green">
                                <i className="fa-solid fa-circle-plus" /> Create Healthcare Site
                            </Link>
                        </div> }
                    </div>
            }
        </div>
    )
}


