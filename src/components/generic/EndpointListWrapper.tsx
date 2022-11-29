import { useCallback }            from "react"
import { Helmet, HelmetProvider } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import { request }                from "../../backend"
import { useBackend }             from "../../hooks"
import { AlertError }             from "./Alert"
import Breadcrumbs                from "./Breadcrumbs"
import Loader                     from "./Loader"


export default function EndpointListWrapper({
    endpoint,
    children
}: {
    endpoint: string
    children: (data: any) => JSX.Element
})
{
    let { result: data, loading, error } = useBackend(
        useCallback(signal => request(endpoint, { signal }), [endpoint]),
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

export function createListPage<T = unknown>({
    namePlural,
    endpoint,
    renderList,
    icon = null
}: {
    namePlural  : string
    /** @deprecated */
    nameSingular: string
    endpoint    : string
    icon       ?: JSX.Element | null
    renderList  : (data: T) => JSX.Element
})
{
    return (
        <div className="container">
            <EndpointListWrapper endpoint={ endpoint }>
                {(data: T) => (
                    <>
                        <HelmetProvider>
                            <Helmet>
                                <title>{ namePlural }</title>
                            </Helmet>
                        </HelmetProvider>
                        <Breadcrumbs links={[
                            { name: "Home", href: "/" },
                            { name: namePlural }
                        ]} />
                        <div className="row gap mt-2">
                            { icon && <div className="col col-0 top">
                                <h4>{icon}</h4>
                            </div> }
                            <div className="col middle">
                                <h4>{ namePlural }</h4>
                            </div>
                            <div className="col col-0 right nowrap bottom">
                                <div>
                                    <Link to="new" className="btn btn-virtual">
                                        <b className="color-green">
                                            <i className="fa-solid fa-circle-plus" /> Add Record
                                        </b>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <hr className="mt-05 mb-2" />
                        { renderList(data) }
                    </>
                )}
            </EndpointListWrapper>
        </div>
    )
}