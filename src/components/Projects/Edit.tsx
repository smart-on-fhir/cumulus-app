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
                            <title>Edit Study Area</title>
                        </Helmet>
                    </HelmetProvider>
                    <Breadcrumbs links={[
                        { name: "Home"    , href: "/" },
                        { name: "Study Areas", href: "/projects" },
                        { name: data.name , href: "/projects/" + data.id },
                        { name: "Edit Study Area" }
                    ]} />
                    <h4><i className="fa-solid fa-pen-to-square color-blue-dark" /> Edit Study Area</h4>
                    { error && <AlertError>{ error }</AlertError> }
                    <Form loading={loading} data={data} onSubmit={onSubmit} />
                </> }
            </EndpointEditWrapper>
        </div>
    )
}
