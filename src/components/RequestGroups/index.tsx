import { Component }              from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Link }                   from "react-router-dom";
import { deleteOne, request }     from "../../backend";
import { AlertError }             from "../Alert";
import Breadcrumbs                from "../Breadcrumbs";
import Loader                     from "../Loader";
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

    componentDidMount() {
        request<app.RequestGroup[]>("/api/request-groups").then(
            records => this.setState({ loading: false, records }),
            error   => this.setState({ loading: false, error   })
        );
    }

    
    deleteGroup(id: number) {
        if (window.confirm("If you delete this group, all the requests that " +
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
        const { records, loading, error } = this.state;
        return (
            <div className="request-groups-list">
                <HelmetProvider>
                    <Helmet>
                        <title>Data Request Groups</title>
                    </Helmet>
                </HelmetProvider>
                <Breadcrumbs links={[
                    { name: "Home", href: "/" },
                    { name: "Request Groups" },
                ]} />
                <div className="row gap middle">
                    <div className="col">
                        <h4><i className="fa-solid fa-folder" /> Data Request Groups</h4>
                    </div>
                    <div className="col col-0">
                        <Link to="new" className="btn color-blue">Create Request Group</Link>
                    </div>
                </div>
                <hr className="mb-1" />
                <div className="color-muted mb-3">
                    Requests can be assigned to certain group. Otherwise they are considered part of the "GENERAL" group.
                </div>
                { loading && <Loader/> }
                { error && <AlertError>{ error + "" }</AlertError> }
                { !loading && !error && records.length > 0 && <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Created At</th>
                            <th>Updated At</th>
                            <th/>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((row, i) => (
                            <tr key={i}>
                                <td>{row.id}</td>
                                <td><b>{row.name}</b></td>
                                <td>{row.description}</td>
                                <td className="small">{row.createdAt}</td>
                                <td className="small">{row.updatedAt}</td>
                                <td className="right">
                                    <Link title="Edit" className="btn small color-brand-2" to={ row.id + "/edit" }>
                                        <i className="fa-solid fa-pen-to-square" />
                                    </Link>
                                    &nbsp;
                                    <button title="Delete" className="btn small color-red" onClick={() => this.deleteGroup(row.id)}>
                                        <i className="fa-solid fa-trash-can" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table> }
                <br/>
                <br/>
            </div>
        );
    }
}