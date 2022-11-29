import { Link }                   from "react-router-dom"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { useAuth }                from "../../auth";
import DataRequestsList           from "../DataRequests/DataRequestsList"
import ViewsBrowser               from "../Views/ViewsBrowser"
import ActivityPanel              from "../Activity/Panel";
import Panel                      from "../generic/Panel";
import DataSiteList               from "../DataSites/LinkList";
import { useState }               from "react";



export default function Home() {

    const url = new URL(window.location.href)

    const { user } = useAuth();
    const [ viewType, setViewType ] = useState(url.searchParams.get("view") || "grid")
    const [ search, setSearch ] = useState(url.searchParams.get("q") || "")

    const onSearch = (q: string) => {
        url.searchParams.set("q", q)
        window.history.replaceState(null, "", url.href)
        setSearch(q)
    };

    const onSetViewType = (t: "grid" | "list") => {
        url.searchParams.set("view", t)
        window.history.replaceState(null, "", url.href)
        setViewType(t)
    };

    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>Cumulus</title>
                </Helmet>
            </HelmetProvider>
            <div className="row gap middle" style={{ marginTop: "-1em", padding: "6px 0 4px 0" }}>
                <div className="col col-0">
                    <h4 className="m-0">Browse Views</h4>
                </div>
                <div className="col center">
                    <input
                        type="search"
                        placeholder="Search Views by Name"
                        value={search}
                        onChange={e => onSearch(e.target.value)}
                    />
                </div>
                <div className="col col-0 right">
                    <div className="toolbar flex">
                        <button
                            className={"btn" + (viewType === "grid" ? " active" : "")}
                            onClick={() => onSetViewType("grid")}
                            title="Grid View"
                        ><i className="fa-solid fa-grip" /></button>
                        <button
                            className={"btn" + (viewType === "list" ? " active" : "")}
                            onClick={() => onSetViewType("list")}
                            title="List View"
                            ><i className="fa-solid fa-list" /></button>
                    </div>    
                </div>
            </div>
            <hr/>
            <ViewsBrowser
                layout={ viewType === "grid" ? "grid" : "column" }
                search={search}
            />
            <br/>
            <br/>
            <div className="row gap wrap">
                <div className="col col-6 responsive">
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
                <div className="col col-4 responsive">
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
