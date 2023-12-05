import { createCreatePage } from "../generic/EndpointCreateWrapper"
import { app }              from "../../types"
import Form                 from "./Form"


export default function Create()
{
    return createCreatePage<app.UserGroup>({
        endpoint    : "/api/user-groups",
        namePlural  : "User Groups",
        basePath    : "/user-groups",
        nameSingular: "User Group",
        renderForm  : props => <Form { ...props } />
    })
}
