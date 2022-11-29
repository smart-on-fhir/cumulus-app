import { Helmet, HelmetProvider } from "react-helmet-async"
import { AlertError }             from "../generic/Alert"
import Breadcrumbs                from "../generic/Breadcrumbs"
import EndpointEditWrapper        from "../generic/EndpointEditWrapper"
import Form                       from "./Form"


export default function EditProject()
{
    return (
        <div className="container">
            <EndpointEditWrapper endpoint="/api/projects">
                {({ loading, data, onSubmit, error }) => <>
                    <HelmetProvider>
                        <Helmet>
                            <title>Edit Project</title>
                        </Helmet>
                    </HelmetProvider>
                    <Breadcrumbs links={[
                        { name: "Home"    , href: "/" },
                        { name: "Projects", href: "/projects" },
                        { name: data.name , href: "/projects/" + data.id },
                        { name: "Edit Project" }
                    ]} />
                    <h4><i className="fa-solid fa-pen-to-square color-blue-dark" /> Edit Project</h4>
                    { error && <AlertError>{ error }</AlertError> }
                    <Form loading={loading} data={data} onSubmit={onSubmit} />
                </> }
            </EndpointEditWrapper>
        </div>
    )
}
