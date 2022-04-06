import { Component }  from "react";
import { Link }       from "react-router-dom";
import { request }    from "../../backend";
import { AlertError } from "../Alert";
import Loader         from "../Loader";

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
    
    render() {
        const { records, loading, error } = this.state;
        return (
            <div className="link-list">
                { loading && <Loader/> }
                { error && <AlertError>{ error + "" }</AlertError> }
                { !loading && !error && records.length > 0 && records.map((row, i) => (
                    <div key={row.id} style={{ margin: "0 0.5em" }}>
                        <Link to={`/sites/${row.id}/edit`} className="icon-item">
                            <i className="fa-solid fa-location-dot icon"/>
                            <b>{row.name}</b>
                            <div className="color-muted small">{row.description}</div>
                        </Link>
                    </div>
                ))}
                <br/>
            </div>
        );
    }
}