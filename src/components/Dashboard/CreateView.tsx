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
    // The Data Source ID from the URL params
    const { id } = useParams();

    const { user } = useAuth()

    const location = useLocation()

    const state: any = location.state

    // Fetch the Data Source by ID
    const { loading, error, result } = useBackend<app.Subscription>(
        useCallback(() => request("/api/requests/" + id + "?group=true&study_areas=true"), [id]),
        true
    );

    // Show loader whole the Data Source is being loaded
    if (loading) {
        return <Loader msg="Loading Data Source..." />
    }

    // If the Data Source failed to load exit with an error message
    if (error) {
        return <AlertError>{`Error fetching Data Source with id "${id}": ${error}`}</AlertError>
    }

    // If the Data Source request was successful but did not return the expected data exit with an error message
    if (!result) {
        return <AlertError>{`Fetching Data Source with id "${id}" produced empty response`}</AlertError>
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
                limit: state?.limit || 0,
                chartOptions: {
                    title: {
                        text: state?.name || "",                        
                    },
                    yAxis: {
                        title: {
                            text: state?.countLabel || ""
                        }
                    }
                }
            }
        }}
        subscription={result as app.Subscription}
    />
}