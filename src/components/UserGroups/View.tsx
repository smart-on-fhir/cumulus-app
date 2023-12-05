import { useAuth }        from "../../auth"
import { createViewPage } from "../generic/EndpointViewWrapper"
import { app }            from "../../types"
import { UserGrid }       from "./UserGrid"


export default function View() {

    const { user } = useAuth();

    const canUpdate = user?.permissions.includes("UserGroups.update")
    const canDelete = user?.permissions.includes("UserGroups.delete")

    return createViewPage<app.UserGroup>({
        endpoint    : "/api/user-groups",
        namePlural  : "User Groups",
        icon        : <i className="fa-solid fa-user-friends color-brand-2" />,
        query       : "users=true",
        basePath    : "/user-groups",
        canUpdate,
        canDelete,
        renderView  : data => <>
            <div className="mt-05">
                <span className="color-muted">Name: </span>
                <span className="color-brand-2">{ data.name }</span>
            </div>
            <div className="mt-05" style={{ whiteSpace: "pre-wrap" }}>
                <span className="color-muted">Description: </span>{ data.description }
            </div>
            <div className="mt-05 mb-2">
                <span className="color-brand-2 bold">Included Users: </span>
                { data.users?.length ?
                    <UserGrid users={data.users as any} /> :
                    <span>This group does not include any users</span> }
            </div>
        </>
    })
}