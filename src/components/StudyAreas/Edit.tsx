import { createEditPage } from "../generic/EndpointEditWrapper"
import { app }            from "../../types"
import Form               from "./Form"


export default function Edit()
{
    return createEditPage<app.StudyArea>({
        endpoint    : "/api/study-areas",
        namePlural  : "Study Areas",
        nameSingular: "Study Area",
        renderForm  : props => <Form {...props} />
    })
}
