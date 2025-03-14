import { Link, useMatch } from "react-router-dom"
import createListPage from "../generic/EndpointListWrapper"
import Alert          from "../generic/Alert"
import IfAllowed      from "../generic/IfAllowed"
import { useAuth }    from "../../auth"
import { app }        from "../../types"
import Terminology    from "../../Terminology"
import "../generic/EndpointListTable.scss"


export default function TagsList()
{
    const { user } = useAuth();

    const canCreate = user?.permissions.includes("Tags.create")

    const isInsideExplorer = useMatch("/explorer/*"); // Matches any route under /explorer

    const baseUrl = isInsideExplorer ? "/explorer/tags" : "/tags"

    return createListPage<app.Tag[]>({
        namePlural: Terminology.tag.namePlural,
        endpoint  : "/api/tags",
        icon      : <span className="icon material-symbols-outlined color-brand-2">{Terminology.tag.icon}</span>,
        canCreate,
        baseUrl,
        renderList: data => {
            
            if (!data.length) {
                return <div className="center">
                    <br/>
                    <p>No {Terminology.tag.namePlural} found in the database! You can start by creating a new {Terminology.tag.nameSingular}.</p>
                    <br/>
                    <Link to="./new" className="btn btn-blue-dark pl-2 pr-2">Create {Terminology.tag.nameSingular}</Link>
                </div>
            }

            return <>
                <Alert color="blue" icon="fa-solid fa-info-circle">
                    {Terminology.tag.namePlural} can be used to classify things like graphs or {Terminology.subscription.namePlural}.
                    The Cumulus Dashboard can use the assigned {Terminology.tag.namePlural} for display purposes
                    like sorting, grouping, filtering and more.
                </Alert>
                <table className="endpoint-list-table mt-2">
                    <thead>
                        <tr>
                            <th style={{ width: "1.9em" }}>ID</th>
                            <th style={{ width: "20%" }}>Name</th>
                            <th>Description</th>
                            <th style={{ width: "6em" }}>Created</th>
                            <th style={{ width: "6em" }}>Updated</th>
                            <IfAllowed showError={false} permissions="Tags.update" element={ <th style={{ width: "2.5em" }} /> } />
                            <IfAllowed showError={false} permissions="Tags.delete" element={ <th style={{ width: "2.5em" }} /> } />
                        </tr>
                    </thead>
                    <tbody>
                    { data.map((record, i) => (
                        <tr key={i}>
                            <td className="color-muted">{ record.id }</td>
                            <td><Link className="link" to={`${baseUrl}/${record.id}`}>{ record.name }</Link></td>
                            <td>{ record.description }</td>
                            <td className="color-muted">{ new Date(record.createdAt).toLocaleDateString() }</td>
                            <td className="color-muted">{ new Date(record.updatedAt).toLocaleDateString() }</td>
                            <IfAllowed showError={false} permissions="Tags.update" element={ <td className="right nowrap">
                                <Link className="btn small btn-virtual" to={ `${baseUrl}/${record.id}/edit` }>
                                    <i className="fa-solid fa-pen-to-square color-blue-dark" />
                                </Link>
                            </td> } />
                            <IfAllowed showError={false} permissions="Tags.delete" element={ <td className="right nowrap">
                                <Link className="btn small btn-virtual" to={ `${baseUrl}/${record.id}/delete` }>
                                    <i className="fa-solid fa-trash-can color-red" />
                                </Link>
                            </td> } />
                        </tr>
                    )) }
                    </tbody>
                </table>
            </>
        }
    });
}