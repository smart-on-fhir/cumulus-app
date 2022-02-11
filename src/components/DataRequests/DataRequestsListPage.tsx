import { useCallback }   from "react";
import DataRequestLink   from "./DataRequestLink";
import { useBackend }    from "../../hooks";
import { requestGroups } from "../../backend";
import Breadcrumbs       from "../Breadcrumbs";


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

export default function DataRequestsListPage()
{
    const { loading, error, result: groups } = useBackend(
        useCallback(() => requestGroups.getAll("?include=requests:id|name|description|refresh|completed"), []),
        true
    );

    if (loading) {
        return <span>Loading Data Requests...</span>
    }

    if (error) {
        return <span><b>Error Loading Data Requests: </b>{ error + "" }</span>
    }

    return (
        <div>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Requests & Subscriptions" }
            ]} />
            <h3>Data Requests and Subscriptions</h3>
            <hr/>
            <div className="row gap mt-2">
                { groups?.filter(g => g.requests.length > 0).map((group, i) => (
                    <div key={i} className="col col-0 col-5 pb-1">
                        <h5>{ group.name }</h5>
                        <List items={ group.requests }/>
                    </div>
                )) }
            </div>
        </div>
    )
}
