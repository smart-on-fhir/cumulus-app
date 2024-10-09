import { useCallback, useState }  from "react"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { Navigate }               from "react-router"
import { useSearchParams }        from "react-router-dom"
import { request, createOne }     from "../../backend"
import { useBackend }             from "../../hooks"
import { AlertError }             from "../generic/Alert"
import Breadcrumbs                from "../generic/Breadcrumbs"
import Loader                     from "../generic/Loader"
import SubscriptionForm           from "./form"
import { app }                    from "../../types"

import "./form.scss";


export default function CreateSubscriptionForm()
{
    const [ searchParams ] = useSearchParams()
    const [ state, setState ] = useState<Partial<app.SubscriptionWithPackage>>({
        groupId: +(searchParams.get("groupId") || 0) || undefined
    })
    const [ savedRecord, setSavedRecord ] = useState<app.SubscriptionWithPackage|null>(null)

    // onSubmit create new Subscription and redirect to its edit page
    const { execute: save, loading: saving, error: savingError } = useBackend(
        useCallback(async () => {
            delete state.dataSourceType
            delete state.dataPackage
            await createOne("requests", state as app.Subscription).then(sub => setSavedRecord(sub as app.SubscriptionWithPackage));
        }, [state])
    );

    // onMount fetch SubscriptionGroups
    const {
        loading: loadingSubscriptionGroups,
        error: loadingSubscriptionGroupsError,
        result: groups
    } = useBackend<app.SubscriptionGroup[]>(
        useCallback(() => request<app.SubscriptionGroup[]>("/api/request-groups"), []),
        true
    );

    if (savedRecord) {
        return <Navigate to={ "/requests/" + savedRecord.id } />
    }

    if (loadingSubscriptionGroups) {
        return <Loader msg="Loading Subscription Groups..." />
    }

    if (loadingSubscriptionGroupsError) {
        return <AlertError><b>Error loading subscription groups:</b> { loadingSubscriptionGroupsError + "" }</AlertError>
    }

    if (!groups) {
        return <AlertError><b>Failed loading groups data</b></AlertError>
    }

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
            <SubscriptionForm
                saveRequest={save}
                onChange={setState}
                record={state}
                subscriptionGroups={groups}
                working={ saving ? "saving" : undefined }
            />
        </div>
    )
}

