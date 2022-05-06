import { Link }                   from "react-router-dom"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { useAuth }                from "../../auth";
import DataRequestsList           from "../DataRequests/DataRequestsList"
import ViewsBrowser               from "../Views/ViewsBrowser"
// import map                        from "./map.png"
import ActivityPanel              from "../Activity/Panel";
import Panel                      from "../Panel";
import DataSiteList               from "../DataSites/List";



export default function Home() {
    const { user } = useAuth();
    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>Cumulus</title>
                </Helmet>
            </HelmetProvider>
            <h4><i className="fa-solid fa-grip" style={{ color: "#999" }} /> Browse Views</h4>
            <hr/>
            <ViewsBrowser />
            <br/>
            <br/>
            <div className="row gap">
                <div className="col col-6">
                    <Panel
                        title="Data Subscriptions"
                        icon={<i className="fa-solid fa-database" style={{ color: "#999" }} />}
                        menu={[
                            // <Link to="/requests">View All Data Subscriptions</Link>,
                            <Link to="/requests">View All Data Subscriptions</Link>,
                            (user?.role === "admin" ? "separator" : null),
                            // (user?.role === "admin" ? <Link to="/requests/new">Create New Data Subscription</Link> : null),
                            (user?.role === "admin" ? <Link to="/requests/new">Create New Data Subscription</Link> : null),
                            // (user?.role === "admin" ? <Link to="/groups">Manage Subscription Groups</Link> : null)
                            (user?.role === "admin" ? <Link to="/groups">Manage Subscription Groups</Link> : null)
                        ]}
                    >
                        <DataRequestsList />
                    </Panel>
                </div>
                <div className="col col-4">
                    <Panel
                        title="Data Sites"
                        icon={<i className="fa-solid fa-location-dot" style={{ color: "#999" }} />}
                        menu={[
                            <Link to="/sites">Manage Data Sites</Link>
                        ]}
                    >
                        <DataSiteList />
                        {/* <img src={ map } alt="Sites Map" className="grey-out" /> */}
                    </Panel>
                    <br/>
                    <ActivityPanel limit={10} />
                </div>
            </div>
            <br/>
            <br/>
        </>
    )
}
