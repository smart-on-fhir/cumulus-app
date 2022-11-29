import { createCreatePage } from "../generic/EndpointCreateWrapper"
import DataSiteForm         from "./Form"


export default function DataSiteCreateForm()
{
    return createCreatePage<app.DataSite>({
        basePath    : "/sites/",
        endpoint    : "/api/data-sites/",
        namePlural  : "Data Sites",
        nameSingular: "Data Site",
        renderForm  : props => <DataSiteForm { ...props } />
    })
}
