import { Link }       from "react-router-dom"
import "./Header.scss"

export default function Header() {
    return (
        <header id="app-header">
            <div className="container container-fluid row pl-1 pr-1">
                <div className="col col-0 pr-1 middle left">
                    <Link className="logo-link" to="/">
                        <img src="/smart-logo-light-text.svg" alt="Cumulus Logo"/>CUMULUS<sup>&#xAE;</sup>
                    </Link>
                </div>
                <div className="col middle center"/>
                <div className="col pl-1 middle right">
                    <div className="nowrap">Boston Children's Hospital</div>
                </div>
            </div>
        </header>
    )
}