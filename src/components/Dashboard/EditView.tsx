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
    // The subscription ID from the URL params
    const { id } = useParams()

    // Fetch the subscription by ID
    const { loading, error, result } = useBackend(
        useCallback(() => {
            return request("/api/views/" + id).then(view => {
                return request("/api/requests/" + view.DataRequestId).then(request => ({
                    request,
                    view
                }));
            })
        }, [id]),
        true
    );

    // Show loader whole the subscription is being loaded
    if (loading) {
        return <Loader/>
    }

    // If the subscription failed to load exit with an error message
    if (error) {
        return <AlertError>{`Error fetching view with id "${id}": ${error}`}</AlertError>
    }

     // If the subscription request was successful but did not return the expected data exit with an error message
    if (!result) {
        return <AlertError>{`Fetching subscription with id "${id}" produced empty response`}</AlertError>
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