import { createEditPage } from "../generic/EndpointEditWrapper"
import Form               from "./Form"
import "./RequestGroups.scss"


export default function RequestGroupEdit()
{
    return createEditPage<app.RequestGroup>({
        namePlural  : "Subscription Groups",
        nameSingular: "Subscription Group",
        basePath    : "/groups",
        endpoint    : "/api/request-groups",
        renderForm  : ({ loading, data, onSubmit }) => <>
            <Form onSubmit={onSubmit} record={data} saving={loading} />
        </>
    })
}
