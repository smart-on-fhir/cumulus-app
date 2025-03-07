import { useCallback } from "react";
import { useParams }   from "react-router";
import Dashboard       from ".";
import { request }     from "../../backend";
import { useBackend }  from "../../hooks";
import { AlertError }  from "../generic/Alert";
import Loader          from "../generic/Loader";

export default function EditView({ id }: { id?: number })
{
    // The subscription ID from the URL params
    const params = useParams()

    id = id || +params.id!

    // Fetch the subscription by ID
    const { loading, error, result: view } = useBackend(
        useCallback(() => {
            return request("/api/views/" + id + "?tags=true&subscription=true&group=true&study_areas=true");
        }, [id]),
        true
    );

    // Show loader while the subscription is being loaded
    if (loading) {
        return <Loader/>
    }

    // If the subscription failed to load exit with an error message
    if (error) {
        return <AlertError>{`Error fetching graph with id "${id}": ${error}`}</AlertError>
    }

     // If the subscription request was successful but did not return the expected data exit with an error message
    if (!view) {
        return <AlertError>{`Fetching graph with id "${id}" produced empty response`}</AlertError>
    }

    return <Dashboard view={view} subscription={view.Subscription} />
}