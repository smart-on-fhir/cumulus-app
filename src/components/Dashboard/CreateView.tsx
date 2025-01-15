import { useCallback } from "react"
import { useLocation, useParams }   from "react-router"
import Dashboard       from "."
import { request }     from "../../backend"
import { useBackend }  from "../../hooks"
import { AlertError }  from "../generic/Alert"
import Loader          from "../generic/Loader"
import { app }         from "../../types"
import { useAuth }     from "../../auth"


export default function CreateView()
{
    // The subscription ID from the URL params
    const { id } = useParams();

    const { user } = useAuth()

    const location = useLocation()

    const state: any = location.state

    // Fetch the subscription by ID
    const { loading, error, result } = useBackend<app.Subscription>(
        useCallback(() => request("/api/requests/" + id + "?group=true&study_areas=true"), [id]),
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
    return <Dashboard
        view={{
            creatorId: user!.id,
            isDraft: true,
            name: state?.name || "",
            description: state?.description || "",
            settings: {
                column: state?.column || "",
                viewType: state?.chartType || "spline",
                filters: [],
                groupBy: "",
                // sortBy: state?.chartType === "bar" ? "y:desc" : "x:asc",
                chartOptions: {
                    title: {
                        text: state?.description || state?.name || "",                        
                    },
                    // subtitle: {
                    //     text: state?.description || "",
                    // }
                }
            }
        }}
        subscription={result as app.Subscription}
    />
}