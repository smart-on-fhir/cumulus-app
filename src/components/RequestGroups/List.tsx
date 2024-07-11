import { Link }           from "react-router-dom"
import Alert              from "../generic/Alert"
import { createListPage } from "../generic/EndpointListWrapper"
import IfAllowed          from "../generic/IfAllowed"
import Markdown           from "../generic/Markdown"
import { useAuth }        from "../../auth"
import { app }            from "../../types"
import { ellipsis }       from "../../utils"
import "../generic/EndpointListTable.scss"

export default function RequestGroupList()
{
    const { user } = useAuth();

    const canCreate = user?.permissions.includes("SubscriptionGroups.create")

    return createListPage<app.RequestGroup[]>({
        nameSingular: "Subscription Group",
        namePlural  : "Subscription Groups",
        endpoint    : "/api/request-groups",
        icon        : <i className="fa-solid fa-folder color-brand-2" />,
        canCreate,
        renderList  : data => {
            data = data.filter((g: any) => !!g.id)
            return (
                <>
                    <div className="mb-2">
                        <Alert color="blue" icon="fa-solid fa-info-circle">
                            Subscriptions can be assigned to certain group, otherwise
                            they are considered part of the <b>GENERAL</b> group.
                        </Alert>
                    </div>
                    
                    { data.length ?
                        <table className="endpoint-list-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "2em" }}>ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <IfAllowed showError={false} permissions="SubscriptionGroups.update" element={ <th style={{ width: "2.5em" }} /> } />
                                    <IfAllowed showError={false} permissions="SubscriptionGroups.delete" element={ <th style={{ width: "2.5em" }} /> } />
                                </tr>
                            </thead>
                            <tbody>
                                { data.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.id}</td>
                                        <td><Link title={row.name} to={"./" + row.id} className="link">{row.name}</Link></td>
                                        <td className="color-muted"><Markdown options={{createElement: (tag, props, ...children) => <>{children} </>}}>{ ellipsis(row.description || "", 70) }</Markdown></td>
                                        <IfAllowed showError={false} permissions="SubscriptionGroups.update" element={ <td className="right nowrap">
                                            <Link title="Edit" className="btn small color-brand-2 btn-virtual" to={ row.id + "/edit" }>
                                                <i className="fa-solid fa-pen-to-square" />
                                            </Link>
                                        </td> } />
                                        <IfAllowed showError={false} permissions="SubscriptionGroups.delete" element={ <td className="right nowrap">
                                            <Link title="Delete" className="btn small color-red btn-virtual" to={ row.id + "/delete" }>
                                                <i className="fa-solid fa-trash-can" />
                                            </Link>
                                        </td> } />
                                    </tr>
                                )) }
                            </tbody>
                        </table> :
                        <div className="center">
                            <br/>
                            <p>No subscription groups found in the database. { canCreate && <span> You can start by creating new one.<br/><br/></span> }</p>
                            { canCreate && <Link to="new" className="btn btn-blue-dark pl-2 pr-2">Create Subscription Group</Link> }
                        </div>
                    }   
                </>
            )
        }
    })
}
