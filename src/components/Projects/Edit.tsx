import { createEditPage } from "../generic/EndpointEditWrapper"
import { app }            from "../../types"
import Form               from "./Form"


export default function Edit()
{
    return createEditPage<app.Project>({
        endpoint    : "/api/projects",
        namePlural  : "Study Areas",
        nameSingular: "Study Area",
        renderForm  : props => <Form {...props} />
    })
}
