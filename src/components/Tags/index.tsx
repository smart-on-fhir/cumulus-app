import moment                     from "moment"
import { Helmet, HelmetProvider } from "react-helmet-async"
import { Link }                   from "react-router-dom"
import Breadcrumbs                from "../generic/Breadcrumbs"
import EndpointListWrapper        from "../generic/EndpointListWrapper"
import "./Tags.scss"


export default function Tags()
{
    return (
        <div className="container tags-list">
            <HelmetProvider>
                <Helmet>
                    <title>Cumulus Tags</title>
                </Helmet>
            </HelmetProvider>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: "Tags" }
            ]} />
            <div className="row gap mt-2">
                <div className="col middle">
                    <h4 className="mb-05 mt-0"><i className="fa-solid fa-tag color-brand-2" /> Tags</h4>
                </div>
                <div className="col col-0 right nowrap middle">
                    <div>
                        <Link to="new" className="btn btn-virtual">
                            <b className="color-green">
                                <i className="fa-solid fa-circle-plus" /> Create Tag
                            </b>
                        </Link>
                    </div>
                </div>
            </div>
            <hr/>
            <p className="mb-2 color-muted">
                Tags can be used to classify things like graphs or data subscriptions.
                The Cumulus Dashboard can use the assigned tags for display purposes
                like sorting, grouping, filtering and more.
            </p>
            <EndpointListWrapper endpoint="/api/tags?order=createdAt:asc">
                { (data: app.Tag[]) => {
                    
                    if (!data.length) {
                        return <div className="center">
                            <br/>
                            <p>No tags found in the database! You can start by creating a new tag.</p>
                            <br/>
                            <Link to="./new" className="btn btn-blue-dark pl-2 pr-2">Create Tag</Link>
                        </div>
                    }

                    return (
                        <table>
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
                                    <td className="color-muted">{ moment(record.createdAt).format("M/D/Y") }</td>
                                    <td className="color-muted">{ moment(record.updatedAt).format("M/D/Y") }</td>
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
                    )
                }}
            </EndpointListWrapper>
        </div>
    )
}