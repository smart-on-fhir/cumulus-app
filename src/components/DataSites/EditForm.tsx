import { FormEvent, useCallback, useState } from "react";
import { Helmet, HelmetProvider }           from "react-helmet-async";
import { useNavigate, useParams }           from "react-router-dom";
import { request, updateOne }               from "../../backend";
import { useBackend }                       from "../../hooks"
import { AlertError }                       from "../Alert";
import Breadcrumbs                          from "../Breadcrumbs";
import Loader                               from "../Loader";


interface State {
    record : app.DataSite | null
    loading: boolean
    saving : boolean
    error  : Error | null
}

export default function DataSiteEditForm()
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
                return request("/api/data-sites/" + id).then(
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
            const formData    = new FormData(e.currentTarget);
            const name        = formData.get("dataSiteName") as string;
            const description = formData.get("dataSiteDescription") as string;
            const lat         = parseFloat(formData.get("dataSiteLatitude") as string);
            const long        = parseFloat(formData.get("dataSiteLongtitude") as string);

            setState({ ...state, saving: true });

            updateOne<app.DataSite>("data-sites",  record.id, {
                name,
                description,
                lat : isNaN(lat) ? null : lat,
                long: isNaN(long) ? null : long
            }).then(
                () => navigate("/sites"),
                error  => setState({ ...state, saving: false, error  })
            )
        }
    }

    return (
        <div className="request-groups-list">
            <HelmetProvider>
                <Helmet>
                    <title>Edit Data Site</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Data Sites", href: "/sites" },
                { name: "Edit Data Site" }
            ]} />
            <h4><i className="fa-solid fa-pen-to-square" /> Edit Data Site</h4>
            <hr className="mb-1" />
            { loading && <Loader/> }
            { error && <AlertError>{ error + "" }</AlertError> }
            { !loading && !error && record && (
                <form onSubmit={ onSubmit }>
                    <div className="row mb-2">
                        <div className="col small color-muted center">
                            <div>
                                <b className="nowrap" style={{ display: "inline-block", width: "6em" }}>Created at:</b>
                                <span className="nowrap center" style={{ display: "inline-block", width: "14em" }}>{ record.createdAt }</span>
                            </div>
                        </div>
                        <div className="col col-2"/>
                        <div className="col small color-muted center">
                            <div>
                                <b className="nowrap" style={{ display: "inline-block", width: "6em" }}>Updated at:</b>
                                <span className="nowrap center" style={{ display: "inline-block", width: "14em" }}>{ record.updatedAt }</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row gap mb-1">
                        <div className="col">
                            <label>Name</label>
                            <input type="text" name="dataSiteName" defaultValue={ record.name } required />
                        </div>
                    </div>
                    
                    <div className="row gap mb-1">
                        <div className="col">
                            <label>Latitude</label>
                            <input type="number" name="dataSiteLatitude" defaultValue={ record.lat || undefined } />    
                        </div>
                        <div className="col">
                            <label>Longtitude</label>
                            <input type="number" name="dataSiteLongtitude" defaultValue={ record.long || undefined } />
                        </div>
                    </div>
                    
                    <div className="row gap mb-1">
                        <div className="col">
                            <label>Description</label>
                            <textarea name="dataSiteDescription" defaultValue={ record.description || undefined } />
                        </div>
                    </div>

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
