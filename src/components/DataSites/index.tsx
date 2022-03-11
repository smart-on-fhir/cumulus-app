import { Component }              from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Link }                   from "react-router-dom";
import { deleteOne, request }     from "../../backend";
import { AlertError }             from "../Alert";
import Breadcrumbs                from "../Breadcrumbs";
import Loader                     from "../Loader";

interface State {
    records: app.DataSite[]
    loading: boolean
    error  : Error | null
}

export default class DataSiteList extends Component<any, State>
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
        request<app.DataSite[]>("/api/data-sites").then(
            records => this.setState({ loading: false, records }),
            error   => this.setState({ loading: false, error   })
        );
    }

    deleteRecord(id: number) {
        if (window.confirm("Are you sure you want to delete this record?")) {
            this.setState({ loading: true }, () => {
                deleteOne("data-sites", id).then(
                    rec   => this.setState({ loading: false, records: this.state.records.filter(x => x.id !== rec.id) }),
                    error => this.setState({ loading: false, error })
                );
            });
        }
    }
        
    render() {
        const { records, loading, error } = this.state;
        return (
            <div className="request-groups-list">
                <HelmetProvider>
                    <Helmet>
                        <title>Data Sites</title>
                    </Helmet>
                </HelmetProvider>
                <Breadcrumbs links={[
                    { name: "Home", href: "/" },
                    { name: "Data Sites" },
                ]} />
                <div className="row gap middle">
                    <div className="col">
                        <h4><i className="fa-solid fa-database" /> Data Sites</h4>
                    </div>
                    <div className="col col-0">
                        <Link to="new" className="btn color-blue">Create Data Site</Link>
                    </div>
                </div>
                <hr className="mb-1" />
                { loading && <Loader/> }
                { error && <AlertError>{ error + "" }</AlertError> }
                { !loading && !error && records.length > 0 && <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Latitude</th>
                            <th>Longtitude</th>
                            <th/>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((row, i) => (
                            <tr key={i}>
                                <td>{row.id}</td>
                                <td><b>{row.name}</b></td>
                                <td>{row.description}</td>
                                <td className="small">{row.lat}</td>
                                <td className="small">{row.long}</td>
                                <td className="right nowrap">
                                    <Link title="Edit" className="btn small color-brand-2" to={ row.id + "/edit" }>
                                        <i className="fa-solid fa-pen-to-square" />
                                    </Link>
                                    &nbsp;
                                    <button title="Delete" className="btn small color-red" onClick={() => this.deleteRecord(row.id)}>
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