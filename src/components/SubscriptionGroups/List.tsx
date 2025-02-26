import { Fragment }   from "react"
import { Link }       from "react-router-dom"
import Alert          from "../generic/Alert"
import createListPage from "../generic/EndpointListWrapper"
import IfAllowed      from "../generic/IfAllowed"
import Markdown       from "../generic/Markdown"
import { useAuth }    from "../../auth"
import { app }        from "../../types"
import { ellipsis }   from "../../utils"
import "../generic/EndpointListTable.scss"


export function MarkdownPreview({ markdown, maxLen=70 }: { markdown: string, maxLen?: number }) {
    let i = 0;
    const txt = String(markdown || "").replace(/<.*?>/g, "")
    return <Markdown options={{
        createElement: (tag, props, ...children) => <Fragment key={ i++ }>{children} </Fragment>,
    }}>{ maxLen ? ellipsis(txt, maxLen) : txt }</Markdown>
}

export default function SubscriptionGroupList()
{
    const { user } = useAuth();

    const canCreate = user?.permissions.includes("SubscriptionGroups.create")

    const baseUrl = "/groups"

    return createListPage<app.SubscriptionGroup[]>({
        nameSingular: "Data Source Group",
        namePlural  : "Data Source Groups",
        endpoint    : "/api/request-groups",
        icon        : <i className="fa-solid fa-folder color-brand-2" />,
        baseUrl,
        canCreate,
        renderList  : data => {
            data = data.filter((g: any) => !!g.id)
            return (
                <>
                    <div className="mb-2">
                        <Alert color="blue" icon="fa-solid fa-info-circle">
                            Data Sources can be assigned to certain group, otherwise
                            they are considered part of the <b>GENERAL</b> group.
                        </Alert>
                    </div>
                    
                    { data.length ?
                        <table className="endpoint-list-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "2.5em" }}>ID</th>
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
                                        <td><Link title={row.name} to={ baseUrl + "/" + row.id} className="link">{row.name}</Link></td>
                                        <td className="color-muted"><MarkdownPreview markdown={row.description || ""} maxLen={70} /></td>
                                        <IfAllowed showError={false} permissions="SubscriptionGroups.update" element={ <td className="right nowrap">
                                            <Link title="Edit" className="btn small color-brand-2 btn-virtual" to={ baseUrl + "/" + row.id + "/edit" }>
                                                <i className="fa-solid fa-pen-to-square" />
                                            </Link>
                                        </td> } />
                                        <IfAllowed showError={false} permissions="SubscriptionGroups.delete" element={ <td className="right nowrap">
                                            <Link title="Delete" className="btn small color-red btn-virtual" to={ baseUrl + "/" + row.id + "/delete" }>
                                                <i className="fa-solid fa-trash-can" />
                                            </Link>
                                        </td> } />
                                    </tr>
                                )) }
                            </tbody>
                        </table> :
                        <div className="center">
                            <br/>
                            <p>No Data Source groups found in the database. { canCreate && <span> You can start by creating new one.<br/><br/></span> }</p>
                            { canCreate && <Link to={ baseUrl + "/new" } className="btn btn-blue-dark pl-2 pr-2">Create Data Source Group</Link> }
                        </div>
                    }   
                </>
            )
        }
    })
}
