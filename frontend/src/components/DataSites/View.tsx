import { createViewPage } from "../generic/EndpointViewWrapper"
import Clip               from "../generic/Clip"
import { useAuth }        from "../../auth";


export default function View()
{
    const { user } = useAuth();

    return createViewPage<app.DataSite>({
        basePath  : "/sites",
        endpoint  : "/api/data-sites",
        namePlural: "Healthcare Sites",
        icon      : <i className="fa-solid fa-location-dot color-brand-2" />,
        canDelete : user?.permissions.includes("DataSites.delete"),
        canUpdate : user?.permissions.includes("DataSites.update"),
        renderView: data => <>
            <div className="mt-05">
                <b>Setting:</b> { data.setting || <span className="color-muted">Not specified</span> }
            </div>
            <div className="mt-05">
                <b>Latitude:</b> { data.lat || <span className="color-muted">Not specified</span> }
            </div>
            <div className="mt-05">
                <b>Longitude:</b> { data.long || <span className="color-muted">Not specified</span> }
            </div>
            <div className="mt-05 mb-1" style={{ whiteSpace: "pre-wrap" }}>
                <b>Description:</b> { data.description ?
                    <Clip max={400} txt={ data.description } /> :
                    <span className="color-muted">Not specified</span>
                }
            </div>
        </>
    })
}
