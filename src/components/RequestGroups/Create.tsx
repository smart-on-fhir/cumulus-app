import { createCreatePage } from "../generic/EndpointCreateWrapper"
import Form                 from "./Form"
import { app }              from "../../types"
import "./RequestGroups.scss"


export default function RequestGroupCreate()
{
    return createCreatePage<app.RequestGroup>({
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
