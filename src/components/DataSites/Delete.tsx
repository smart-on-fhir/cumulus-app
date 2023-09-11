import { createDeletePage } from "../generic/EndpointDeleteWrapper"
import Clip                 from "../generic/Clip"
import { app }              from "../../types"


export default function Delete()
{
    return createDeletePage<app.DataSite>({
        endpoint: "/api/data-sites",
        namePlural: "Healthcare Sites",
        nameSingular: "Healthcare Site",
        icon: <i className="fa-solid fa-location-dot color-brand-2" />,
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
