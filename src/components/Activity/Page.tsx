import { useEffect, useReducer } from "react";
import { request }               from "../../backend";
import { classList }             from "../../utils";
import { AlertError }            from "../Alert";
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

const initialState: State = {
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

function reducer(state: State, action: Partial<State>): State {
    return { ...state, ...action };
}


export default function ActivityPage()
{
    const [state, dispatch] = useReducer(reducer, initialState);

    const {
        rows,
        loading,
        offset,
        limit,
        error,
        count
    } = state;

    async function fetch(offset = state.offset, limit = state.limit, tags = state.tags) {
        dispatch({ loading: true, error: null, tags });
        try {
            const _tags = Object.keys(tags).filter(x => !!tags[x as keyof typeof tags]);

            const { count, rows } = await request(
                `/api/activity/browse?order=createdAt:desc&limit=${limit
                }&offset=${offset}&tags=${_tags.join(",")}`
            );
            dispatch({ loading: false, count, offset, limit, rows });
        } catch (error) {
            dispatch({
                loading: false,
                error: error as Error
            });
        }
    }

    function tag(name: keyof typeof state.tags | "all") {
        if (name === "all") {
            return fetch(state.offset, state.limit, {
                requests: false,
                views   : false,
                auth    : false
            })
        }
        const current = state.tags[name];
        fetch(state.offset, state.limit, { ...state.tags, [name]: !current })
    }

    useEffect(() => { fetch() }, []);

    
    return (
        <div className={ loading ? "grey-out" : undefined }>
            <div className="row mb-1 middle">
                <div className="col col-0">
                    <div className="toolbar">
                        <button className={"btn"+(state.tags.requests ? " active" : "")} onClick={() => tag("requests")}>
                            <i className="fa-solid fa-database"/> Requests
                        </button>
                        <button className={"btn"+(state.tags.views ? " active" : "")} onClick={() => tag("views")}>
                            <i className="fa-solid fa-chart-pie" /> Views
                        </button>
                        <button className={"btn"+(state.tags.auth ? " active" : "")} onClick={() => tag("auth")}>
                            <i className="fa-solid fa-user-shield" /> Authentication
                        </button>
                        <button className="btn" onClick={() => tag("all")}>All</button>
                    </div>
                </div>
                <div className="col"/>
                <div className="col col-0">
                    <button className="btn" onClick={() => fetch()}>
                        <i className={classList({
                            "fa-solid fa-rotate": true,
                            "fa-spin": loading
                        })} /> Refresh
                    </button>
                </div>
            </div>
            <hr className="mb-1"/>
            <div>
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
            <hr className="mt-1"/>
            <div className="center row mt-1 mb-1 gap middle">
                <div className="col"/>
                <div className="col col-0">
                    <button
                        className="btn color-blue"
                        disabled={offset <= 0}
                        onClick={() => fetch(offset - limit)}
                    >
                        <i className="fa-solid fa-angles-left" /> Prev
                    </button>
                </div>
                <div className="col col-0">Records {offset + 1} to {offset + rows.length} of {count}</div>
                <div className="col col-0">
                    <button
                        className="btn color-blue"
                        disabled={offset + limit >= count}
                        onClick={() => fetch(offset + limit)}
                    >Next <i className="fa-solid fa-angles-right" /></button>
                </div>
                <div className="col"/>
            </div>
        </div>
    )
}