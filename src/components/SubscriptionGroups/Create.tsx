import { createCreatePage } from "../generic/EndpointCreateWrapper"
import Form                 from "./Form"
import { app }              from "../../types"
import "./SubscriptionGroups.scss"


export default function SubscriptionGroupCreate()
{
    return createCreatePage<app.SubscriptionGroup>({
        nameSingular: "Subscription Group",
        namePlural  : "Subscription Groups",
        basePath    : "/groups",
        endpoint    : "/api/request-groups",
        renderForm  : ({ loading, onSubmit, data }) => (
            <>
                <br/>
                <Form record={data} onSubmit={onSubmit} saving={loading} />
            </>
        )
    })
}
