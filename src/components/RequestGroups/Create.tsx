import { Helmet, HelmetProvider } from "react-helmet-async"
import Breadcrumbs                from "../Breadcrumbs"
import Wrapper                    from "../generic/EndpointCreateWrapper"
import Form                       from "./Form"

import "./RequestGroups.scss"


export default function RequestGroupCreateForm()
{
    return (
        <div className="request-groups-list container">
            <HelmetProvider>
                <Helmet>
                    <title>Edit Data Subscription Group</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home"               , href: "/" },
                { name: "Subscription Groups", href: "/groups" },
                { name: "Create Subscription Group" }
            ]} />
            <h4>
                <span className="material-icons-round color-brand-2">
                    create_new_folder
                </span> Create Subscription Group
            </h4>
            <hr className="mb-2" />
            <Wrapper endpoint="/api/request-groups">{
                ({ loading, onSubmit, data }) => (<Form record={data} onSubmit={onSubmit} saving={loading} />)
            }</Wrapper>
            
        </div>
    )
}
