import { useCallback, useMemo }    from "react"
import { useLocation, useParams }  from "react-router-dom"
import Dashboard                   from "."
import { AlertError }              from "../generic/Alert"
import Loader                      from "../generic/Loader"
import { request }                 from "../../backend"
import { useBackend }              from "../../hooks"
import { app }                     from "../../types"
import { useAuth }                 from "../../auth"
import Terminology                 from "../../Terminology"
import aggregator, { DataPackage } from "../../Aggregator"
import { COLOR_THEMES } from "./config"


export default function CreateView()
{
    // The subscription ID from the URL params
    const { id = "" } = useParams();

    const { user } = useAuth()

    const location = useLocation()
    const state: any = location.state

    // Parse query string parameters as fallback if location.state is not set
    const queryParams = useMemo(() => {
        const params = new URLSearchParams(location.search)
        return {
            name       : params.get("name"),
            description: params.get("description"),
            column     : params.get("column"),
            chartType  : params.get("chartType"),
            sortBy     : params.get("sortBy"),
            limit      : params.get("limit") ? +params.get("limit")! : undefined,
            filter     : params.get("filter"),
            groupBy    : params.get("groupBy"),
            countLabel : params.get("countLabel"),
            theme      : params.get("theme"),
        }
    }, [location.search])

    // Use queryParams if present, otherwise fallback to state
    // If a query param is set, it overrides the corresponding state value
    function mergeParams(state: any, queryParams: any) {
        const out: any = { ...state };
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] !== undefined && queryParams[key] !== null) {
                out[key] = queryParams[key];
            }
        });
        return out;
    }
    const params = mergeParams(state || {}, queryParams)

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

    let filters = []
    if (params?.filter) {
        params.filter.split(",").forEach(f => {
            const [left, operator, right] = f.split(":")
            filters.push({
                left,
                operator,
                negated: false,
                join: "and",
                right: { type: "value", value: right }
            })
        })
    }

    // Eventually render a Breadcrumbs and the dashboard
    return <Dashboard
        view={{
            creatorId  : user!.id,
            isDraft    : true,
            name       : params?.name        || "",
            description: params?.description || "",
            settings: {
                column  : params?.column    || "",
                viewType: params?.chartType || "spline",
                sortBy  : params?.sortBy    || "x:asc",
                limit   : params?.limit     || 0,
                filters,
                groupBy : params?.groupBy || "",
                chartOptions: {
                    title: {
                        text: params?.name || "",                        
                    },
                    yAxis: {
                        title: {
                            text: params?.countLabel || ""
                        }
                    },
                    colors: params?.theme ? COLOR_THEMES.find(t => t.id === params.theme)?.colors ?? [] : [],
                    // @ts-ignore
                    custom: { theme: params?.theme },
                    plotOptions: {
                        bar: {
                            stacking: params?.groupBy ? "normal" : undefined
                        },
                        column: {
                            stacking: params?.groupBy ? "normal" : undefined
                        }
                    }
                }
            }
        }}
        subscription={result[1] ?? undefined}
        dataPackage={result[0] ?? undefined}
    />
}