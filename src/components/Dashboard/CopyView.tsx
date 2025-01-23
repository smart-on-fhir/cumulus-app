import { useCallback }            from "react"
import { useLocation, useParams } from "react-router"
import Dashboard                  from "."
import { useAuth }                from "../../auth"
import { request }                from "../../backend"
import { useBackend }             from "../../hooks"
import { app }                    from "../../types"
import { AlertError }             from "../generic/Alert"
import Loader                     from "../generic/Loader"


export default function CopyView()
{
    // The Data Source ID from the URL params
    const { id } = useParams()

    const { state } = useLocation()

    const { user } = useAuth()

    // Fetch the Data Source by ID
    const { loading, error, result: view } = useBackend<app.View>(
        useCallback(() => {
            return request("/api/views/" + id + "?tags=true&subscription=true&group=true&study_areas=true");
        }, [id]),
        true
    );

    // Show loader whole the Data Source is being loaded
    if (loading) {
        return <Loader/>
    }

    // If the Data Source failed to load exit with an error message
    if (error) {
        return <AlertError>{`Error fetching graph with id "${id}": ${error}`}</AlertError>
    }

     // If the Data Source request was successful but did not return the expected data exit with an error message
    if (!view) {
        return <AlertError>{`Fetching graph with id "${id}" produced empty response`}</AlertError>
    }

    // @ts-ignore
    if (state?.view) {
        // @ts-ignore
        Object.assign(view, state.view)
    }

    view.name = view.name!.replace(/(\s*\(copy\)\s*)?$/, " (copy)")
    // @ts-ignore
    delete view.id
    view.creatorId = user!.id // change ownership
    view.isDraft = true // Start as draft

    // @ts-ignore
    return <Dashboard copy view={view} subscription={view.Subscription} />
}