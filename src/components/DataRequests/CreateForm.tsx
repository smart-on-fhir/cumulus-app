import { useCallback, useState }  from "react"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { Navigate }               from "react-router"
import { request, createOne }     from "../../backend"
import { useBackend }             from "../../hooks"
import { AlertError }             from "../Alert"
import Breadcrumbs                from "../Breadcrumbs"
import Loader                     from "../Loader"
import DataRequestForm            from "./form"

import "./form.scss";


export default function CreateDataRequestForm()
{
    const [ state, setState ] = useState<Partial<app.DataRequest>>({ groupId: 1 })
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
        result: availableRequestGroups
    } = useBackend<app.RequestGroup[]>(
        useCallback(
            () => request<app.RequestGroup[]>("/api/request-groups"),
            []
        ),
        true
    );

    if (savedRecord) {
        return <Navigate to={ "/requests/" + savedRecord.id } />
    }

    if (loadingRequestGroups) {
        return <Loader msg="Loading Request Groups..." />
    }

    if (loadingRequestGroupsError) {
        return <AlertError><b>Error loading request groups:</b> { loadingRequestGroupsError + "" }</AlertError>
    }

    return (
        <div>
            <HelmetProvider>
                <Helmet>
                    <title>Create Data Request</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Requests & Subscriptions", href: "/requests" },
                { name: "Create Data Request" }
            ]} />
            <h3>Create Data Request</h3>
            <hr/>
            <div className="row gap color-muted small">
                <div className="col">
                    { savingError && <AlertError><b>Error saving request:</b> { savingError + "" }</AlertError> }
                    { saving && <Loader msg="Saving..."/> }
                </div>
            </div>
            <DataRequestForm
                saveRequest={save}
                onChange={setState}
                record={state}
                requestGroups={availableRequestGroups as app.RequestGroup[]}
                working={ saving ? "saving" : undefined }
            />
        </div>
    )
}

