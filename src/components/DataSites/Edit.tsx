import { createEditPage } from "../generic/EndpointEditWrapper"
import DataSiteForm       from "./Form"


export default function EditDataSite()
{
    return createEditPage<app.DataSite>({
        nameSingular   : "Data Site",
        namePlural     : "Data Sites",
        endpoint       : "/api/data-sites/",
        basePath       : "/sites/",
        primaryKeyField: "id",
        nameField      : "name",
        renderForm: props => <DataSiteForm {...props}/>
    })
}
