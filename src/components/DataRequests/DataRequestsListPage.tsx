import { useCallback }            from "react"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import DataRequestLink            from "./DataRequestLink"
import { useBackend }             from "../../hooks"
import { request }                from "../../backend"
import Breadcrumbs                from "../generic/Breadcrumbs"
import { useAuth }                from "../../auth"
import Loader                     from "../generic/Loader"
import { AlertError }             from "../generic/Alert"
import Grid                       from "../generic/Grid"

import "./DataRequestsListPage.scss";
import Collapse from "../generic/Collapse"



export default function DataRequestsListPage()
{
    const { user } = useAuth();

    const { loading, error, result: groups } = useBackend(
        useCallback(() => request<app.RequestGroup[]>("/api/requests/by-group"), []),
        true
    );

    if (loading) {
        return <Loader msg="Loading Data Subscriptions..."/>
    }

    if (error) {
        return <AlertError><b>Error Loading Data Subscriptions: </b>{ error + "" }</AlertError>
    }

    return (
        <div>
            <HelmetProvider>
                <Helmet>
                    <title>Data Subscriptions</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Data Subscriptions" }
            ]} />
            <div className="row gap">
                <div className="col middle">
                    <h3><i className="icon fa-solid fa-database color-brand-2" /> Data Subscriptions</h3>
                </div>
                { user?.role === "admin" && (<div className="col col-0 middle">
                    <Link className="btn color-blue-dark btn-virtual" to="/requests/new">
                        <b className="color-green"><i className="fa-solid fa-circle-plus" /> New Data Subscription</b>
                    </Link>
                </div>) }
            </div>
            <hr className="mb-2"/>
            { groups?.filter(g => g.requests.length > 0).map((group, i) => (

                <Collapse key={i} header={
                    <><i className="fa-regular fa-folder"/> { group.name }</>
                }>
                    <Grid cols="22em" key={i} className="link-list mt-05 mb-2">
                        { group.requests.map((item, y) => (
                            <DataRequestLink request={item} href="/requests/:id" key={y} />
                        ))}
                    </Grid>
                </Collapse>
            )) }
        </div>
    )
}
