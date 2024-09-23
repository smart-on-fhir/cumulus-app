import { useCallback, useEffect, useMemo, useState }  from "react"
import { Helmet, HelmetProvider } from "react-helmet-async"
import { useNavigate, useParams } from "react-router"
import { Link } from "react-router-dom"
import { request }                from "../../backend"
import { useBackend }             from "../../hooks"
import { AlertError }             from "./Alert"
import Breadcrumbs from "./Breadcrumbs"
import Loader                     from "./Loader"


export default function EndpointDeleteWrapper({
    endpoint,
    query,
    children,
    redirect = ".."
}: {
    endpoint: string
    query?: string
    redirect?: string
    children: (props: {
        loading : boolean
        data    : any
        onSubmit: () => void
        error: Error | string | null
    }) => JSX.Element
})
{
    const { id } = useParams()
    const navigate = useNavigate()
    const [working, setWorking] = useState(false)
    const [saveError, setSaveError] = useState<Error|string|null>(null)
    const abortController = useMemo(() => new AbortController(), [])

    let url = `${endpoint}/${id}`

    if (query) {
        url += "?" + encodeURI(query.replace(/^\?/, ""))
    }

    let { result, loading, error } = useBackend(
        useCallback(signal => request(url, { signal }), [url]),
        true
    )

    function onSubmit() {
        setWorking(true)
        setSaveError(null)
        request(`${endpoint}/${id}`, { method: "DELETE", signal: abortController.signal })
        .then(() => {
            if (!abortController.signal.aborted) {
                navigate(redirect)
            }
        })
        .catch(error => {
            if (!abortController.signal.aborted) {
                setSaveError(error)
                setWorking(false)
            }
        })
    }

    useEffect(() => () => abortController.abort(), [ abortController ]);

    if (loading) {
        return <Loader msg="Loading data..." />
    }

    if (error) {
        return <AlertError>{ error }</AlertError>
    }

    if (!result) {
        return <AlertError>Failed fetching data from the server</AlertError>
    }

    return children({
        loading: working,
        data   : result,
        error  : saveError,
        onSubmit
    })
}

export function createDeletePage<T = unknown>({
    namePlural,
    nameSingular,
    endpoint,
    nameField = "name",
    renderView,
    icon = null,
    query

}: {
    namePlural       : string
    nameSingular     : string
    endpoint         : string
    nameField       ?: string
    query           ?: string
    icon            ?: JSX.Element | null
    renderView       : (data: T) => JSX.Element
})
{
    return (
        <div className="container">
            <EndpointDeleteWrapper endpoint={ endpoint } query={query} redirect="../..">
                {({ loading, data, onSubmit, error }) => {
                    const name = data[nameField as keyof T] + ""
                    return (
                        <>
                            <HelmetProvider>
                                <Helmet>
                                    <title>Delete { nameSingular }</title>
                                </Helmet>
                            </HelmetProvider>
                            <Breadcrumbs links={[
                                { name: "Home"    , href: "/" },
                                { name: namePlural, href: "./../.." },
                                { name: name      , href: "./.." },
                                { name: "Delete " + nameSingular }
                            ]} />
                            <h1 className="color-brand-2 center mt-2 mb-2">Please Confirm!</h1>
                            { error && <AlertError>{ error }</AlertError> }
                            <div className="panel panel-danger bg-white mt-1">
                                <div className="row gap">
                                    <div className="col col-0">
                                        <h4>{icon}</h4>
                                    </div>
                                    <div className="col">
                                        <h4>{ data.name }</h4>
                                    </div>
                                </div>
                                <hr/>
                                <div className="mb-2 mt-05">
                                    <i className="nowrap mr-1">
                                        <span className="color-muted">Created: </span>
                                        <span className="color-brand-2">{ new Date(data.createdAt).toLocaleString() }</span>
                                    </i>
                                    { " " }
                                    <i className="nowrap">
                                        <span className="color-muted">Updated: </span>
                                        <span className="color-brand-2">{ new Date(data.updatedAt).toLocaleString() }</span>
                                    </i>
                                </div>
                                { renderView(data) }
                            </div>
                            <div className="center pt-2 pb-1">
                                <Link style={{ minWidth: "12em" }} className="btn pl-2 pr-2 mr-1 color-green" to="..">Cancel</Link>
                                <button style={{ minWidth: "12em" }} className="btn btn-brand-2 pl-2 pr-2" onClick={() => onSubmit()} disabled={loading}>
                                    Delete{ loading && <>&nbsp;<Loader msg="" /></> }
                                </button>
                            </div>                            
                        </>
                    )
                }}
            </EndpointDeleteWrapper>
        </div>
    )
}
