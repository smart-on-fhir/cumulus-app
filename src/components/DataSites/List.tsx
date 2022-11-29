import { Link }           from "react-router-dom"
import { createListPage } from "../generic/EndpointListWrapper"
import "../generic/EndpointListTable.scss"

export default function ListPage()
{
    return createListPage<app.DataSite[]>({
        namePlural  : "Data Sites",
        nameSingular: "Data Site",
        endpoint    : "/api/data-sites",
        icon        : <i className="fa-solid fa-location-dot color-brand-2" />,
        renderList: data => (
            <div>
                <table className="endpoint-list-table">
                    <thead>
                        <tr>
                            <th style={{ width: "2em" }}>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th style={{ width: "3em" }}>Lat</th>
                            <th style={{ width: "4em" }}>Long</th>
                            <th style={{ width: "5em" }}/>
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
                                <td className="right nowrap">
                                    <Link title="Edit" className="btn small color-brand-2 btn-virtual" to={ row.id + "/edit" }>
                                        <i className="fa-solid fa-pen-to-square" />
                                    </Link>
                                    <Link title="Delete" className="btn small color-red btn-virtual" to={ row.id + "/delete" }>
                                        <i className="fa-solid fa-trash-can" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    })
}