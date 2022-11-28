import { Component }              from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Link }                   from "react-router-dom";
import { deleteOne }              from "../../backend";
import Breadcrumbs                from "../Breadcrumbs";
import Wrapper                    from "../generic/EndpointListWrapper"
import "./RequestGroups.scss";

interface State {
    records: app.RequestGroup[]
    loading: boolean
    error  : Error | null
}

export default class RequestGroupList extends Component<any, State>
{
    constructor(props: any) {
        super(props);
        this.state = {
            records: [],
            loading: true,
            error  : null
        };
    }
    
    deleteGroup(id: number) {
        if (window.confirm("If you delete this group, all the subscriptions that " +
        "belong to it will be assigned to a 'GENERAL' group. Are you sure?"))
        {
            this.setState({ loading: true });
            deleteOne("request-groups", id).then(
                rec   => this.setState({ loading: false, records: this.state.records.filter(x => x.id !== rec.id) }),
                error => this.setState({ loading: false, error })
            )
        }
    }
        
    render() {
        return (
            <div className="request-groups-list container">
                <HelmetProvider>
                    <Helmet>
                        <title>Data Subscription Groups</title>
                    </Helmet>
                </HelmetProvider>
                <Breadcrumbs links={[
                    { name: "Home", href: "/" },
                    { name: "Subscription Groups" },
                ]} />
                <div className="row gap middle">
                    <div className="col">
                        <h4><i className="fa-solid fa-folder color-brand-2" /> Data Subscription Groups</h4>
                    </div>
                    <div className="col col-0">
                        <Link to="new" className="btn color-blue btn-virtual">
                            <b className="color-green"><i className="fa-solid fa-circle-plus" /> Create Subscription Group</b>
                        </Link>
                    </div>
                </div>
                <hr className="mb-1" />
                <div className="color-muted mb-3">
                    Subscriptions can be assigned to certain group, otherwise they are considered part of the "GENERAL" group.
                </div>
                <Wrapper endpoint="/api/request-groups">{
                    (data: app.RequestGroup[]) => (
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "2em" }}>ID</th>
                                    <th style={{ width: "30%em" }}>Name</th>
                                    <th style={{ width: "30%em" }}>Description</th>
                                    <th style={{ width: "11em" }}>Updated</th>
                                    <th style={{ width: "4.4em"  }}/>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.id}</td>
                                        <td><b>{row.name}</b></td>
                                        <td>{row.description || ""}</td>
                                        <td className="small">{new Date(row.updatedAt).toLocaleString()}</td>
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
                    )
                }</Wrapper>
                <br/>
                <br/>
            </div>
        );
    }
}