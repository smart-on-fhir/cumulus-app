import { FormEvent, useState }    from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useNavigate }            from "react-router-dom";
import { createOne }              from "../../backend";
import { AlertError }             from "../Alert";
import Breadcrumbs                from "../Breadcrumbs";


interface State {
    saving : boolean
    error  : Error | null
}

export default function DataSiteCreateForm()
{
    const navigate = useNavigate()

    const [state, setState] = useState<State>({
        saving: false,
        error : null
    });

    const { error, saving } = state;

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const formData    = new FormData(e.currentTarget);
        const name        = formData.get("dataSiteName") as string;
        const description = formData.get("dataSiteDescription") as string;
        const lat         = parseFloat(formData.get("dataSiteLatitude") as string);
        const long        = parseFloat(formData.get("dataSiteLongtitude") as string);

        setState({ ...state, saving: true });

        createOne<app.DataSite>("data-sites",  {
            name,
            description,
            lat : isNaN(lat) ? null : lat,
            long: isNaN(long) ? null : long
        }).then(
            () => navigate("/sites"),
            error  => setState({ ...state, saving: false, error  })
        )
    }

    return (
        <div>
            <HelmetProvider>
                <Helmet>
                    <title>Create Data Site</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Data Sites", href: "/sites" },
                { name: "Create Data Site" }
            ]} />
            <h4>Create Data Site</h4>
            <hr className="mb-1" />
            { error && <AlertError>{ error + "" }</AlertError> }
            <form onSubmit={ onSubmit }>
                <div className="row gap mb-1">
                    <div className="col">
                        <label>Name</label>
                        <input type="text" name="dataSiteName" required />
                    </div>
                </div>
                
                <div className="row gap mb-1">
                    <div className="col">
                        <label>Latitude</label>
                        <input type="number" name="dataSiteLatitude" />    
                    </div>
                    <div className="col">
                        <label>Longtitude</label>
                        <input type="number" name="dataSiteLongtitude" />
                    </div>
                </div>
                
                <div className="row gap mb-1">
                    <div className="col">
                        <label>Description</label>
                        <textarea name="dataSiteDescription" />
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
        </div>
    )
}
