import { createEditPage } from "../generic/EndpointEditWrapper"
import Form               from "./Form"
import { app }            from "../../types"
import Terminology        from "../../Terminology"


export default function SubscriptionGroupEdit()
{
    return createEditPage<app.SubscriptionGroup>({
        namePlural  : Terminology.subscriptionGroup.namePlural,
        nameSingular: Terminology.subscriptionGroup.nameSingular,
        basePath    : "/groups",
        endpoint    : "/api/request-groups",
        renderForm  : ({ loading, data, onSubmit }) => <>
            <Form onSubmit={onSubmit} record={data} saving={loading} />
        </>
    })
}
