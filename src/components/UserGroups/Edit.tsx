import { createEditPage } from "../generic/EndpointEditWrapper"
import { app }            from "../../types"
import Form               from "./Form"


export default function Edit()
{
    return createEditPage<app.UserGroup>({
        endpoint    : "/api/user-groups",
        namePlural  : "User Groups",
        nameSingular: "Group",
        query       : "users=true",
        renderForm  : ({ loading, data, onSubmit }) => {
            return <Form loading={loading} data={data} onSubmit={onSubmit} />
        }
    });
}
