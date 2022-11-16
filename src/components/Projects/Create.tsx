import { Helmet, HelmetProvider } from "react-helmet-async"
import { AlertError }             from "../Alert"
import Breadcrumbs                from "../Breadcrumbs"
import EndpointCreateWrapper      from "../generic/EndpointCreateWrapper"
import Form                       from "./Form"

export default function CreateProject()
{
    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>Create Project</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home"    , href: "/" },
                { name: "Projects", href: "/projects" },
                { name: "Create Project" }
            ]} />
            <h4><i className="fa-solid fa-circle-plus color-blue-dark" /> Create Project</h4>
            <hr/>
            <EndpointCreateWrapper endpoint="/api/projects">
                {({ loading, data, onSubmit, error }) => <>
                    { error && <AlertError>{ error }</AlertError> }
                    <Form onSubmit={ onSubmit } data={ data } loading={ loading } />
                </>}
            </EndpointCreateWrapper>
        </div>
    )
}