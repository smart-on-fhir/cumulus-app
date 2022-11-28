import { Helmet, HelmetProvider } from "react-helmet-async"
import Breadcrumbs                from "../Breadcrumbs"
import Wrapper                    from "../generic/EndpointEditWrapper"
import Form                       from "./Form";
import "./RequestGroups.scss";

export default function RequestGroupEditForm()
{
    return (
        <div className="request-groups-list container">
            <HelmetProvider>
                <Helmet>
                    <title>Edit Data Subscription Group</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Subscription Groups", href: "/groups" },
                { name: "Edit Subscription Group" }
            ]} />
            <h4><i className="fa-solid fa-pen-to-square color-brand-2" /> Edit Data Subscription Group</h4>
            <hr />
            <Wrapper endpoint="/api/request-groups/">
                {({loading, data, onSubmit}) => (
                    <Form onSubmit={onSubmit} record={data} saving={loading} />
                )}
            </Wrapper>
        </div>
    )
}
