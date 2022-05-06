import { FormEvent, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useNavigate }         from "react-router-dom";
import { createOne }           from "../../backend";
import { AlertError }          from "../Alert";
import Breadcrumbs from "../Breadcrumbs";

import "./RequestGroups.scss";


interface State {
    saving : boolean
    error  : Error | null
}

export default function RequestGroupCreateForm()
{
    const navigate = useNavigate()

    const [state, setState] = useState<State>({
        saving : false,
        error  : null
    });

    const { error, saving } = state;

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const formData    = new FormData(e.currentTarget);
        const name        = formData.get("requestGroupName") as string;
        const description = formData.get("requestGroupDescription") as string;

        setState({ ...state, saving: true });

        createOne<app.RequestGroup>("request-groups", { name, description }).then(
            () => navigate("/groups"),
            error  => setState({ ...state, saving: false, error  })
        )
    }

    return (
        <div className="request-groups-list">
            <HelmetProvider>
                <Helmet>
                    <title>Edit Data Subscription Group</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home"               , href: "/" },
                { name: "Subscription Groups", href: "/groups" },
                { name: "Create Subscription Group" }
            ]} />
            <h4>Create Data Subscription Group</h4>
            <hr className="mb-1" />
            { error && <AlertError>{ error + "" }</AlertError> }
            <form onSubmit={ onSubmit }>
                <fieldset>
                    <label>Name</label>
                    <input type="text" name="requestGroupName" defaultValue="" required />
                </fieldset>
                <fieldset>
                    <label>Description</label>
                    <textarea defaultValue="" />
                </fieldset>
                <hr />
                <div className="center mt-1 mb-2">
                    <button
                        className="btn btn-green"
                        name="requestGroupDescription"
                        type="submit"
                        style={{ minWidth: "8em" }}
                    >
                        { saving && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                        Save
                    </button>
                </div>
            </form>
        </div>
    )
}
