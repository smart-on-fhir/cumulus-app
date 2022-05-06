import { useCallback } from "react";
import { useParams }   from "react-router";
import Dashboard       from ".";
import { request }     from "../../backend";
import { useBackend }  from "../../hooks";
import { AlertError }  from "../Alert";
import Breadcrumbs     from "../Breadcrumbs";
import Loader          from "../Loader";

export default function EditView()
{
    const { id } = useParams()

    const { loading, error, result } = useBackend(
        useCallback(() => {
            return request("/api/views/" + id).then(view => {
                return request("/api/requests/" + view.DataRequestId + "?includeData=1").then(request => ({
                    request,
                    view
                }));
            })
        }, [id]),
        true
    );

    if (loading) return <Loader/>
    if (error) return <AlertError>{`Error fetching view with id "${id}": ${error}`}</AlertError>

    if (!result) {
        return <AlertError>{`Error fetching subscription with id "${id}": ${error}`}</AlertError>
    }

    if (!result) {
        return <b>Failed to fetch data!</b>
    }

    return (
        <>
            <Breadcrumbs links={[
                { name: "Home" , href: "/" },
                { name: result.view.name }
            ]}/>
            <Dashboard view={ result.view } dataRequest={result.request} />
        </>
    )
}