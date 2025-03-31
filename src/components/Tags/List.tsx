import { Link }       from "react-router-dom"
import createListPage from "../generic/EndpointListWrapper"
import IfAllowed      from "../generic/IfAllowed"
import { useAuth }    from "../../auth"
import { app }        from "../../types"
import Terminology    from "../../Terminology"


export default function TagsList()
{
    const { user } = useAuth();

    const canCreate = user?.permissions.includes("Tags.create")

    const baseUrl = "/tags"

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
                <div className="color-muted center">
                    {Terminology.tag.namePlural} can be used to classify graphs or {Terminology.subscription.namePlural}.
                    The Dashboard can use the assigned {Terminology.tag.namePlural} for display purposes
                    like sorting, grouping, and filtering.
                </div>
                <div className="table-responsive">
                    <table className="mt-2 table-hover table-border-x table-condensed">
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
                </div>
            </>
        }
    });
}