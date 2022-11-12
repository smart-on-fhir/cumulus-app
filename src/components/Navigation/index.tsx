import { ReactNode, useState } from "react"
import { NavLink, useLocation, matchPath, useNavigate } from "react-router-dom"
import { useAuth } from "../../auth"
import "./Navigation.scss"


function NavGroup({ to, label, icon, children }: {
    to?: string
    icon: string
    label: string
    children: ReactNode
}) {
    const { pathname } = useLocation()
    const [ isOpen, setOpen ] = useState(
        to ? !!matchPath({ path: to, end: false }, pathname) : false
    )

    return (
        <>
            { to ?
                <NavLink to={ to } end>
                    <i className={ "icon " + icon } /><label>{ label }</label>
                    <i
                        className={ "fas chevron " + (isOpen ? "fa-chevron-down" : "fa-chevron-right") }
                        title={ isOpen ? "Collapse Group" : "Expand Group" }
                        onClick={ e => {
                            e.preventDefault()
                            e.stopPropagation()
                            setOpen(!isOpen)
                        }}
                    />
                </NavLink> :
                <div
                    className={ "link" + (isOpen ? " open" : "") }
                    title={ isOpen ? "Collapse Group" : "Expand Group" }
                    onClick={() => setOpen(!isOpen)}
                >
                    <i className={ "icon " + icon } /><label>{ label }</label>
                    <i className={ "fas chevron " + (isOpen ? "fa-chevron-down" : "fa-chevron-right") } />
                </div>
            }
            { isOpen && <div className="group active">{ children }</div> }
        </>
    )
}

export default function Navigation()
{
    let { loading, user, logout } = useAuth();
    let navigate = useNavigate();

    if (!user) {
        return null
    }

    return (
        <div className="navigation">
            <div className="navigation-wrap">
                <NavLink to="/"><i className="icon fa-solid fa-house-chimney"></i> Home</NavLink>
                
                <NavGroup to="/projects" label="Projects" icon="fa-solid fa-book">
                    <NavLink to="/projects/new"><i className="icon fa-solid fa-circle-plus" /> New Project</NavLink>
                </NavGroup>

                <NavLink to="/views"><i className="icon fa-solid fa-chart-pie" /> Graphs</NavLink>

                <NavGroup to="/sites" icon="fa-solid fa-location-dot" label="Sites">
                    <NavLink to="/sites/new"><i className="icon fa-solid fa-circle-plus" /> Add Site</NavLink>
                </NavGroup>
                
                <NavGroup icon="fa-solid fa-database" label="Data">
                    <NavLink to="/requests" end><i className="icon fa-solid fa-database" /> Data Subscriptions</NavLink>
                    <NavLink to="/groups"><i className="icon fa-solid fa-folder" /> Data Request Groups</NavLink>
                    <NavLink to="/requests/new"><i className="icon fa-solid fa-calendar-plus" /> New Data Subscription</NavLink>
                </NavGroup>
                
                { user.role === "admin" && (
                    <NavGroup icon="fa-solid fa-screwdriver-wrench" label="Administration">
                        {/* <NavLink to="/settings"><i className="icon fa-solid fa-cog" /> Settings</NavLink> */}
                        <NavLink to="/users" end><i className="icon fa-solid fa-users" /> Users</NavLink>
                        <NavLink to="/users/invite"><i className="icon fa-solid fa-user-plus" /> Invite User</NavLink>
                        {/* <NavLink to="/permissions"><i className="icon fa-solid fa-user-shield" /> Roles &amp; Permissions</NavLink> */}
                        <NavLink to="/activity"><i className="icon fa-solid fa-clipboard-list" /> Logs</NavLink>
                    </NavGroup>
                )}

                <hr />

                <NavGroup icon="fa-solid fa-user" label={ user?.name || user?.email }>
                    <NavLink to="/user"><i className="icon fa-solid fa-user-pen" /> My Account</NavLink>
                    <div className="link" onClick={() => {
                        logout().then(() => navigate("/"));
                    }}>
                        <i className="icon fa-solid fa-right-from-bracket" />
                        <b className="color-red"> SIGN OUT </b>
                        { loading && <i className="fas fa-circle-notch fa-spin color-muted" /> }
                    </div>
                </NavGroup>
            </div>
        </div>
    )
}