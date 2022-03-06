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
        loading: loadingRequestGroups,
        error  : loadingRequestGroupsError,
        result : availableRequestGroups
    } = useBackend<app.RequestGroup[]>(
        useCallback(
            () => request<app.RequestGroup[]>("/api/request-groups"),
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
            () => updateOne("requests", id + "", state).then(setState),
            [id, state]
        )
    );

    // Delete DataRequest ------------------------------------------------------
    const { execute: deleteRequest, loading: deleting, error: deletingError } = useBackend(
        useCallback(
            async () => {
                if (window.confirm(
                    "Deleting this request will also delete all the views " +
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

    if (loadingRequestGroups) {
        return <Loader msg="Loading Request Groups..." />
    }

    if (loadingRequestGroupsError) {
        return (
            <AlertError>
                <b>Error loading request groups:</b> { loadingRequestGroupsError + "" }
            </AlertError>
        );
    }

    return (
        <div>
            <HelmetProvider>
                <Helmet>
                    <title>Edit Data Request</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Requests & Subscriptions", href: "/requests" },
                { name: state.name + "", href: `/requests/${state.id}` },
                { name: "Edit Request" }
            ]}/>
            <div className="row middle">
                <div className="col col-0">
                    <h3>Edit Data Request</h3>
                </div>
                <div className="col right color-muted small">
                    { loading  && <Loader msg="Loading Data Request..." /> }
                    { saving   && <Loader msg="Saving..." /> }
                    { deleting && <Loader msg="Deleting..." /> }
                </div>
            </div>
            <hr/>
            <div className="row gap color-muted small">
                <div className="col">
                    { error && <AlertError><b>Error loading request:</b> { error + "" }</AlertError> }
                    { savingError && <AlertError><b>Error saving request:</b> { savingError + "" }</AlertError> }
                    { deletingError && <AlertError><b>Error deleting request:</b> { deletingError + "" }</AlertError> }
                </div>
            </div>
            <DataRequestForm
                saveRequest={save}
                deleteRequest={deleteRequest}
                onChange={setState}
                record={state}
                requestGroups={availableRequestGroups as app.RequestGroup[]}
                working={ saving ? "saving" : deleting ? "deleting" : undefined }
            />
        </div>
    )
}


