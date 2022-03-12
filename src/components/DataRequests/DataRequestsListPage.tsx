import { useCallback }            from "react";
import { HelmetProvider, Helmet } from "react-helmet-async"
import { Link }                   from "react-router-dom";
import DataRequestLink            from "./DataRequestLink";
import { useBackend }             from "../../hooks";
import { request }                from "../../backend";
import Breadcrumbs                from "../Breadcrumbs";
import { useAuth }                from "../../auth";
import Loader                     from "../Loader";
import { AlertError }             from "../Alert";

import "./DataRequestsListPage.scss";


function List({
    items,
    href = "/requests/:id"
}: {
    items: app.DataRequest[]
    href?: string
})
{
    return (
        <ul className="icon-list link-list mb-2">
            { items.map((item, i) => {
                return (
                    <li key={i}>
                        <DataRequestLink request={item} href={href} />
                    </li>
                )
            })}
        </ul>
    );
}

export default function DataRequestsListPage()
{
    const { user } = useAuth();

    const { loading, error, result: groups } = useBackend(
        useCallback(() => request<app.RequestGroup[]>("/api/requests/by-group"), []),
        true
    );

    if (loading) {
        return <Loader msg="Loading Data Requests..."/>
    }

    if (error) {
        return <AlertError><b>Error Loading Data Requests: </b>{ error + "" }</AlertError>
    }

    return (
        <div>
            <HelmetProvider>
                <Helmet>
                    <title>Requests & Subscriptions</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Requests & Subscriptions" }
            ]} />
            <div className="row gap">
                <div className="col middle">
                    <h3>Data Subscriptions & Requests</h3>
                </div>
                { user?.role === "admin" && (<div className="col col-0 middle">
                    <Link className="btn color-blue" to="/requests/new"><b>New Data Request</b></Link>
                </div>) }
            </div>
            <hr/>
            <div className="requests-grid">
                { groups?.filter(g => g.requests.length > 0).map((group, i) => (
                    <div key={i}>
                        <h5 className="color-brand-2"><i className="fa-regular fa-folder"/> { group.name }</h5>
                        <List items={ group.requests }/>
                    </div>
                )) }
            </div>
        </div>
    )
}
