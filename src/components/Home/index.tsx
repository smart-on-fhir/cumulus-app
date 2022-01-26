import { Link } from "react-router-dom"
import ViewsBrowser from "../ViewsBrowser"
import map from "./map.png"

function Icon(props: { type: "ok"|"pending"|"working" }) {
    return (
        <div className="icon">
            <i className="fas fa-database"/>
            { props.type == "pending" && <i className="fas fa-clock"/> }
            { props.type == "working" && <i className="fas fa-sync-alt"/> }
            { props.type == "ok" && <i className="fas fa-check-circle"/> }
        </div>
    )
}

export default function Home() {
    return (
        <>
            <ViewsBrowser />
            <br/>
            <br/>
            <div className="row gap">
                <div className="col col-6">
                    <h4>Data Subscriptions & Requests</h4>
                    <hr/>
                    <h6>COVID-19</h6>
                    <ul className="small icon-list">
                        <li>
                            <Link to="#">
                                <Icon type="working" />
                                Positive test + loss of taste or smell by demographics
                                <div className="color-muted">SUBSCRIPTION (Last refreshed on Dec 7, 2021)</div>
                            </Link>
                        </li>
                        <li>
                            <Link to="#">
                                <Icon type="pending" />
                                Positive test + loss of taste or smell by admission status
                                <div className="color-muted">PENDING SUBSCRIPTION</div>
                            </Link>
                        </li>
                        <li>
                            <Link to="#">
                                <Icon type="ok" />
                                Positive test + ICU admissions 
                                <div className="color-muted">Completed November 15, 2021</div>
                            </Link>
                        </li>
                    </ul>
                    <h6>INFLUENZA</h6>
                    <ul className="small icon-list">
                        <li>
                            <Link to="#">
                                <Icon type="working" />
                                Positive test by phenotype by demographics
                                <div className="color-muted">SUBSCRIPTION (Last refreshed on Dec 10, 2021)</div>
                            </Link>
                        </li>
                        <li>
                            <Link to="#">
                                <Icon type="pending" />
                                Positive test by phenotype by clinical characteristics
                                <div className="color-muted">PENDING SUBSCRIPTION</div>
                            </Link>
                        </li>
                    </ul>
                    <h6>HIV</h6>
                    <ul className="small icon-list">
                        <li>
                            <Link to="#">
                                <Icon type="ok" />
                                Positive case by demographics
                                <div className="color-muted">Completed November 1, 2021</div>
                            </Link>
                        </li>
                    </ul>
                    <br/>
                    <Link to="#" className="color-blue underline">
                        View All Data Requests & Subscriptions
                    </Link>
                </div>
                <div className="col col-4">
                    <h4>Recent Activity</h4>
                    <hr/>
                    <ul className="small">
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
                    <img src={ map } />
                </div>
            </div>
            <br/>
            <br/>
        </>
    )
}
