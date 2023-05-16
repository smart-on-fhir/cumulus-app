import { Link }           from "react-router-dom"
import Alert              from "../generic/Alert"
import { createListPage } from "../generic/EndpointListWrapper"
import IfAllowed          from "../generic/IfAllowed"
import { useAuth }        from "../../auth"
import "../generic/EndpointListTable.scss"

export default function RequestGroupList()
{
    const { user } = useAuth();

    return createListPage<app.RequestGroup[]>({
        nameSingular: "Subscription Group",
        namePlural  : "Subscription Groups",
        endpoint    : "/api/request-groups",
        icon        : <i className="fa-solid fa-folder color-brand-2" />,
        canCreate   : user?.permissions.includes("RequestGroups.create"),
        renderList  : data => <>
            <div className="mb-2">
                <Alert color="blue" icon="fa-solid fa-info-circle">
                    Subscriptions can be assigned to certain group, otherwise
                    they are considered part of the <b>GENERAL</b> group.
                </Alert>
            </div>
            <table className="endpoint-list-table">
                <thead>
                    <tr>
                        <th style={{ width: "2em" }}>ID</th>
                        <th style={{ width: "60%" }}>Name</th>
                        <th>Description</th>
                        <IfAllowed showError={false} permissions="RequestGroups.update" element={ <th style={{ width: "2.5em" }} /> } />
                        <IfAllowed showError={false} permissions="RequestGroups.delete" element={ <th style={{ width: "2.5em" }} /> } />
                    </tr>
                </thead>
                <tbody>
                    {data.filter((g: any) => !!g.id).map((row, i) => (
                        <tr key={i}>
                            <td>{row.id}</td>
                            <td><Link title={row.name} to={"./" + row.id} className="link">{row.name}</Link></td>
                            <td>{row.description || ""}</td>
                            <IfAllowed showError={false} permissions="RequestGroups.update" element={ <td className="right nowrap">
                                <Link title="Edit" className="btn small color-brand-2 btn-virtual" to={ row.id + "/edit" }>
                                    <i className="fa-solid fa-pen-to-square" />
                                </Link>
                            </td> } />
                            <IfAllowed showError={false} permissions="RequestGroups.delete" element={ <td className="right nowrap">
                                <Link title="Delete" className="btn small color-red btn-virtual" to={ row.id + "/delete" }>
                                    <i className="fa-solid fa-trash-can" />
                                </Link>
                            </td> } />
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    })
}
