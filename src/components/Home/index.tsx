import { useEffect, useState }       from "react"
import { HelmetProvider, Helmet }    from "react-helmet-async"
import { Link }                      from "react-router-dom"
import { useAuth }                   from "../../auth"
import { app }                       from "../../types"
import Aggregator, { useAggregator } from "../../Aggregator"
import Terminology                   from "../../Terminology"
import { sortBy }                    from "../../utils"
import StudyAreaCard                 from "../StudyAreas/Card"
import Prefetch                      from "../generic/Prefetch"
import Loader                        from "../generic/Loader"
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
        <Prefetch path="/api/study-areas?order=updatedAt:desc">
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
        </Prefetch>
    )
}

function Graphs() {

    const [selected, setSelected] = useState(0)

    return (
        <Prefetch path="/api/views?order=updatedAt:desc&limit=7&attributes=id,name,description,updatedAt">
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
                            <h4>
                                <span className="icon material-symbols-outlined">{Terminology.graph.icon}</span>Latest Graphs
                            </h4>
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
                                            <span className="icon material-symbols-outlined">{Terminology.graph.icon}</span>{ item.name }
                                        </Link>
                                    </li>
                                ))}
                                <br />
                                <Link to="/views/?view=column&group=subscription" className="link"><b className="color-brand-2">Browse All...</b></Link>
                                </> :
                                <p>
                                    No Graphs found in the database. You can start by selecting one of the
                                    existing <Link to="requests" className="link">{Terminology.subscription.namePlural}</Link> and
                                    then you can create new graph from it's data.
                                </p>
                            }
                        </div>
                    </div>
                )
            }}
        </Prefetch>
    )
}

function SubscriptionsAndSites() {
    return <Prefetch path="/api/requests?order=updatedAt:desc&attributes=id,name,description,dataURL">{subscriptions => (
        <>
            <UpdateCheck subscriptions={subscriptions} />
            <Subscriptions data={subscriptions.slice(0, 5)} />
            <Sites />
        </>
    )}</Prefetch>
}

function UpdateCheck({ subscriptions }: { subscriptions: app.Subscription[] }) {

    const { aggregator } = useAggregator()

    const [toUpdate, setToUpdate] = useState(0)
    const [toDelete, setToDelete] = useState(0)

    useEffect(() => {
        
        aggregator.initialize().then(async () => {
            let _toUpdate = 0
            let _toDelete = 0
            for (const sub of subscriptions) {
                if (sub.dataURL) {
                    const id = await Aggregator.getLatestPackageId(sub.dataURL)
                    if (id === "") {
                        _toDelete++
                    }
                    if (id && id !== sub.dataURL) {
                        _toUpdate++
                    }
                }
            }
            setToUpdate(_toUpdate)
            setToDelete(_toDelete)
        }).catch(() => {})
    }, [ aggregator, subscriptions ])

    if (!toDelete && !toUpdate) {
        return null
    }

    return (
        <div className="sync-notes card">
            <table>
                <tbody>
                    { toUpdate > 0 && <tr>
                        <td style={{ width: "1.5em" }}><i className="fas fa-info-circle color-orange" /></td>
                        <td>{toUpdate} {
                            toUpdate > 1 ?
                                Terminology.subscription.namePlural :
                                Terminology.subscription.nameSingular
                            } can be updated to newer version</td>
                    </tr> }
                    { toDelete > 0 && <tr>
                        <td style={{ width: "1.5em" }}><i className="fas fa-times-circle color-red" /></td>
                        <td>{toDelete} {
                            toDelete > 1 ?
                                Terminology.subscription.namePlural + " are" :
                                Terminology.subscription.nameSingular + " is"
                            } connected to data package{toDelete > 1 ? "s" : ""} that no longer exist</td>
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
            <h4>
                <span className="icon material-symbols-outlined">{Terminology.subscription.icon}</span>{Terminology.subscription.namePlural}
            </h4>
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
                                <span className="icon material-symbols-outlined">{Terminology.subscription.icon}</span>{ item.name }
                            </Link>
                        </li>
                    ))}
                    <br/>
                    <Link to="/requests/" className="link"><b className="color-brand-2">Browse All...</b></Link>
                </> :
                <div>
                    <p>No {Terminology.subscription.namePlural} found in the database.</p>
                    { canCreate && <div className="center mt-1 mb-1">
                        <Link to="/sites/new" className="link bold color-green">
                            <i className="fa-solid fa-circle-plus" /> Create {Terminology.subscription.nameSingular}
                        </Link>
                    </div> }
                </div>
            }
        </div>
    )
}

function Sites() {

    const { aggregator, status, error: aggregatorError } = useAggregator()

    const [sites  , setSites  ] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error  , setError  ] = useState<Error | string | null>(null)

    useEffect(() => {    
        if (status === "failed") {
            setError("Failed to connect to the aggregator")
        }
        else if (status === "offline") {
            setError("Aggregator is not enabled")
        }
        else if (aggregatorError) {
            setError(aggregatorError)
        }
        else {
            setLoading(true)
            aggregator.initialize()
            .then(() => aggregator.getSites())
            .then(_sites => sortBy(_sites, "name"))
            .then(_sites => setSites(_sites))
            .finally(() => setLoading(false))
            .catch(setError);
        }
    }, [ aggregator, aggregatorError, status ])


    return (
        <div className="card sites">
            <h4><span className="icon material-symbols-outlined">{Terminology.site.icon}</span>{Terminology.site.namePlural}</h4>
            <hr/>
            { loading ?
                <Loader /> :
                error ?
                    <pre>{ error + "" }</pre> :
                    sites.length === 0 ?
                        "No sites found" :
                        <>
                        { sites.slice(0, 5).map((s, i) => (
                            <li key={i}>
                                <span className="icon material-symbols-outlined">{Terminology.site.icon}</span>
                                <Link
                                    to={`/sites/${ s.id }`}
                                    className="link"
                                    title={ s.description || undefined }
                                >
                                    { s.name }
                                </Link>
                            </li>
                        )) }
                        <br />
                        <Link to="/sites/" className="link"><b className="color-brand-2">Browse All...</b></Link>
                        </>

            }
        </div>
    )
}


