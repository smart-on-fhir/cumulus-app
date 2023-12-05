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
import Collapse                   from "../generic/Collapse"
import { app }                    from "../../types"

import "./DataRequestsListPage.scss";



export default function DataRequestsListPage()
{
    const { user } = useAuth();

    const { loading, error, result: groups } = useBackend(
        useCallback(() => request<app.RequestGroup[]>("/api/requests/by-group"), []),
        true
    );

    if (loading) {
        return <Loader msg="Loading Subscriptions..."/>
    }

    if (error) {
        return <AlertError><b>Error Loading Subscriptions: </b>{ error + "" }</AlertError>
    }

    const groupsData = groups?.filter(g => g.requests.length > 0)

    return (
        <div>
            <HelmetProvider>
                <Helmet>
                    <title>Subscriptions</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Subscriptions" }
            ]} />
            <div className="row gap">
                <div className="col middle">
                    <h3><i className="icon fa-solid fa-database color-brand-2" /> Subscriptions</h3>
                </div>
                { user?.permissions.includes("Subscriptions.create") && (<div className="col col-0 middle">
                    <Link className="btn color-blue-dark btn-virtual" to="/requests/new">
                        <b className="color-green"><i className="fa-solid fa-circle-plus" /> New Subscription</b>
                    </Link>
                </div>) }
            </div>
            <hr className="mb-2"/>

            { !groupsData?.length ?
                <div className="center">
                    <br/>
                    <p>No subscriptions found in the database! You can start by creating new subscription.</p>
                    <br/>
                    <Link to="./new" className="btn btn-blue-dark pl-2 pr-2">Create Data Subscription</Link>
                </div> :
                groupsData.map((group, i) => (

                    <Collapse key={i} header={
                        <><i className="fa-regular fa-folder"/> { group.name }</>
                    }>
                        <Grid cols="22em" key={i} className="link-list mt-05 mb-2">
                            { group.requests.map((item, y) => (
                                <DataRequestLink request={item} href="/requests/:id" key={y} />
                            ))}
                        </Grid>
                    </Collapse>
                ))
            }
        </div>
    )
}
