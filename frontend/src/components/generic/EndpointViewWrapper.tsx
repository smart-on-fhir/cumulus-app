
import { useCallback } from "react"
import { Helmet, HelmetProvider } from "react-helmet-async"
import { useParams }   from "react-router"
import { Link } from "react-router-dom"
import { request }     from "../../backend"
import { useBackend }  from "../../hooks"
import { AlertError }  from "./Alert"
import Breadcrumbs from "./Breadcrumbs"
import Loader          from "./Loader"


export default function EndpointViewWrapper({
    endpoint,
    query,
    children
}: {
    endpoint: string
    query?: string
    children: (data: any) => JSX.Element
})
{
    const { id } = useParams()

    let url = `${endpoint}/${id}`

    if (query) {
        url += "?" + encodeURI(query.replace(/^\?/, ""))
    }
    
    let { result: data, loading, error } = useBackend(
        useCallback(signal => request(url, { signal }), [url]),
        true
    )

    if (loading) {
        return <Loader msg="Loading data..." />
    }

    if (error) {
        return <AlertError>{ error }</AlertError>
    }

    if (!data) {
        return <AlertError>Failed fetching data from the server</AlertError>
    }

    return children(data)
}

export function createViewPage<T extends { createdAt: string, updatedAt: string }>({
    namePlural,
    endpoint,
    basePath,
    nameField = "name",
    renderView,
    icon = null,
    canUpdate = true,
    canDelete = true,
    query
}: {
    namePlural  : string
    endpoint    : string
    basePath    : string
    nameField  ?: string
    query      ?: string
    icon       ?: JSX.Element | null
    renderView  : (data: T) => JSX.Element
    canUpdate  ?: boolean
    canDelete  ?: boolean
})
{
    return (
        <div className="container">
            <EndpointViewWrapper endpoint={ endpoint } query={ query }>
                {(data: T) => {
                    const name = data[nameField as keyof T] + ""
                    return (
                        <>
                            <HelmetProvider>
                                <Helmet>
                                    <title>{ name }</title>
                                </Helmet>
                            </HelmetProvider>
                            <Breadcrumbs links={[
                                { name: "Home", href: "/" },
                                { name: namePlural, href: basePath },
                                { name }
                            ]} />
                            <div className="row gap mt-2">
                                { icon && <div className="col col-0 top">
                                    <h4>{icon}</h4>
                                </div> }
                                <div className="col middle">
                                    <h4>{ name }</h4>
                                </div>
                                { (canUpdate || canDelete) && <div className="col col-0 right nowrap middle">
                                    <div>
                                        { canUpdate && <Link to="./edit" className="btn btn-virtual">
                                            <i className="fa-solid fa-pen-to-square color-blue" title="Edit" />
                                        </Link> }
                                        { canDelete && <Link to="./delete" className="btn btn-virtual" title="Delete">
                                            <i className="fa-solid fa-trash-can color-blue" />
                                        </Link> }
                                    </div>
                                </div> }
                            </div>
                            <hr className="mb-1" />
                            <div className="mb-2">
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
                        </>
                    )
                }}
            </EndpointViewWrapper>
        </div>
    )
}