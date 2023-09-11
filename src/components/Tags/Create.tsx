import { createCreatePage } from "../generic/EndpointCreateWrapper"
import { app }              from "../../types"
import Form                 from "./Form"


export default function Create()
{
    return createCreatePage<app.Tag>({
        endpoint    : "/api/tags",
        namePlural  : "Tags",
        basePath    : "/tags",
        nameSingular: "Tag",
        renderForm  : props => <Form { ...props } />
    })
}
