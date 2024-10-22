import { useCallback, useState }         from "react"
import { Navigate, useParams }           from "react-router"
import { HelmetProvider, Helmet }        from "react-helmet-async"
import { request, updateOne, deleteOne } from "../../backend"
import { useBackend }                    from "../../hooks"
import Breadcrumbs                       from "../generic/Breadcrumbs"
import Loader                            from "../generic/Loader"
import { AlertError }                    from "../generic/Alert"
import SubscriptionForm                  from "./form"
import { app }                           from "../../types"

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
                    "Deleting this subscription will also delete all the graphs " +
                    "associated with it! Are you sure?")) {
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
        return <Loader msg="Loading Subscription Groups..." />
    }

    if (loadingSubscriptionGroupsError) {
        return (
            <AlertError>
                <b>Error loading subscription groups:</b> { loadingSubscriptionGroupsError + "" }
            </AlertError>
        );
    }

    if (!groups) {
        return <AlertError><b>Error loading subscription groups</b></AlertError>;
    }

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>Edit Subscription</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Subscriptions", href: "/requests" },
                { name: state.name + "", href: `/requests/${state.id}` },
                { name: "Edit Subscription" }
            ]}/>
            <div className="row middle">
                <div className="col col-0">
                    <h3>Edit Subscription</h3>
                </div>
                <div className="col right color-muted small">
                    { loading  && <Loader msg="Loading Subscription..." /> }
                    { saving   && <Loader msg="Saving..." /> }
                    { deleting && <Loader msg="Deleting..." /> }
                </div>
            </div>
            <hr/>
            <div className="row gap">
                <div className="col">
                    { error && <AlertError><b>Error loading subscription:</b> { error + "" }</AlertError> }
                    { savingError && <AlertError><b>Error saving subscription:</b> { savingError + "" }</AlertError> }
                    { deletingError && <AlertError><b>Error deleting subscription:</b> { deletingError + "" }</AlertError> }
                </div>
            </div>
            { loading ?
                <p><Loader msg="Loading Subscription..." /></p> :
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


