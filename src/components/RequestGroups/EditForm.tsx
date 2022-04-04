import { FormEvent, useCallback, useState } from "react";
import { Helmet, HelmetProvider }           from "react-helmet-async";
import { useNavigate, useParams }           from "react-router-dom";
import { request, updateOne }               from "../../backend";
import { useBackend }                       from "../../hooks"
import { AlertError }                       from "../Alert";
import Breadcrumbs                          from "../Breadcrumbs";
import Loader                               from "../Loader";

import "./RequestGroups.scss";


interface State {
    record : app.RequestGroup | null
    loading: boolean
    saving : boolean
    error  : Error | null
}

export default function RequestGroupEditForm()
{
    const { id } = useParams();
    const navigate = useNavigate()

    const [state, setState] = useState<State>({
        record : null,
        loading: true,
        saving : false,
        error  : null
    });

    const { record, error, loading, saving } = state;

    useBackend(
        useCallback(
            () => {
                return request("/api/request-groups/" + id).then(
                    record => setState({
                        record,
                        loading: false,
                        saving : false,
                        error  : null
                    }),
                    error => setState({
                        record : null,
                        loading: false,
                        saving : false,
                        error
                    })
                );
            }
            , [id]
        ),
        true
    );

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (record) {
            // if (record.id === 1) {
            //     return alert("The default group cannot be edited!")
            // }

            const formData    = new FormData(e.currentTarget);
            const name        = formData.get("requestGroupName") as string;
            const description = formData.get("requestGroupDescription") as string;

            setState({ ...state, saving: true });

            updateOne<app.RequestGroup>("request-groups",  record.id, { name, description }).then(
                () => navigate("/groups"),
                error  => setState({ ...state, saving: false, error  })
            )
        }
    }

    return (
        <div className="request-groups-list">
            <HelmetProvider>
                <Helmet>
                    <title>Edit Data Request Group</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Request Groups", href: "/groups" },
                { name: "Edit Request Group" }
            ]} />
            <h4><i className="fa-solid fa-pen-to-square" /> Edit Data Request Group</h4>
            <hr className="mb-2" />
            { loading && <Loader/> }
            { error && <AlertError>{ error + "" }</AlertError> }
            { !loading && !error && record && (
                <form onSubmit={ onSubmit }>
                    <div className="row gap mb-3">
                        <div className="col small color-muted">
                            <div>
                                <b>Created at: </b>
                                <span>{ record.createdAt }</span>
                            </div>
                        </div>
                        <div className="col small color-muted right">
                            <div>
                                <b>Updated at: </b>
                                <span>{ record.updatedAt }</span>
                            </div>
                        </div>
                    </div>
                    <fieldset>
                        <label>Name</label>
                        <input type="text" name="requestGroupName" defaultValue={ record.name } required />
                    </fieldset>
                    <fieldset>
                        <label>Description</label>
                        <textarea name="requestGroupDescription" defaultValue={ record.description } />
                    </fieldset>
                    <hr />
                    <div className="center mt-1 mb-2">
                        <button
                            className="btn btn-green"
                            type="submit"
                            style={{ minWidth: "8em" }}
                        >
                            { saving && <><i className="fas fa-circle-notch fa-spin"/>&nbsp;</> }
                            Save
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
