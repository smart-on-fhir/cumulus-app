import { Link }      from "react-router-dom"
import Breadcrumbs   from "./Breadcrumbs"
import Prefetch      from "./Prefetch"
import { ReactNode } from "react"


export default function createListPage<T = unknown>({
    namePlural,
    endpoint,
    renderList,
    icon = null,
    canCreate = true,
    baseUrl = "."
}: {
    namePlural   : string
    /** @deprecated */
    nameSingular?: string
    endpoint     : string
    icon        ?: ReactNode
    renderList   : (data: T) => ReactNode
    canCreate   ?: boolean
    baseUrl     ?: string
})
{
    return (
        <div className="container">
            <Prefetch path={ endpoint }>
                {(data: T) => (
                    <>
                        <title>{ namePlural }</title>
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
                            { canCreate && <div className="col col-0 right nowrap bottom">
                                <div>
                                    <Link to={ baseUrl + "/new" } className="btn btn-virtual">
                                        <b className="color-green">
                                            <i className="fa-solid fa-circle-plus" /> Add Record
                                        </b>
                                    </Link>
                                </div>
                            </div> }
                        </div>
                        <hr className="mt-05 mb-2" />
                        { renderList(data) }
                    </>
                )}
            </Prefetch>
        </div>
    )
}