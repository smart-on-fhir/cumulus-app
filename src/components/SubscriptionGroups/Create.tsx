import { createCreatePage } from "../generic/EndpointCreateWrapper"
import Form                 from "./Form"
import { app }              from "../../types"
import Terminology          from "../../Terminology"
import "./SubscriptionGroups.scss"


export default function SubscriptionGroupCreate()
{
    return createCreatePage<app.SubscriptionGroup>({
        nameSingular: Terminology.subscriptionGroup.nameSingular,
        namePlural  : Terminology.subscriptionGroup.namePlural,
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
