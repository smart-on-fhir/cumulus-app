import { useState }               from "react"
import { Helmet, HelmetProvider } from "react-helmet-async"
import { useAuth }                from "../../auth"
import { request, updateOne }     from "../../backend"
import CommandButton              from "../../commands/CommandButton"
import { CreatePermission }       from "../../commands/Graphs/Share/CreatePermission"
import { useBackend, useCommand } from "../../hooks"
import { app }                    from "../../types"
import { buildPermissionLabel }   from "../../utils"
import Alert, { AlertError }      from "../generic/Alert"
import Collapse                   from "../generic/Collapse"
import EndpointListWrapper        from "../generic/EndpointListWrapper"
import Grid                       from "../generic/Grid"
import StaticGrid                 from "../generic/StaticGrid"
import { Tabs }                   from "../generic/Tabs"
import "./Permissions.scss"


function groupBy<T>(data: T[], key: keyof T): Record<string, T[]> {
    const out: Record<string, T[]> = {}
    data.forEach(rec => {
        const id = rec[key] + ""
        // @ts-ignore
        if (!out[id]) { out[id] = [] }
        // @ts-ignore
        out[id].push(rec)
    })
    return out
}

const roleBgColors = {
    admin  : "#F99",
    manager: "#FC6",
    owner  : "#EAE",
    user   : "#9D9",
    guest  : "#0BB"
}


export default function PermissionsManager() {
    const { user } = useAuth()
    const [ key, setKey ] = useState(0)
    const createPermissionCommand = useCommand(new CreatePermission(user, () => setKey(key + 1)));

    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>Cumulus Permissions</title>
                </Helmet>
            </HelmetProvider>
            <div className="permissions-page container">
                <div className="pt-1 row gap">
                    <div className="col">
                        <h4>
                            <i className="icon fa-solid fa-shield color-blue-dark" /> Manage Permissions
                        </h4>
                    </div>
                    <div className="col col-0">
                        <CommandButton { ...createPermissionCommand } />
                    </div>
                </div>
                <hr />
                <br />
                <Tabs children={[
                    {
                        name: "Role-based Permissions",
                        children: (
                            <EndpointListWrapper key={key + "-role-based"} endpoint="/api/permissions?order=resource:asc&where=role:not:null&where=resource_id:eq:null&where=user_group_id:eq:null">
                            { (data: app.Permission[]) => {
                                let lastObject = "", buffer: app.Permission[] = [], children: JSX.Element[] = [];
                                data.forEach((row: app.Permission, i) => {
                                    if (lastObject !== row.resource) {
                                        if (buffer.length) {
                                            children.push(<ObjectPermissions key={children.length} permissions={[ ...buffer ]} />)
                                            buffer = []
                                        }
                                        lastObject = row.resource
                                    }
                                    buffer.push(row)
                                })
                                if (buffer.length) {
                                    children.push(<ObjectPermissions key={children.length} permissions={buffer} />)
                                }
                                return (
                                    <div className="p-1 pb-2">
                                        <div className="p-1">
                                            <p>Role-based permissions can be used to allow any user having certain role perform given action. The Cumulus recognizes the following roles:</p>
                                            <ul className="ml-2 ml-2 mb-2">
                                                <li><code>admin</code> - This is the superuser who can do everything. Admin's permissions cannot be revoked and are only listed here for clarity.</li>
                                                <li><code>manager</code> - Managers can do most things admins can, except for a few critical actions.</li>
                                                <li><code>user</code> - Anybody who is logged in and is neither admin, nor manager.</li>
                                                {/* <li><code>owner</code> - In some occasions, users can also be considered owners of the accessed resource. For example users "own" their user account records and the graphs they have created.</li> */}
                                                <li><code>guest</code> - Anybody who is trying to access the dashboard without being logged in. If you don't see it in the user interface, it means that there are no actions that guests are allowed to perform.</li>
                                            </ul>
                                        </div>
                                        <div children={children} />
                                    </div>
                                )
                            } }
                            </EndpointListWrapper>
                        )
                    },
                    {
                        name: "User-based permissions",
                        children: <UserPermissionsUI key={key + "-user-based"} />
                    },
                    {
                        name: "Group-based permissions",
                        children: <GroupPermissionsUI key={key + "-group-based"} />
                    }
                ]} />
            </div>
        </>
    )
}

function ObjectPermissions({ permissions }: { permissions: app.Permission[] }) {
    const roles = groupBy(permissions, "role")

    return (
        <Collapse header={
            <><i className="icon icon-2 material-symbols-rounded">database</i> { permissions[0].resource }</>
        }>
            <div className="pl-3 pt-1 pb-2">
                <Grid cols="1fr 1fr 1fr" gap="2rem">
                    { Object.keys(roles).sort().map((role, i) => {
                        return <div key={i}>
                            <h6 className="mb-1" style={{ padding: "0.25em 0", borderBottom: "3px solid " + (roleBgColors[role as keyof typeof roleBgColors] || "#EEE") }}>
                                <i className="icon fa-solid fa-user color-muted" /> {role}
                            </h6>
                            { roles[role].sort((a, b) => a.action.localeCompare(b.action)).map(p => (
                                <PermissionCheckbox permission={p} key={p.id} />
                            )) }
                        </div>
                    }) }
                </Grid>
            </div>
        </Collapse>
    )
}

function PermissionCheckbox({ permission } : { permission: app.Permission }) {

    const [checked, setChecked] = useState(permission.permission)

    const { execute: toggle, loading } = useBackend(async () => {
        await updateOne("permissions", permission.id, { permission: !checked })
            .then(p => setChecked(!!p.permission))
            .catch(e => alert(e.message));
    });

    return (
        <label className="permission-checkbox-label" aria-disabled={permission.role === "admin"} data-tooltip={permission.comment}>
            { loading ? <i className="fas fa-circle-notch fa-spin"/> :
            <input type="checkbox"
                checked={ checked }
                onChange={ toggle }
            /> }
            { permission.comment || permission.action }
        </label>
    )
}

function UserPermissionsUI() {

    const [selection, setSelection] = useState<app.Permission[]>([])
    const [deleting, setDeleting  ] = useState<boolean>(false)
    const [error   , setError     ] = useState<Error|null>(null)
    const [key     , setKey       ] = useState<number>(0)

    function deleteSelected() {
        setDeleting(true)
            request("/api/permissions?id=" + selection.map(p => p.id).join(","), { method: "DELETE" }).then(
                () => {
                    setError(null)
                    setSelection([])
                    setKey(key + 1)
                },
                setError
            ).finally(() => setDeleting(false))
    }

    return <>
        <div className="p-1 pb-0">
            These permissions are used to allow or refuse specific users to perform
            given actions against specific resources. When users share something
            with other users, the permission record(s) will appear here. The
            administrator can then choose to delete them which will effectively
            revoke access permissions.
        </div>
        <div className="p-1">
            <EndpointListWrapper endpoint="/api/permissions?order=resource:asc&where=user_id:not:null&include=User:email" key={key}>
                { (data: app.Permission[]) => {
                    if (!data.length) {
                        return <Alert color="orange" icon="fas fa-exclamation-circle"><b>No records found</b></Alert>
                    }
                    return <div aria-disabled={deleting}>
                        { error && <AlertError>{ error }</AlertError> }
                        <StaticGrid
                            columns={[
                                {
                                    name : "id",
                                    label: "ID",
                                    type : "number"
                                },
                                {
                                    name : "user_id",
                                    label: "User",
                                    type : "number",
                                    searchable: true,
                                    render: (r) => r.User.email,
                                    value : (r) => r.User.email,
                                },
                                {
                                    name : "resource",
                                    label: "Resource Type",
                                    type : "string",
                                    searchable: true
                                },
                                {
                                    name  : "resource_id",
                                    label : "Resource ID",
                                    type  : "number",
                                    searchable: true,
                                    render: (r) => r.resource_id ?? <span className="color-brand-2">ALL</span>
                                },
                                {
                                    name  : "attribute",
                                    label : "Attribute",
                                    type  : "string",
                                    searchable: true,
                                    render: (r) => r.attribute || <span className="color-brand-2">ALL</span>
                                },
                                {
                                    name: "action",
                                    label: "Action",
                                    type: "string",
                                    searchable: true
                                },
                                {
                                    name  : "permission",
                                    label : "Permission",
                                    type  : "string",
                                    render: (r) => r.permission ? <span className="color-green">Yes</span> : <span className="color-red">No</span>
                                }
                            ]}
                            rows={ data }
                            groupBy="action"
                            groupLabel={ value => <>Permission to <b>{value}</b></> }
                            selection={ selection }
                            onSelectionChange={ setSelection }
                            selectionType="multiple"
                            rowTitle={ buildPermissionLabel }
                        />
                        <div className="pt-1">
                            <button
                                type="button"
                                className={ selection.length ? "btn-brand-2" : "btn" }
                                disabled={!selection.length}
                                onClick={() => deleteSelected()}
                            >Remove selected</button>
                        </div>
                    </div>
                }}
            </EndpointListWrapper>
        </div>
    </>
}

function GroupPermissionsUI() {

    const [selection, setSelection] = useState<app.Permission[]>([])
    const [deleting, setDeleting  ] = useState<boolean>(false)
    const [error   , setError     ] = useState<Error|null>(null)
    const [key     , setKey       ] = useState<number>(0)


    function deleteSelected() {
        setDeleting(true)
            request("/api/permissions?id=" + selection.map(p => p.id).join(","), { method: "DELETE" }).then(
                () => {
                    setError(null)
                    setKey(key + 1)
                },
                setError
            ).finally(() => setDeleting(false))
    }

    return <>
        <div className="p-1 pb-0">
            These permissions are used to allow or refuse users belonging to
            specific User Group to perform given action against specific resources.
            When users share something with an User Group, the permission record(s)
            will appear here. The administrator can then choose to delete them
            which will effectively revoke access permissions.
        </div>
        <div className="p-1">
            <EndpointListWrapper endpoint="/api/permissions?order=resource:asc&where=user_group_id:not:null&include=UserGroup:name" key={key}>
                { (data: app.Permission[]) => {
                    if (!data.length) {
                        return <Alert color="orange" icon="fas fa-exclamation-circle"><b>No records found</b></Alert>
                    }
                    return <div aria-disabled={deleting}>
                        { error && <AlertError>{ error }</AlertError> }
                        <StaticGrid
                            columns={[
                                {
                                    name : "id",
                                    label: "ID",
                                    type : "number"
                                },
                                {
                                    name      : "user_group_id",
                                    label     : "User Group",
                                    type      : "number",
                                    searchable: true,
                                    render    : (r) => r.UserGroup.name,
                                    value     : (r) => r.UserGroup.name,
                                },
                                {
                                    name : "resource",
                                    label: "Resource Type",
                                    type : "string",
                                    searchable: true
                                },
                                {
                                    name  : "resource_id",
                                    label : "Resource ID",
                                    type  : "number",
                                    searchable: true,
                                    render: (r) => r.resource_id ?? <span className="color-brand-2">ALL</span>
                                },
                                {
                                    name  : "attribute",
                                    label : "Attribute",
                                    type  : "string",
                                    searchable: true,
                                    render: (r) => r.attribute || <span className="color-brand-2">ALL</span>
                                },
                                {
                                    name: "action",
                                    label: "Action",
                                    type: "string",
                                    searchable: true
                                },
                                {
                                    name  : "permission",
                                    label : "Permission",
                                    type  : "string",
                                    render: (r) => r.permission ? <span className="color-green">Yes</span> : <span className="color-red">No</span>
                                }
                            ]}
                            rows={data}
                            selectionType="multiple"
                            selection={selection}
                            onSelectionChange={setSelection}
                            rowTitle={buildPermissionLabel}
                        />
                        <div className="pt-1">
                            <button
                                className={ selection.length ? "btn-brand-2" : "btn" }
                                disabled={!selection.length}
                                type="button"
                                onClick={() => deleteSelected()}
                            >Remove selected</button>
                        </div>
                    </div>
                }}
            </EndpointListWrapper>
        </div>
    </>
}

