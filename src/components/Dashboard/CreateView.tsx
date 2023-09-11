import { useCallback } from "react"
import { useParams }   from "react-router"
import Dashboard       from "."
import { request }     from "../../backend"
import { useBackend }  from "../../hooks"
import { AlertError }  from "../generic/Alert"
import Breadcrumbs     from "../generic/Breadcrumbs"
import Loader          from "../generic/Loader"
import { app }         from "../../types"


export default function CreateView()
{
    // The subscription ID from the URL params
    const { id } = useParams();

    // Fetch the subscription by ID
    const { loading, error, result } = useBackend(
        useCallback(() => request("/api/requests/" + id), [id]),
        true
    );

    // Show loader whole the subscription is being loaded
    if (loading) {
        return <Loader msg="Loading subscription..." />
    }

    // If the subscription failed to load exit with an error message
    if (error) {
        return <AlertError>{`Error fetching subscription with id "${id}": ${error}`}</AlertError>
    }

    // If the subscription request was successful but did not return the expected data exit with an error message
    if (!result) {
        return <AlertError>{`Fetching subscription with id "${id}" produced empty response`}</AlertError>
    }

    // Eventually render a Breadcrumbs and the dashboard
    return (
        <div className="container">
            <Breadcrumbs links={[
                { name: "Home" , href: "/" },
                { name: "Create New Graph" }
            ]}/>
            <Dashboard view={{}} dataRequest={result as app.DataRequest} />
        </div>
    )
}