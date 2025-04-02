import { useCallback, useState }         from "react"
import { Navigate, useParams }           from "react-router-dom"
import { request, updateOne, deleteOne } from "../../backend"
import { useBackend }                    from "../../hooks"
import Breadcrumbs                       from "../generic/Breadcrumbs"
import Loader                            from "../generic/Loader"
import { AlertError }                    from "../generic/Alert"
import SubscriptionForm                  from "./form"
import { app }                           from "../../types"
import Terminology                       from "../../Terminology"

import "./form.scss";

export default function EditSubscriptionForm()
{
    const { id } = useParams();

    const [ state  , setState   ] = useState<Partial<app.Subscription>>({})
    const [ deleted, setDeleted ] = useState(false)


    // Fetch Subscription Groups -----------------------------------------------
    const {
        loading: loadingData,
        error  : loadingSubscriptionGroupsError,
        result : groups
    } = useBackend<app.SubscriptionGroup[]>(
        useCallback(() => request<app.SubscriptionGroup[]>("/api/request-groups"), []),
        true
    );

    // Fetch Subscription ------------------------------------------------------
    const {
        loading,
        error
    } = useBackend<app.Subscription>(
        useCallback(
            async () => {
                const subscription: app.SubscriptionWithPackage = await request(`/api/requests/${id}?tags=true`)
                setState(subscription);
                return subscription;
            },
            [id]
        ),
        true
    );

    // Save (update) Subscription ----------------------------------------------
    const { execute: save, loading: saving, error: savingError } = useBackend(
        useCallback(
            () => updateOne("requests", id + "", { ...state }).then(s => setState({ ...state, ...s })),
            [id, state]
        )
    );

    // Delete Subscription -----------------------------------------------------
    const { execute: deleteRequest, loading: deleting, error: deletingError } = useBackend(
        useCallback(
            async () => {
                if (window.confirm(
                    `Deleting this ${Terminology.subscription.nameSingular.toLowerCase()} will ` +
                    `also delete all the graphs associated with it! Are you sure?`)) {
                    deleteOne("requests", id + "").then(() => setDeleted(true))
                }
            },
            [id]
        )
    );

    if (deleted) {
        return <Navigate to="/requests" />
    }

    if (loadingData) {
        return <Loader msg={`Loading ${Terminology.subscriptionGroup.namePlural}...`} />
    }

    if (loadingSubscriptionGroupsError) {
        return (
            <AlertError>
                <b>Error loading {Terminology.subscriptionGroup.namePlural.toLowerCase()}:</b> { loadingSubscriptionGroupsError + "" }
            </AlertError>
        );
    }

    if (!groups) {
        return <AlertError><b>Error loading {Terminology.subscriptionGroup.namePlural.toLowerCase()}</b></AlertError>;
    }

    return (
        <div className="container">
            <title>Edit {Terminology.subscription.nameSingular}</title>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: Terminology.subscription.namePlural, href: "/requests" },
                { name: state.name + "", href: `/requests/${state.id}` },
                { name: "Edit " + Terminology.subscription.nameSingular }
            ]}/>
            <div className="row middle">
                <div className="col col-0">
                    <h3>Edit {Terminology.subscription.nameSingular}</h3>
                </div>
                <div className="col right color-muted small">
                    { loading  && <Loader msg="Loading..." /> }
                    { saving   && <Loader msg="Saving..." /> }
                    { deleting && <Loader msg="Deleting..." /> }
                </div>
            </div>
            <hr/>
            <div className="row gap">
                <div className="col">
                    { error && <AlertError><b>Error loading {Terminology.subscription.nameSingular}:</b> { error + "" }</AlertError> }
                    { savingError && <AlertError><b>Error saving {Terminology.subscription.nameSingular}:</b> { savingError + "" }</AlertError> }
                    { deletingError && <AlertError><b>Error deleting {Terminology.subscription.nameSingular}:</b> { deletingError + "" }</AlertError> }
                </div>
            </div>
            { loading ?
                <p><Loader msg={`Loading ${Terminology.subscription.nameSingular}...`} /></p> :
                <SubscriptionForm
                    saveRequest={save}
                    deleteRequest={deleteRequest}
                    onChange={setState}
                    record={state}
                    subscriptionGroups={groups}
                    working={ saving ? "saving" : deleting ? "deleting" : undefined }
                />
            }
        </div>
    )
}


