import { createCreatePage } from "../generic/EndpointCreateWrapper"
import DataSiteForm         from "./Form"
import { app }              from "../../types"


export default function DataSiteCreateForm()
{
    return createCreatePage<app.DataSite>({
        basePath    : "/sites/",
        endpoint    : "/api/data-sites/",
        namePlural  : "Healthcare Sites",
        nameSingular: "Healthcare Site",
        renderForm  : props => <DataSiteForm { ...props } />
    })
}
