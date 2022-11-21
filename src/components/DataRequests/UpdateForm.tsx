import { useCallback, useState }  from "react"
import { Navigate, useParams }    from "react-router"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { request, updateOne, deleteOne } from "../../backend"
import { useBackend }             from "../../hooks"
import Breadcrumbs                from "../Breadcrumbs"
import Loader                     from "../Loader"
import { AlertError }             from "../Alert"
import DataRequestForm            from "./form"

import "./form.scss";

export default function EditDataRequestForm()
{
    const { id } = useParams();

    const [ state  , setState   ] = useState<Partial<app.DataRequest>>({})
    const [ deleted, setDeleted ] = useState(false)


    // Fetch DataRequestGroups -------------------------------------------------
    const {
        loading: loadingData,
        error  : loadingRequestGroupsError,
        result : data
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

    // Fetch DataRequest -------------------------------------------------------
    const {
        loading,
        error
    } = useBackend<app.DataRequest>(
        useCallback(
            () => request("/api/requests/" + id).then(x => {
                setState(x);
                return x;
            }),
            [id]
        ),
        true
    );

    // Save (update) DataRequest -----------------------------------------------
    const { execute: save, loading: saving, error: savingError } = useBackend(
        useCallback(
            () => {
                let payload = { ...state }
                delete payload.data
                return updateOne("requests", id + "", payload).then(setState)
            },
            [id, state]
        )
    );

    // Delete DataRequest ------------------------------------------------------
    const { execute: deleteRequest, loading: deleting, error: deletingError } = useBackend(
        useCallback(
            async () => {
                if (window.confirm(
                    "Deleting this subscription will also delete all the views " +
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

    if (loadingRequestGroupsError) {
        return (
            <AlertError>
                <b>Error loading subscription groups:</b> { loadingRequestGroupsError + "" }
            </AlertError>
        );
    }

    if (!data) {
        return <AlertError><b>Error loading data</b></AlertError>;
    }

    const { groups, sites } = data

    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>Edit Data Subscription</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Data Subscriptions", href: "/requests" },
                { name: state.name + "", href: `/requests/${state.id}` },
                { name: "Edit Subscription" }
            ]}/>
            <div className="row middle">
                <div className="col col-0">
                    <h3>Edit Data Subscription</h3>
                </div>
                <div className="col right color-muted small">
                    { loading  && <Loader msg="Loading Data Subscription..." /> }
                    { saving   && <Loader msg="Saving..." /> }
                    { deleting && <Loader msg="Deleting..." /> }
                </div>
            </div>
            <hr/>
            <div className="row gap color-muted small">
                <div className="col">
                    { error && <AlertError><b>Error loading subscription:</b> { error + "" }</AlertError> }
                    { savingError && <AlertError><b>Error saving subscription:</b> { savingError + "" }</AlertError> }
                    { deletingError && <AlertError><b>Error deleting subscription:</b> { deletingError + "" }</AlertError> }
                </div>
            </div>
            <DataRequestForm
                saveRequest={save}
                deleteRequest={deleteRequest}
                onChange={setState}
                record={state}
                requestGroups={groups}
                sites={sites}
                working={ saving ? "saving" : deleting ? "deleting" : undefined }
            />
        </div>
    )
}


