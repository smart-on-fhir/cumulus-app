import { ReactNode, useState }  from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth }              from "../../auth"
import Terminology              from "../../Terminology"
import "./Navigation.scss"


function NavGroup({ label, icon, children }: {
    icon: string | ReactNode
    label: string
    children: ReactNode
}) {
    const [ isOpen, setOpen ] = useState<boolean | undefined>()

    return (
        <>
            <div
                className={ "link" + (isOpen ? " open" : "") }
                title={ isOpen ? "Collapse Group" : "Expand Group" }
                onClick={() => setOpen(!isOpen)}
            >
                { typeof icon === "string" ?
                    <i className={ "icon " + icon } /> :
                    icon
                }<label>{ label }</label>
                { children && <i className="fas chevron fa-chevron-down" /> }
            </div>
            <div className={"group" + (isOpen === true ? " active" : isOpen === false ? " closed" : "")}>{ children }</div>
        </>
    )
}

export default function Navigation()
{
    let { loading, user, logout } = useAuth();
    let navigate = useNavigate();

    if (!user || user.status !== "Logged in" || !Array.isArray(user.permissions)) {
        // return null
        if (user && (user.status !== "Logged in" || !Array.isArray(user.permissions))) {
            logout().then(() => navigate("/"));
        }
        return null
    }

    const canReadSubscriptions = user.permissions.includes("Subscriptions.read")
    const canListGroups        = user.permissions.includes("SubscriptionGroups.read")
    const canReadTags          = user.permissions.includes("Tags.read")
    const canReadStudyAreas    = user.permissions.includes("StudyAreas.read")
    const canReadUsers         = user.permissions.includes("Users.read")
    const canManagePermissions = user.permissions.includes("Permissions.read")
    const canReadUserGroups    = user.permissions.includes("UserGroups.read")
    const canAdminister        = canReadUsers || canReadUserGroups || canManagePermissions;

    return (
        <div className="navigation">
            <div className="navigation-wrap">
                <NavLink to="/">
                    <span className="icon material-symbols-outlined">home</span>Home
                </NavLink>
                { canReadStudyAreas && <NavLink to="/study-areas">
                    <span className="icon material-symbols-outlined">{Terminology.studyArea.icon}</span>{Terminology.studyArea.namePlural}
                </NavLink> }
                <NavLink to="/views">
                    <span className="icon material-symbols-outlined">{Terminology.graph.icon}</span>{Terminology.graph.namePlural}
                </NavLink>
                <NavLink to="/sites">
                    <span className="icon material-symbols-outlined">{Terminology.site.icon}</span>{Terminology.site.namePlural}
                </NavLink>
                { canReadSubscriptions && <NavLink to="/requests">
                    <span className="icon material-symbols-outlined">{Terminology.subscription.icon}</span>{Terminology.subscription.namePlural}
                </NavLink> }
                { canListGroups && <NavLink to="/groups">
                    <span className="icon material-symbols-outlined">{Terminology.subscriptionGroup.icon}</span>{Terminology.subscriptionGroup.namePlural}
                </NavLink> }
                { canReadTags && <NavLink to="/tags">
                    <span className="icon material-symbols-outlined">{Terminology.tag.icon}</span>{Terminology.tag.namePlural}
                </NavLink> }
                <NavLink to="/study">
                    <span className="icon material-symbols-outlined">experiment</span>Study Builder
                </NavLink>
                <NavLink to="/explorer">
                    <span className="icon material-symbols-outlined">folder_open</span>Explore
                </NavLink>

                <NavGroup icon={<span className="icon material-symbols-outlined">inventory_2</span>} label="Catalog">
                    <NavLink to="/catalog/icd10"><span className="icon material-symbols-outlined">inventory_2</span>ICD10 Diagnoses</NavLink>
                    <NavLink to="/catalog/loinc"><span className="icon material-symbols-outlined">inventory_2</span>LOINC Laboratories</NavLink>
                </NavGroup>
                
                { canAdminister && (
                    <NavGroup icon={<span className="icon material-symbols-outlined">build_circle</span>} label="Administration">
                        { canReadUsers && <NavLink to="/users" end><span className="icon material-symbols-outlined">person</span>Users</NavLink> }
                        { canReadUserGroups && <NavLink to="/user-groups" end><span className="icon material-symbols-outlined">group</span>User Groups</NavLink> }
                        { canManagePermissions && <NavLink to="/permissions" end><span className="icon material-symbols-outlined">shield_lock</span>Permissions</NavLink> }
                        <NavLink to="/health-check" end><span className="icon material-symbols-outlined">stethoscope</span>Health Check</NavLink>
                    </NavGroup>
                )}

                <NavGroup icon={<span className="icon material-symbols-outlined">account_circle</span>} label="User">
                    <NavLink to="/drafts"><span className="icon material-symbols-outlined">edit_square</span>My Draft Graphs</NavLink>
                    <NavLink to="/user"><span className="icon material-symbols-outlined">manage_accounts</span>My Account</NavLink>
                    <div className="link" onClick={() => {
                        logout().then(() => navigate("/"));
                    }}>
                        <span className="icon material-symbols-outlined color-red">power_settings_new</span>
                        Sign Out
                        { loading && <i className="fas fa-circle-notch fa-spin color-muted" /> }
                    </div>
                </NavGroup>
            </div>
        </div>
    )
}