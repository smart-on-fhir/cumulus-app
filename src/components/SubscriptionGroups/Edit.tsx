import { createEditPage } from "../generic/EndpointEditWrapper"
import Form               from "./Form"
import { app }            from "../../types"
import "./SubscriptionGroups.scss"


export default function SubscriptionGroupEdit()
{
    return createEditPage<app.SubscriptionGroup>({
        namePlural  : "Data Source Groups",
        nameSingular: "Data Source Group",
        basePath    : "/groups",
        endpoint    : "/api/request-groups",
        renderForm  : ({ loading, data, onSubmit }) => <>
            <Form onSubmit={onSubmit} record={data} saving={loading} />
        </>
    })
}
