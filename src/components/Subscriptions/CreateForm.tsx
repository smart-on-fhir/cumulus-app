import { useCallback, useState }  from "react"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { Navigate, useLocation }  from "react-router"
import { useSearchParams }        from "react-router-dom"
import { request, createOne }     from "../../backend"
import { useBackend }             from "../../hooks"
import { AlertError }             from "../generic/Alert"
import Breadcrumbs                from "../generic/Breadcrumbs"
import Loader                     from "../generic/Loader"
import SubscriptionForm           from "./form"
import { app }                    from "../../types"
import Terminology                from "../../Terminology"
import aggregator                 from "../../Aggregator"

import "./form.scss";


export default function CreateSubscriptionForm()
{
    const [ searchParams ] = useSearchParams()

    const location = useLocation()

    const groupId   = +(searchParams.get("groupId") || 0) || undefined

    const packageId = searchParams.get("packageId") || ""
    const dataSourceType = packageId ? "aggregator" : "file"
    const dataURL = packageId || undefined
    
    // @ts-ignore
    const dataPackage = location.state?.dataPackage || undefined
    
    const [ state, setState ] = useState<Partial<app.SubscriptionWithPackage>>({
        groupId,
        dataSourceType,
        dataURL,
        dataPackage,
        metadata: dataPackage ? aggregator.getPackageMetadata(dataPackage) : null,
        completed: dataPackage ? dataPackage.last_data_update : null
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
        return <Loader msg={`Loading ${Terminology.subscriptionGroup.namePlural}...`} />
    }

    if (loadingSubscriptionGroupsError) {
        return <AlertError><b>Error loading {Terminology.subscriptionGroup.namePlural.toLowerCase()}:</b> { loadingSubscriptionGroupsError + "" }</AlertError>
    }

    if (!groups) {
        return <AlertError><b>Failed loading {Terminology.subscriptionGroup.namePlural.toLowerCase()}</b></AlertError>
    }

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>Create {Terminology.subscription.namePlural}</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: Terminology.subscription.namePlural, href: "/requests" },
                { name: "Create " + Terminology.subscription.nameSingular }
            ]} />
            <h3>Create {Terminology.subscription.nameSingular}</h3>
            <hr/>
            <div className="row gap">
                <div className="col">
                    { savingError && <AlertError><b>Error saving {Terminology.subscription.nameSingular}:</b> { savingError + "" }</AlertError> }
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

