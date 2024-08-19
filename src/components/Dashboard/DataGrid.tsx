import { useReducer } from "react"
import { app }        from "../../types"

interface State
{
    cols: app.SubscriptionDataColumn[]
    rows: any[][]
    sortedRows: any[][]
    sortBy: string | null
    sortDir: "asc" | "desc"
}

interface Action
{
    type: string
    payload?: any
}

function reducer(state: State, action: Action): State {

    function sort(by: string | null, dir: "asc" | "desc") {

        if (!by) {
            return [ ...state.rows ]
        }

        const index = state.cols.findIndex(col => col.name === by)
        const type = state.cols.find(col => col.name === by)?.dataType

        return [...state.rows].sort(
            (a: any, b: any) => {
                if (type === "integer" || type === "float")
                    return (
                        b[index] === null ? -1 : a[index] === null ? 1 :
                        b[index] - a[index]
                    ) * (dir === "asc" ? 1 : -1)
                return String(b[index] || "").localeCompare(String(a[index] || "")) * (dir === "asc" ? 1 : -1)
            }
        )
    }

    if (action.type === "SET_SORT_BY") {
        return {
            ...state,
            sortBy: action.payload,
            sortedRows: sort(action.payload, state.sortDir)
        };
    }
    
    if (action.type === "SET_SORT_DIR") {
        return {
            ...state,
            sortDir: action.payload,
            sortedRows: sort(state.sortBy, action.payload)
        };
    }
    
    return state
}

export default function DataGrid({ data }: { data: app.SubscriptionData })
{
    const [state, dispatch] = useReducer(reducer, {
        cols   : data.cols,
        rows   : data.rows,
        sortedRows: data.rows,
        sortDir: "asc",
        sortBy : null
    });

    const {
        cols,
        sortedRows,
        sortDir,
        sortBy
    } = state
    
    return (
        <div className="data-grid">
            <table>
                <thead>
                    <tr>
                        { cols.map((col, i) => (
                            <th key={i} style={{ cursor: "pointer" }} onMouseDown={e => {
                                e.preventDefault();
                                if (sortBy === col.name) {
                                    if (sortDir === "asc") {
                                        dispatch({ type: "SET_SORT_DIR", payload: "desc" })
                                    }
                                    else if (sortDir === "desc") {
                                        dispatch({ type: "SET_SORT_BY" , payload: null })
                                    }
                                    else {
                                        dispatch({ type: "SET_SORT_DIR" , payload: "asc"})
                                    }
                                }
                                else {
                                    dispatch({ type: "SET_SORT_DIR", payload: "asc" })
                                    dispatch({ type: "SET_SORT_BY" , payload: col.name })
                                }
                            }}>
                                {col.label}&nbsp;
                                { sortBy === col.name && sortDir === "asc" && <i className="fas fa-caret-up color-grey-dark"/> }
                                { sortBy === col.name && sortDir === "desc" && <i className="fas fa-caret-down color-grey-dark"/> }
                            </th>
                        )) }
                    </tr>
                </thead>
                <tbody>
                    { sortedRows.map((row, y) => (
                        <tr key={y}>
                            {
                                row.map((value, i) => {
                                    if (value === null) {
                                        return <td key={i} className="color-muted">null</td>
                                    }
                                    switch (cols[i].dataType) {
                                        case "boolean":
                                            return <td key={i} className="color-blue">{ value ? "true" : "false" }</td>
                                        case "float":
                                        case "integer":
                                            return <td key={i} className="color-red">{ +value }</td>
                                        case "string":
                                            return <td key={i} className="color-green">{ value }</td>
                                        default:
                                            return <td key={i}>{ value }</td>
                                    }
                                })
                            }
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}