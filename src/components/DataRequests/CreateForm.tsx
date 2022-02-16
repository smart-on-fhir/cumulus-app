import { useCallback, useState } from "react"
// import { useNavigate, useParams }       from "react-router"
import Helmet                           from "react-helmet"
import { requests }                     from "../../backend"
import { useBackend }                   from "../../hooks"
import Breadcrumbs                      from "../Breadcrumbs"
import DataRequestForm                  from "./form"

import "./form.scss";

export default function CreateDataRequestForm()
{
    // const { id } = useParams();

    // const navigate = useNavigate();
    
    const [ state, setState ] = useState<Partial<app.DataRequest>>({})

    const { execute: save, loading: saving, error: savingError } = useBackend(
        useCallback(
            () => requests.create(state as app.DataRequest),
            [state]
        )
    );

    return (
        <div>
            <Helmet>
                <title>Create Data Request</title>
            </Helmet>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Requests & Subscriptions", href: "/requests" },
                { name: "Create Data Request" }
            ]}/>
            <h3>Create Data Request</h3>
            <hr/>
            <div className="row gap color-muted small">
                <div className="col">
                    { savingError && <div><b>Error saving request:</b> { savingError + "" }</div> }
                    { saving && <div><b>Saving...</b></div> }
                </div>
            </div>
            <DataRequestForm saveRequest={save} onChange={setState} record={state} />
        </div>
    )
}

