import { useCallback, useEffect, useMemo, useState }  from "react"
import { Helmet, HelmetProvider } from "react-helmet-async"
import { useNavigate, useParams } from "react-router"
import { Link } from "react-router-dom"
import { request }                from "../../backend"
import { useBackend }             from "../../hooks"
import { AlertError }             from "./Alert"
import Breadcrumbs                from "./Breadcrumbs"
import Loader                     from "./Loader"


export default function EndpointEditWrapper({
    endpoint,
    query,
    children
}: {
    endpoint: string
    query?: string
    children: (props: {
        loading : boolean
        data    : any
        onSubmit: (data: any) => void
        error: Error | string | null
    }) => JSX.Element
})
{
    const { id } = useParams()
    const navigate = useNavigate()
    const [saving, setSaving] = useState(false)
    const [saveError  , setSaveError] = useState<Error|string|null>(null)
    const abortController = useMemo(() => new AbortController(), [])

    let url = `${endpoint}/${id}`

    if (query) {
        url += "?" + encodeURI(query.replace(/^\?/, ""))
    }

    let { result, loading, error } = useBackend(
        useCallback(signal => request(url, { signal }), [url]),
        true
    )

    function onSubmit(data: Record<string, any>) {
        setSaving(true)
        setSaveError(null)
        request(`${endpoint}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "content-type": "application/json" },
            signal: abortController.signal
        })
        .then(() => {
            if (!abortController.signal.aborted) {
                navigate("..")
            }
        })
        .catch(error => {
            if (!abortController.signal.aborted) {
                setSaveError(error)
                setSaving(false)
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
        loading: saving,
        data   : result,
        error  : saveError,
        onSubmit
    })
}

export function createEditPage<T = unknown>({
    nameSingular,
    namePlural,
    endpoint,
    nameField = "name",
    renderForm
}: {
    nameSingular     : string
    namePlural       : string
    endpoint         : string
    /** @deprecated */
    basePath         : string
    /** @deprecated */
    primaryKeyField ?: string
    nameField       ?: string
    renderForm       : (props: {
        loading : boolean
        data    : T
        onSubmit: (data: Partial<T>) => void
    }) => JSX.Element
})
{
    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>Edit { nameSingular }</title>
                </Helmet>
            </HelmetProvider>
            <EndpointEditWrapper endpoint={ endpoint }>
                {({ data, error, loading, onSubmit }) => (
                    <>
                        <Breadcrumbs links={[
                            { name: "Home", href: "/" },
                            { name: namePlural, href: "./../.." },
                            { name: data[nameField], href: "./.." },
                            { name: "Edit " + nameSingular }
                        ]} />
                        <div className="row gap mt-2">
                            <div className="col middle">
                                <h4><i className="fa-solid fa-pen-to-square color-brand-2" /> Edit { nameSingular }</h4>
                            </div>
                            <div className="col col-0 right nowrap middle">
                                <div>
                                    <Link to="../delete" className="btn btn-virtual" title="Delete">
                                        <i className="fa-solid fa-trash-can color-blue" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <hr className="mb-1" />
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
                        { error && <AlertError>{ error }</AlertError> }
                        { renderForm({ data: data as T, onSubmit, loading }) }
                    </>
                )}
            </EndpointEditWrapper>
        </div>
    )
}

