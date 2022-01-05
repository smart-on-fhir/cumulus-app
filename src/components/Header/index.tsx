import "./Header.scss";
import logo from "./logo.png";


export default function Header() {
    return (
        <header id="app-header">
            <div className="container row p-1">
                <div className="col pr-1 middle left">
                    <img src={ logo } width="268"/>
                </div>
                <div className="col middle center"/>
                <div className="col pl-1 middle right">
                    <div className="nowrap">
                        <i className="fas fa-user-circle" style={{ fontSize: "200%", verticalAlign: "middle" }} /> <b>Full Name</b>
                        <a className="ml-1" href="#"><b>SIGN OUT</b></a>
                    </div>
                </div>
            </div>
        </header>
    )
}