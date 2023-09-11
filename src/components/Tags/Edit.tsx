import { createEditPage } from "../generic/EndpointEditWrapper"
import { app }            from "../../types"
import Form               from "./Form"


export default function Edit()
{
    return createEditPage<app.Tag>({
        endpoint    : "/api/tags",
        namePlural  : "Tags",
        nameSingular: "Tag",
        renderForm  : ({ loading, data, onSubmit }) => <>
            <Form loading={loading} data={data} onSubmit={onSubmit} />
        </>
    });
}
