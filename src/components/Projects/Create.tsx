import { createCreatePage } from "../generic/EndpointCreateWrapper"
import Form                 from "./Form"


export default function Create()
{
    return createCreatePage<app.Project>({
        basePath    : "/projects",
        endpoint    : "/api/projects",
        namePlural  : "Study Areas",
        nameSingular: "Study Area",
        renderForm  : props => <Form { ...props } />
    })
}
