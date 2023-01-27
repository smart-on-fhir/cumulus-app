import { useCallback, useState }  from "react"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { Navigate }               from "react-router"
import { useSearchParams }        from "react-router-dom"
import { request, createOne }     from "../../backend"
import { useBackend }             from "../../hooks"
import { AlertError }             from "../generic/Alert"
import Breadcrumbs                from "../generic/Breadcrumbs"
import Loader                     from "../generic/Loader"
import DataRequestForm            from "./form"

import "./form.scss";


export default function CreateDataRequestForm()
{
    const [ searchParams ] = useSearchParams()
    const [ state, setState ] = useState<Partial<app.DataRequest>>({
        groupId: +(searchParams.get("groupId") || 0) || undefined
    })
    const [ savedRecord, setSavedRecord ] = useState<app.DataRequest|null>(null)

    // onSubmit create new DataRequest and redirect to its edit page
    const { execute: save, loading: saving, error: savingError } = useBackend(
        useCallback(async () => {
            await createOne("requests", state as app.DataRequest).then(setSavedRecord);
        }, [state])
    );

    // onMount fetch DataRequestGroups
    const {
        loading: loadingRequestGroups,
        error: loadingRequestGroupsError,
        result: data
    } = useBackend<{ groups: app.RequestGroup[], sites: app.DataSite[] }>(
        useCallback(
            () => Promise.all([
                request<app.RequestGroup[]>("/api/request-groups"),
                request<app.DataSite[]>("/api/data-sites")
            ]).then(([groups, sites]) => ({ groups, sites })),
            []
        ),
        true
    );

    if (savedRecord) {
        return <Navigate to={ "/requests/" + savedRecord.id } />
    }

    if (loadingRequestGroups) {
        return <Loader msg="Loading Subscription Groups..." />
    }

    if (loadingRequestGroupsError) {
        return <AlertError><b>Error loading subscription groups:</b> { loadingRequestGroupsError + "" }</AlertError>
    }

    if (!data) {
        return <AlertError><b>Failed loading data</b></AlertError>
    }

    const { groups, sites } = data;

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>Create Subscription</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Subscriptions", href: "/requests" },
                { name: "Create Subscription" }
            ]} />
            <h3>Create Subscription</h3>
            <hr/>
            <div className="row gap">
                <div className="col">
                    { savingError && <AlertError><b>Error saving subscription:</b> { savingError + "" }</AlertError> }
                    { saving && <Loader msg="Saving..."/> }
                </div>
            </div>
            <DataRequestForm
                saveRequest={save}
                onChange={setState}
                record={state}
                requestGroups={groups}
                sites={sites}
                working={ saving ? "saving" : undefined }
            />
        </div>
    )
}

