import { useCallback } from "react"
import { useLocation, useParams } from "react-router-dom"
import Dashboard       from "."
import { request }     from "../../backend"
import { useBackend }  from "../../hooks"
import { AlertError }  from "../generic/Alert"
import Loader          from "../generic/Loader"
import { app }         from "../../types"
import { useAuth }     from "../../auth"
import Terminology     from "../../Terminology"
import aggregator, { DataPackage } from "../../Aggregator"


export default function CreateView()
{
    // The subscription ID from the URL params
    const { id = "" } = useParams();

    const { user } = useAuth()

    const location = useLocation()

    const state: any = location.state

    // Fetch the subscription or package
    const { loading, error, result } = useBackend<[DataPackage | null | undefined, app.Subscription | null]>(
        useCallback(() => {
            return Promise.all([
                isNaN(+id) ? aggregator.getPackage(id) : Promise.resolve(null),
                isNaN(+id) ? Promise.resolve(null) : request("/api/requests/" + id + "?group=true&study_areas=true"),
            ])
        }, [id]),
        true
    );

    // Show loader whole the subscription is being loaded
    if (loading) {
        return <Loader msg={`Loading ${Terminology.subscription.nameSingular}...`} />
    }

    // If the subscription failed to load exit with an error message
    if (error) {
        return <AlertError>{`Error fetching ${Terminology.subscription.nameSingular} with id "${id}": ${error}`}</AlertError>
    }

    // If the subscription request was successful but did not return the expected data exit with an error message
    if (!result) {
        return <AlertError>{`Failed fetching data for id=${Terminology.subscription.nameSingular}`}</AlertError>
    }

    // Eventually render a Breadcrumbs and the dashboard
    return <Dashboard
        view={{
            creatorId  : user!.id,
            isDraft    : true,
            name       : state?.name        || "",
            description: state?.description || "",
            settings: {
                column  : state?.column    || "",
                viewType: state?.chartType || "spline",
                sortBy  : state?.sortBy    || "x:asc",
                limit   : state?.limit     || 0,
                filters : [],
                groupBy : "",
                chartOptions: {
                    title: {
                        text: state?.name || "",                        
                    },
                    yAxis: {
                        title: {
                            text: state?.countLabel || ""
                        }
                    },
                    colors: state?.colors,
                    // @ts-ignore
                    custom: { theme: state?.theme }
                }
            }
        }}
        subscription={result[1] ?? undefined}
        dataPackage={result[0] ?? undefined}
    />
}