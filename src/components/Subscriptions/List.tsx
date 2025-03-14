import { useCallback }  from "react"
import Link             from "../Link"
import SubscriptionLink from "./SubscriptionLink"
import { AlertError }   from "../generic/Alert"
import Loader           from "../generic/Loader"
import { request }      from "../../backend"
import { useBackend }   from "../../hooks"
import { useAuth }      from "../../auth"
import { app }          from "../../types"
import Terminology      from "../../Terminology"


function List({
    items,
    href = "/requests/:id"
}: {
    items: app.Subscription[]
    href?: string
})
{
    return (
        <ul className="icon-list link-list mb-2">
            { items.map((item, i) => {
                return (
                    <li key={i}>
                        <SubscriptionLink request={item} href={href} />
                    </li>
                )
            })}
        </ul>
    );
}

export default function SubscriptionsList()
{
    const { user } = useAuth();

    const { loading, error, result: groups } = useBackend(
        useCallback(() => request<app.SubscriptionGroup[]>(
            "/api/requests/by-group?groupLimit=4&requestLimit=3"
        ), []),
        true
    );

    if (loading) {
        return <Loader msg={`Loading ${Terminology.subscription.namePlural}...`} />
    }

    if (error) {
        return <AlertError><b>Error Loading {Terminology.subscription.namePlural}: </b>{ error + "" }</AlertError>
    }

    if (!groups || !groups.length) {
        return <>
            <p className="color-muted">No {Terminology.subscription.namePlural} found.</p>
            <br/>
            { user?.permissions.includes("Subscriptions.create") && <Link to="/requests/new" className="color-blue underline">Create New {Terminology.subscription.nameSingular}</Link> }
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
