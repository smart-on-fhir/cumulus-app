import { Link } from "react-router-dom";
import { AuthStatus } from "../../auth";
import "./Header.scss";
import logo from "./logo.png";


export default function Header() {
    return (
        <header id="app-header">
            <div className="container row p-1">
                <div className="col pr-1 middle left">
                    <Link to="/"><img src={ logo } alt="Cumulus Logo" width="268"/></Link>
                </div>
                <div className="col middle center"/>
                <div className="col pl-1 middle right">
                    <div className="nowrap">
                        <AuthStatus/>
                    </div>
                </div>
            </div>
        </header>
    )
}