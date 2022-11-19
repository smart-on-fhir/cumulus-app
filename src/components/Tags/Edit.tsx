import { Helmet, HelmetProvider } from "react-helmet-async"
import { AlertError }             from "../Alert"
import Breadcrumbs                from "../Breadcrumbs"
import EndpointEditWrapper        from "../generic/EndpointEditWrapper"
import Form                       from "./Form"


export default function EditTag()
{
    return (
        <div className="container">
            <EndpointEditWrapper endpoint="/api/tags">
                {({ loading, data, onSubmit, error }) => <>
                    <HelmetProvider>
                        <Helmet>
                            <title>Edit Tag</title>
                        </Helmet>
                    </HelmetProvider>
                    <Breadcrumbs links={[
                        { name: "Home", href: "/" },
                        { name: "Tags", href: "/tags" },
                        { name: data.name , href: "/tags/" + data.id },
                        { name: "Edit Tag" }
                    ]} />
                    <h4><i className="fa-solid fa-pen-to-square color-blue-dark" /> Edit Tag</h4>
                    { error && <AlertError>{ error }</AlertError> }
                    <Form loading={loading} data={data} onSubmit={onSubmit} />
                </> }
            </EndpointEditWrapper>
        </div>
    )
}
