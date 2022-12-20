import { ReactNode, useState } from "react"
import { NavLink, useLocation, matchPath, useNavigate } from "react-router-dom"
import { useAuth } from "../../auth"
import "./Navigation.scss"


function NavGroup({ to, label, icon, children, end }: {
    to?: string
    icon: string
    label: string
    end?: RegExp
    children: ReactNode
}) {
    const { pathname } = useLocation()
    const [ isOpen, setOpen ] = useState(
        to ? !!matchPath({ path: to, end: false }, pathname) : false
    )

    return (
        <>
            { to ?
                <NavLink to={ to } end={ end ? !end.test(pathname) : true }>
                    <i className={ "icon " + icon } /><label>{ label }</label>
                    { children && <i
                        className={ "fas chevron " + (isOpen ? "fa-chevron-down" : "fa-chevron-right") }
                        title={ isOpen ? "Collapse Group" : "Expand Group" }
                        onClick={ e => {
                            e.preventDefault()
                            e.stopPropagation()
                            setOpen(!isOpen)
                        }}
                    /> }
                </NavLink> :
                <div
                    className={ "link" + (isOpen ? " open" : "") }
                    title={ isOpen ? "Collapse Group" : "Expand Group" }
                    onClick={() => setOpen(!isOpen)}
                >
                    <i className={ "icon " + icon } /><label>{ label }</label>
                    { children && <i className={ "fas chevron " + (isOpen ? "fa-chevron-down" : "fa-chevron-right") } /> }
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

    const canCreateProjects = user.permissions.includes("Projects.create")

    return (
        <div className="navigation">
            <div className="navigation-wrap">
                <NavLink to="/"><i className="icon fa-solid fa-house-chimney"></i> Home</NavLink>
                
                
                <NavGroup to="/projects" label="Study Areas" icon="fa-solid fa-book" end={ /^\/projects(\/\d+.*?)?$/ }>
                    { canCreateProjects && <NavLink to="/projects/new"><i className="icon fa-solid fa-circle-plus" /> New Study Area</NavLink> }
                </NavGroup>

                <NavLink to="/views"><i className="icon fa-solid fa-chart-pie" /> Graphs</NavLink>

                <NavLink to="/sites"><i className="icon fa-solid fa-location-dot" /> Data Sites</NavLink>
                
                <NavLink to="/requests"><i className="icon fa-solid fa-database" /> Data Subscriptions</NavLink>
                <NavLink to="/groups"><i className="icon fa-solid fa-folder" /> Subscription Groups</NavLink>
                {/* <NavGroup icon="fa-solid fa-database" label="Data">
                    <NavLink to="/requests/new"><i className="icon fa-solid fa-calendar-plus" /> New Data Subscription</NavLink>
                </NavGroup> */}
                <NavLink to="/tags"><i className="icon fa-solid fa-tag" /> Tags</NavLink>
                
                { user.role === "admin" && (
                    <NavGroup icon="fa-solid fa-screwdriver-wrench" label="Administration">
                        {/* <NavLink to="/settings"><i className="icon fa-solid fa-cog" /> Settings</NavLink> */}
                        <NavLink to="/users" end><i className="icon fa-solid fa-users" /> Users</NavLink>
                        {/* <NavLink to="/users/invite"><i className="icon fa-solid fa-user-plus" /> Invite User</NavLink> */}
                        {/* <NavLink to="/permissions"><i className="icon fa-solid fa-user-shield" /> Roles &amp; Permissions</NavLink> */}
                        <NavLink to="/activity"><i className="icon fa-solid fa-clipboard-list" /> Activity</NavLink>
                        <NavLink to="/logs"><i className="icon fa-solid fa-clipboard-list" /> View Logs</NavLink>
                        {/* <NavLink to="/tags"><i className="icon fa-solid fa-tag" /> Manage Tags</NavLink> */}
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