import { createCreatePage } from "../generic/EndpointCreateWrapper"
import { app }              from "../../types"
import Form                 from "./Form"


export default function Create()
{
    return createCreatePage<app.StudyArea>({
        basePath    : "/study-areas",
        endpoint    : "/api/study-areas",
        namePlural  : "Study Areas",
        nameSingular: "Study Area",
        renderForm  : props => <Form { ...props } />
    })
}
