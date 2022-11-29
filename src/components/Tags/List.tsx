import { Link }           from "react-router-dom"
import { createListPage } from "../generic/EndpointListWrapper"
import Alert              from "../generic/Alert"
import "../generic/EndpointListTable.scss"


export default function List()
{
    return createListPage<app.Tag[]>({
        namePlural: "Tags",
        endpoint  : "api/tags",
        icon      : <i className="fa-solid fa-tag color-brand-2" />,
        renderList: data => {
            
            if (!data.length) {
                return <div className="center">
                    <br/>
                    <p>No tags found in the database! You can start by creating a new tag.</p>
                    <br/>
                    <Link to="./new" className="btn btn-blue-dark pl-2 pr-2">Create Tag</Link>
                </div>
            }

            return <>
                <Alert color="blue" icon="fa-solid fa-info-circle">
                    Tags can be used to classify things like graphs or data subscriptions.
                    The Cumulus Dashboard can use the assigned tags for display purposes
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
                            <th style={{ width: "5.4em" }} />
                        </tr>
                    </thead>
                    <tbody>
                    { data.map((record, i) => (
                        <tr key={i}>
                            <td className="color-muted">{ record.id }</td>
                            <td><Link className="link" to={"./" + record.id}>{ record.name }</Link></td>
                            <td>{ record.description }</td>
                            <td className="color-muted">{ new Date(record.createdAt).toLocaleDateString() }</td>
                            <td className="color-muted">{ new Date(record.updatedAt).toLocaleDateString() }</td>
                            <td className="right nowrap">
                                <Link className="btn small btn-virtual" to={ `./${record.id}/edit` }>
                                    <i className="fa-solid fa-pen-to-square color-blue-dark" />
                                </Link>
                                <Link className="btn small btn-virtual" to={ `./${record.id}/delete` }>
                                    <i className="fa-solid fa-trash-can color-red" />
                                </Link>
                            </td>
                        </tr>
                    )) }
                    </tbody>
                </table>
            </>
        }
    });
}