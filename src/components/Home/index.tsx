import { Link } from "react-router-dom"
import { HelmetProvider, Helmet } from "react-helmet-async"
import { useAuth } from "../../auth";
import DataRequestsList from "../DataRequests/DataRequestsList"
import ViewsBrowser from "../Views/ViewsBrowser"
import map from "./map.png"
import ActivityPanel from "../Activity/Panel";



export default function Home() {
    const { user } = useAuth();
    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>Cumulus</title>
                </Helmet>
            </HelmetProvider>
            <h4>Browse Views</h4>
            <hr/>
            <ViewsBrowser />
            <br/>
            <br/>
            <div className="row gap">
                <div className="col col-6">
                    <div className="row gap baseline">
                        <div className="col">
                            <h4>Data Subscriptions & Requests</h4>
                        </div>
                        { user?.role === "admin" && (<div className="col col-0">
                            <Link className="btn color-blue small" to="/requests/new"><b>New Data Request</b></Link>
                        </div>) }
                    </div>
                    <hr/>
                    <DataRequestsList />
                    <br/>
                    <Link to="/requests" className="color-blue underline">
                        View All Data Requests & Subscriptions
                    </Link>
                </div>
                <div className="col col-4">
                    <ActivityPanel />
                    <br/>
                    <h5>Data Sites</h5>
                    <img src={ map } alt="Sites Map" className="grey-out" />
                </div>
            </div>
            <br/>
            <br/>
        </>
    )
}
