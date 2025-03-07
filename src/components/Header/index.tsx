import { Link }          from "react-router-dom"
import MenuButton        from "../generic/MenuButton"
import Grid              from "../generic/Grid"
import Loader            from "../generic/Loader"
import Search            from "../Search"
import { useAggregator } from "../../Aggregator"
import { useAuth }       from "../../auth"
import Terminology       from "../../Terminology"
import "./Header.scss"


function CloudIcon() {
    const { status } = useAggregator()

    if (status === "loading") {
        return <Loader msg="" />
    }
    if (status === "offline") {
        return <i className="material-symbols-outlined" style={{ fontSize: "2rem" }}>cloud_off</i>
    }
    if (status === "connected") {
        return <i className="material-symbols-outlined" style={{ fontSize: "2rem" }}>cloud_done</i>
    }
    if (status === "failed") {
        return <i className="fas fa-exclamation-circle" style={{ fontSize: "1.2rem" }} />
    }
    return null
}

function CloudMenu() {
    const { aggregator, status, error } = useAggregator()
    if (status === "loading") {
        return <Loader msg="Connecting to aggregator..." />
    }
    if (status === "offline") {
        return <Grid cols="3rem 1fr" style={{ alignItems: "center" }}>
            <i className="fas fa-minus-circle color-grey" style={{ fontSize: "2rem" }} />
            <div>
                <b>Not connected to data aggregator</b>
                <p className="color-muted small">
                    Data aggregator is not configured or is turned off. You will <br />
                    not be able to use {Terminology.subscription.namePlural.toLowerCase()} with remote data.
                </p>
            </div>
        </Grid>
    }
    if (status === "connected") {
        return <Grid cols="3rem 1fr" style={{ alignItems: "center" }}>
            <i className="fas fa-check-circle color-green" style={{ fontSize: "2rem" }} />
            <div>
                <b>Connected to data aggregator</b>
                <div className="color-blue-dark small">{ aggregator.baseUrl }</div>
                <p className="color-muted small">You will be able to use {Terminology.subscription.namePlural.toLowerCase()} with data<br />from this data aggregator</p>
            </div>
        </Grid>
    }
    if (status === "failed") {
        return <Grid cols="3rem 1fr" style={{ alignItems: "center" }}>
            <i className="fas fa-exclamation-circle color-red" style={{ fontSize: "2rem" }} />
            <div>
                <b>Not connected to data aggregator</b>
                <div className="color-blue-dark small">{ aggregator.baseUrl }</div>
                <p className="color-muted small">
                    Connecting to the data aggregator failed! It is probably<br />offline, or not properly configured.
                </p>
                <p className="color-red small">{ error + "" }</p>
            </div>
        </Grid>
    }
    return null
}

export default function Header() {
    const { user } = useAuth()
    return (
        <header id="app-header">
            <div className="container container-fluid row pr-1">
                <div className="col col-0 pr-1 middle left">
                    <Link className="logo-link" to="/">
                        <span className="material-symbols-outlined logo-icon">nest_farsight_weather</span>
                        CUMULUS<sup>&#xAE;</sup>
                    </Link>
                </div>
                <div className="col middle center">
                    { user && <Search /> }
                </div>
                <div className="col col-0 pl-1 middle right">
                    <MenuButton right items={ <div className="p-1"><CloudMenu /></div> }>
                        <CloudIcon />
                    </MenuButton>
                </div>
            </div>
        </header>
    )
}