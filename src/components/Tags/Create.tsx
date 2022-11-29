import { Helmet, HelmetProvider } from "react-helmet-async"
import { AlertError }             from "../generic/Alert"
import Breadcrumbs                from "../generic/Breadcrumbs"
import EndpointCreateWrapper      from "../generic/EndpointCreateWrapper"
import Form                       from "./Form"

export default function CreateTag()
{
    return (
        <div className="container">
            <HelmetProvider>
                <Helmet>
                    <title>Create Tag</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Tags", href: "/tags" },
                { name: "Create Tag" }
            ]} />
            <h4><i className="fa-solid fa-circle-plus color-blue-dark" /> Create Tag</h4>
            <hr/>
            <EndpointCreateWrapper endpoint="/api/tags">
                {({ loading, data, onSubmit, error }) => <>
                    { error && <AlertError>{ error }</AlertError> }
                    <Form onSubmit={ onSubmit } data={ data } loading={ loading } />
                </>}
            </EndpointCreateWrapper>
        </div>
    )
}