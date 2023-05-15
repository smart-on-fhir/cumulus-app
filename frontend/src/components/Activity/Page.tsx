import { Component }  from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { request }    from "../../backend";
import { classList }  from "../../utils";
import { AlertError } from "../generic/Alert";
import Breadcrumbs from "../generic/Breadcrumbs";
import "./Activity.scss"

interface State {
    limit  : number
    offset : number
    count  : number
    rows   : any[]
    loading: boolean
    error  : Error | null
    tags   : {
        requests: boolean
        views   : boolean
        auth    : boolean
    }
}


export default class ActivityPage extends Component<any, State>
{
    constructor(props: any) {
        super(props)
        this.state = {
            limit  : 50,
            offset : 0,
            count  : 0,
            rows   : [],
            loading: false,
            error  : null,
            tags   : {
                requests: false,
                views   : false,
                auth    : false
            }
        }
    }

    async fetch(offset = this.state.offset, limit = this.state.limit, tags = this.state.tags) {
        this.setState({ loading: true, error: null, tags });
        try {
            const _tags = Object.keys(tags).filter(x => !!tags[x as keyof typeof tags]);

            const { count, rows } = await request(
                `/api/activity/browse?order=createdAt:desc&limit=${limit
                }&offset=${offset}&tags=${_tags.join(",")}`
            );
            this.setState({ loading: false, count, offset, limit, rows });
        } catch (error) {
            this.setState({
                loading: false,
                error: error as Error
            });
        }
    }

    tag(name: keyof typeof this.state.tags | "all") {
        if (name === "all") {
            return this.fetch(0, this.state.limit, {
                requests: false,
                views   : false,
                auth    : false
            })
        }
        const current = this.state.tags[name];
        this.fetch(0, this.state.limit, { ...this.state.tags, [name]: !current })
    }

    componentDidMount() {
        this.fetch()
    }

    render() {
        const {
            rows,
            loading,
            offset,
            limit,
            error,
            count,
            tags
        } = this.state;
        
        return (
            <div className={ loading ? "grey-out" : undefined }>
                <HelmetProvider>
                    <Helmet>
                        <title>Activity Logs</title>
                    </Helmet>
                </HelmetProvider>
                <Breadcrumbs links={[
                    { name: "Home", href: "/" },
                    { name: "Activity Logs" }
                ]} />
                <div className="row mb-1 middle wrap">
                    <div className="col col-0">
                        <div className="toolbar">
                            <button className={"btn"+(tags.requests ? " active" : "")} onClick={() => this.tag("requests")}>
                                <i className="fa-solid fa-database"/> Subscriptions
                            </button>
                            <button className={"btn"+(tags.views ? " active" : "")} onClick={() => this.tag("views")}>
                                <i className="fa-solid fa-chart-pie" /> Graphs
                            </button>
                            <button className={"btn"+(tags.auth ? " active" : "")} onClick={() => this.tag("auth")}>
                                <i className="fa-solid fa-user-shield" /> Authentication
                            </button>
                            <button className="btn" onClick={() => this.tag("all")}>All</button>
                        </div>
                    </div>
                    <div className="col"/>
                    <div className="col col-0">
                        <button className="btn" onClick={() => this.fetch()}>
                            <i className={classList({
                                "fa-solid fa-rotate": true,
                                "fa-spin": loading
                            })} /> Refresh
                        </button>
                    </div>
                </div>
                <hr className="mb-1"/>
                <div className="log">
                    { error && <AlertError>{ error + "" }</AlertError> }
                    { !rows.length && !loading && <span className="color-muted">No activity logs found</span> }
                    { rows.map((rec, i) => {
                        return (
                            <div className="row baseline log-line" key={i}>
                                <div className="col col-0 color-muted pr-1"><code>{rec.createdAt}</code></div>
                                <code className="col">{ rec.message }</code>
                            </div>
                        )
                    })}
                </div>
                { rows.length > 0 && <>
                    <hr className="mt-1"/>
                    <div className="center row mt-1 mb-1 gap middle">
                        <div className="col"/>
                        <div className="col col-0">
                            <button
                                className="btn color-blue"
                                disabled={offset <= 0}
                                onClick={() => this.fetch(offset - limit)}
                            >
                                <i className="fa-solid fa-angles-left" /> Prev
                            </button>
                        </div>
                        <div className="col col-0">Records {offset + 1} to {offset + rows.length} of {count}</div>
                        <div className="col col-0">
                            <button
                                className="btn color-blue"
                                disabled={offset + limit >= count}
                                onClick={() => this.fetch(offset + limit)}
                            >Next <i className="fa-solid fa-angles-right" /></button>
                        </div>
                        <div className="col"/>
                    </div>
                </> }
            </div>
        )
    }
}
