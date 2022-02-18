import { useCallback, useState }  from "react"
import { useNavigate, useParams } from "react-router"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { requests }               from "../../backend"
import { useBackend }             from "../../hooks"
import Breadcrumbs                from "../Breadcrumbs"
import DataRequestForm            from "./form"

import "./form.scss";

export default function EditDataRequestForm()
{
    const { id } = useParams();

    const navigate = useNavigate();
    
    const [ state, setState ] = useState<Partial<app.DataRequest>>({})

    const { loading, error } = useBackend<app.DataRequest>(
        useCallback(
            () => requests.getOne(id + "").then(x => {
                setState(x);
                return x;
            }),
            [id]
        ),
        true
    );

    const { execute: save, loading: saving, error: savingError } = useBackend(
        useCallback(
            () => requests.update(id + "", state),
            [id, state]
        )
    );

    const { execute: deleteRequest, loading: deleting, error: deletingError } = useBackend(
        useCallback(
            () => requests.delete(id + "").then(() => navigate("/")),
            [id, navigate]
        )
    );

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
            <h3>Edit Data Request</h3>
            <hr/>
            <div className="row gap color-muted small">
                <div className="col">
                    { error && <div><b>Error loading request:</b> { error + "" }</div> }
                    { savingError && <div><b>Error saving request:</b> { savingError + "" }</div> }
                    { deletingError && <div><b>Error deleting request:</b> { deletingError + "" }</div> }
                    { loading && <div><b>Loading Data Request...</b></div> }
                    { saving && <div><b>Saving...</b></div> }
                    { deleting && <div><b>Deleting...</b></div> }
                </div>
            </div>
            <DataRequestForm saveRequest={save} deleteRequest={deleteRequest} onChange={setState} record={state} />
        </div>
    )
}


