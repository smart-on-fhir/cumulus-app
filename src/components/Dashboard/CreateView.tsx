import { useCallback } from "react";
import { useParams }   from "react-router";
import Dashboard       from ".";
import { request }     from "../../backend";
import { useBackend }  from "../../hooks";
import { AlertError }  from "../Alert";
import Breadcrumbs     from "../Breadcrumbs";
import Loader          from "../Loader";


export default function CreateView()
{
    const { id } = useParams();

    const { loading, error, result } = useBackend(
        useCallback(() => request("/api/requests/" + id + "?includeData=1"), [id]),
        true
    );

    if (loading) {
        return <Loader msg="Loading Request..." />
    }

    if (error) {
        return <AlertError>{`Error fetching request with id "${id}": ${error}`}</AlertError>
    }

    if (!result) {
        return <AlertError>{`Error fetching request with id "${id}"`}</AlertError>
    }

    return (
        <>
            <Breadcrumbs links={[
                { name: "Home" , href: "/" },
                { name: "Create New View" }
            ]}/>
            <Dashboard view={{}} dataRequest={result as app.DataRequest} />
        </>
    )
}