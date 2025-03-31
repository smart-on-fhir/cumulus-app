import { Link }       from "react-router-dom"
import createListPage from "../generic/EndpointListWrapper"
import Alert          from "../generic/Alert"
import { useAuth }    from "../../auth"
import IfAllowed      from "../generic/IfAllowed"
import { app }        from "../../types"


export default function List()
{
    const { user } = useAuth();

    const canCreate = user?.permissions.includes("UserGroups.create")

    return createListPage<app.UserGroup[]>({
        namePlural: "User Groups",
        endpoint  : "/api/user-groups?users=true",
        icon      : <i className="fa-solid fa-user-friends color-brand-2" />,
        canCreate,
        renderList: data => {
            
            if (!data.length) {
                return <div className="center">
                    <br/>
                    <p>No user groups found in the database! You can start by creating new group.</p>
                    <br/>
                    <Link to="./new" className="btn btn-blue-dark pl-2 pr-2">Create User Group</Link>
                </div>
            }

            return <>
                <Alert color="blue" icon="fa-solid fa-info-circle">
                    User groups are containers for multiple users. When people
                    share their graphs they can choose to share it with a group
                    instead of manually selecting specific users.
                </Alert>
                <div className="table-responsive">
                    <table className="mt-2 table-hover table-border-x table-condensed">
                        <thead>
                            <tr>
                                <th style={{ width: "1.9em" }}>ID</th>
                                <th style={{ width: "20%" }}>Name</th>
                                <th>Description</th>
                                <th>Users</th>
                                <th style={{ width: "6em" }}>Created</th>
                                <th style={{ width: "6em" }}>Updated</th>
                                <IfAllowed showError={false} permissions="UserGroups.update" element={ <th style={{ width: "2.5em" }} /> } />
                                <IfAllowed showError={false} permissions="UserGroups.delete" element={ <th style={{ width: "2.5em" }} /> } />
                            </tr>
                        </thead>
                        <tbody>
                        { data.map((record, i) => (
                            <tr key={i}>
                                <td className="color-muted">{ record.id }</td>
                                <td><Link className="link" to={"./" + record.id}>{ record.name }</Link></td>
                                <td>{ record.description }</td>
                                <td>{ record.users?.length || 0 }</td>
                                <td className="color-muted">{ new Date(record.createdAt).toLocaleDateString() }</td>
                                <td className="color-muted">{ new Date(record.updatedAt).toLocaleDateString() }</td>
                                <IfAllowed showError={false} permissions="UserGroups.update" element={ <td className="right nowrap">
                                    <Link className="btn small btn-virtual" to={ `./${record.id}/edit` }>
                                        <i className="fa-solid fa-pen-to-square color-blue-dark" />
                                    </Link>
                                </td> } />
                                <IfAllowed showError={false} permissions="UserGroups.delete" element={ <td className="right nowrap">
                                    <Link className="btn small btn-virtual" to={ `./${record.id}/delete` }>
                                        <i className="fa-solid fa-trash-can color-red" />
                                    </Link>
                                </td> } />
                            </tr>
                        )) }
                        </tbody>
                    </table>
                </div>
            </>
        }
    });
}