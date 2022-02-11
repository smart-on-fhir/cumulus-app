import { useReducer } from "react"
import "./DataGrid.scss"


interface Column {
    name: string
    label?: string
    dataType: "boolean" | "float" | "integer" | "string"
}

interface State
{
    cols      : Column[]
    rows      : any[][]
    sortedRows: any[][]
    sortBy    : string | null
    sortDir   : "asc" | "desc"
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

export default function DataGrid({
    cols,
    rows
}: {
    cols: Column[],
    rows: any[][]
})
{
    const [state, dispatch] = useReducer(reducer, {
        cols,
        rows,
        sortedRows: rows,
        sortDir: "asc",
        sortBy : null
    });

    const {
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
                                {col.label || col.name}&nbsp;
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
                                        return <td key={i}><span className="color-muted">null</span></td>
                                    }
                                    switch (cols[i].dataType) {
                                        case "boolean":
                                            return <td key={i}>{ value ? <span className="boolean-true">true</span> : <span className="boolean-false">false</span> }</td>
                                        case "float":
                                            return <td key={i}><span className="float">{ +value }</span></td>
                                        case "integer":
                                            return <td key={i} className="color-red">{ +value }</td>
                                        case "string":
                                            return <td key={i}><span className="string">{ value }</span></td>
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
