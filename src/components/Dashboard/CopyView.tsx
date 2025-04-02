import { useCallback }             from "react"
import { useLocation, useParams }  from "react-router-dom"
import Dashboard                   from "."
import { AlertError }              from "../generic/Alert"
import Loader                      from "../generic/Loader"
import { useAuth }                 from "../../auth"
import { request }                 from "../../backend"
import { useBackend }              from "../../hooks"
import { app }                     from "../../types"
import aggregator, { DataPackage } from "../../Aggregator"


export default function CopyView()
{
    // The subscription ID from the URL params
    const { id } = useParams()

    const { state } = useLocation()

    const { user } = useAuth()

    // Fetch the view and it's package (if any)
    const { loading, error, result } = useBackend<{ view: app.View, pkg?: DataPackage }>(
        useCallback(() => {
            return request<app.View>("/api/views/" + id + "?tags=true&subscription=true&group=true&study_areas=true").then(view => {
                if (view.packageId) {
                    return aggregator.getPackage(view.packageId).then(pkg => ({ view, pkg }))
                }
                return { view }
            });
        }, [id]),
        true
    );

    // Show loader whole the subscription is being loaded
    if (loading) {
        return <Loader/>
    }

    // If the subscription failed to load exit with an error message
    if (error) {
        return <AlertError>{`Error fetching graph with id "${id}": ${error}`}</AlertError>
    }

     // If the subscription request was successful but did not return the expected data exit with an error message
    if (!result?.view) {
        return <AlertError>{`Fetching graph with id "${id}" produced empty response`}</AlertError>
    }

    const { view, pkg } = result

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

    return <Dashboard copy view={view} subscription={view.Subscription} dataPackage={pkg} />
}