import { useCallback } from "react"
import { Link }        from "react-router-dom"
import DataRequestLink from "./DataRequestLink"
import { AlertError }  from "../generic/Alert"
import Loader          from "../generic/Loader"
import { request }     from "../../backend"
import { useBackend }  from "../../hooks"
import { useAuth } from "../../auth"


function List({
    items,
    href = "/requests/:id"
}: {
    items: app.DataRequest[]
    href?: string
})
{
    return (
        <ul className="icon-list link-list mb-2">
            { items.map((item, i) => {
                return (
                    <li key={i}>
                        <DataRequestLink request={item} href={href} />
                    </li>
                )
            })}
        </ul>
    );
}

export default function DataRequestsList()
{
    const { user } = useAuth();

    const { loading, error, result: groups } = useBackend(
        useCallback(() => request<app.RequestGroup[]>(
            "/api/requests/by-group?groupLimit=4&requestLimit=3"
        ), []),
        true
    );

    if (loading) {
        return <Loader msg="Loading Subscriptions..." />
    }

    if (error) {
        return <AlertError><b>Error Loading Subscriptions: </b>{ error + "" }</AlertError>
    }

    if (!groups || !groups.length) {
        return <>
            <p className="color-muted">No Subscriptions found.</p>
            <br/>
            { user?.permissions.includes("DataRequests.create") && <Link to="/requests/new" className="color-blue underline">Create New Subscription</Link> }
        </>
    }

    return (
        <div>
            { groups?.filter(g => g.requests.length > 0).map((group, i) => (
                <div key={i}>
                    <h6 className="color-brand-2"><i className="fa-regular fa-folder"/> { group.name }</h6>
                    <List items={ group.requests }/>
                </div>
            )) }
        </div>
    )
}
