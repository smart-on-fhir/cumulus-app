import { useCallback }   from "react";
import DataRequestLink   from "./DataRequestLink";
import { useBackend }    from "../../hooks";
import { requestGroups } from "../../backend";
import { AlertError } from "../Alert";
import Loader from "../Loader";


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
    const { loading, error, result: groups } = useBackend(
        useCallback(() => requestGroups.getAll(
            "?include=requests:id|name|description|refresh|completed"
            + "&order=name:asc&limit=4,requests:2"
        ), []),
        true
    );

    if (loading) {
        return <Loader msg="Loading Data Requests..." />
    }

    if (error) {
        return <AlertError><b>Error Loading Data Requests: </b>{ error + "" }</AlertError>
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
