import { Link }       from "react-router-dom"
import createListPage from "../generic/EndpointListWrapper"
import IfAllowed      from "../generic/IfAllowed"
import { useAuth }    from "../../auth"
import { app }        from "../../types"
import Terminology    from "../../Terminology"
import "../generic/EndpointListTable.scss"

export default function ListPage()
{
    const { user } = useAuth();

    const canCreate = user?.permissions.includes("DataSites.create")

    return createListPage<app.DataSite[]>({
        namePlural  : Terminology.site.namePlural,
        nameSingular: Terminology.site.nameSingular,
        endpoint    : "/api/data-sites",
        icon        : <span className="icon material-symbols-outlined color-brand-2">{Terminology.site.icon}</span>,
        canCreate,
        renderList: data => {
            return (
                <div>
                    { data.length ?
                        <table className="endpoint-list-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "2em" }}>ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th style={{ width: "3em" }}>Lat</th>
                                    <th style={{ width: "4em" }}>Long</th>
                                    <IfAllowed showError={false} permissions="DataSites.update" element={ <th style={{ width: "2.5em" }} /> } />
                                    <IfAllowed showError={false} permissions="DataSites.delete" element={ <th style={{ width: "2.5em" }} /> } />
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.id}</td>
                                        <td><Link title={row.name} to={"./" + row.id} className="link">{row.name}</Link></td>
                                        <td>{row.description || ""}</td>
                                        <td className="center">{row.lat}</td>
                                        <td className="center">{row.long}</td>
                                        <IfAllowed showError={false} permissions="DataSites.update" element={ <td>
                                            <Link title="Edit" className="btn small color-brand-2 btn-virtual" to={ row.id + "/edit" }>
                                                <i className="fa-solid fa-pen-to-square" />
                                            </Link>
                                        </td> } />
                                        <IfAllowed showError={false} permissions="DataSites.delete" element={ <td>
                                            <Link title="Delete" className="btn small color-red btn-virtual" to={ row.id + "/delete" }>
                                                <i className="fa-solid fa-trash-can" />
                                            </Link>
                                        </td> } />
                                    </tr>
                                ))}
                            </tbody>
                        </table> :
                        <div className="center">
                            <br/>
                            <p>No Healthcare Sites found in the database. { canCreate && <span> You can start by creating new one.<br/><br/></span> }</p>
                            { canCreate && <Link to="new" className="btn btn-blue-dark pl-2 pr-2">Create Healthcare Site</Link> }
                        </div>
                    }
                </div>
            )
        }
    })
}