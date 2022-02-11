import { Link } from "react-router-dom"
import DataRequestsList from "../DataRequests/DataRequestsList"
import ViewsBrowser from "../Views/ViewsBrowser"
import map from "./map.png"



export default function Home() {
    return (
        <>
            <h4>Browse Views</h4>
            <hr/>
            <ViewsBrowser />
            <br/>
            <br/>
            <div className="row gap">
                <div className="col col-6">
                    <div className="row gap">
                        <div className="col middle">
                            <h4>Data Subscriptions & Requests</h4>
                        </div>
                        <div className="col col-0 middle">
                            <Link className="btn color-blue" to="/requests/new"><b>New Data Request</b></Link>
                        </div>
                    </div>
                    <hr/>
                    <DataRequestsList />
                    <br/>
                    <Link to="/requests" className="color-blue underline">
                        View All Data Requests & Subscriptions
                    </Link>
                </div>
                <div className="col col-4 grey-out">
                    <h4>Recent Activity</h4>
                    <hr/>
                    <ul>
                        <li>
                            Data request approved
                            <div className="color-muted">4:47 PM December 9, 2021</div>
                        </li>
                        <li>
                            Data subscription error: [no response]
                            <div className="color-muted">12:01 PM December 7, 2021</div>
                        </li>
                        <li>
                            Data subscription scheduled update succeeded
                            <div className="color-muted">6:05 PM December 6, 2021</div>
                        </li>
                        <li>
                            Data subscription scheduled update succeeded
                            <div className="color-muted">6:03 PM December 6, 2021</div>
                        </li>
                        <li>
                            Data subscription scheduled update succeeded
                            <div className="color-muted">6:00 PM December 6, 2021</div>
                        </li>
                    </ul>
                    <Link to="#" className="color-blue underline">View All Activity</Link>
                    <br/>
                    <h5>Data Sites</h5>
                    <img src={ map } alt="Sites Map" />
                </div>
            </div>
            <br/>
            <br/>
        </>
    )
}
