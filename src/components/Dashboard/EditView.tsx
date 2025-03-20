import { useCallback }             from "react"
import { useParams }               from "react-router"
import Dashboard                   from "."
import { AlertError }              from "../generic/Alert"
import Loader                      from "../generic/Loader"
import { request }                 from "../../backend"
import { useBackend }              from "../../hooks"
import aggregator, { DataPackage } from "../../Aggregator"
import { app }                     from "../../types"


export default function EditView({ id }: { id?: number })
{
    // The subscription ID from the URL params
    const params = useParams()

    id = id || +params.id!

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

    // Show loader while the subscription is being loaded
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

    return <Dashboard view={result.view} subscription={result.view.Subscription as any} dataPackage={result.pkg} />
}