import { ChangeEvent, useReducer } from "react"
import DB from "../../../mocks/views"
import ColumnSelector from "./ColumnSelector";
import FilterUI from "./FilterUI";
import GroupByUI from "./GroupByUI";

const SQL_OPERATORS = {
    ">" : "Greater Than",
    "<" : "Smaller Than",
    "=" : "Equal To",
    "<>": "Not Equal To",
    ">=": "Greater Than Or Equal To",
    "<=": "Smaller Than Or Equal To"
}

const DATA_TYPES = {
    column: "DB Column",
    string: "String",
    number: "Number",
    date  : "Date"
}

// Types -----------------------------------------------------------------------


type sqlOrderDir = "asc" | "desc"

// interface ColumnDescriptor {
//     name: string
// }

// interface TableDescriptor {
//     name: string
//     columns: ColumnDescriptor[]
// }

interface Column {
    name: string
    table: string
    alias?: string
}

interface Filter {
    left: Column
    operator: keyof typeof SQL_OPERATORS
    right: {
        type : keyof typeof DATA_TYPES
        value: Column | string | number | Date | null
    }
}

interface OrderBy {
    column: Column
    direction: sqlOrderDir
}

interface State {
    dimensionX: null | Column
    dimensionY: null | Column
    filters: Filter[]
    orderBy: OrderBy[]
    groupBy: Column[]
}

interface Action {
    type: string
    payload?: any
}
// -----------------------------------------------------------------------------

const initialState: State = {
    dimensionX: null,
    dimensionY: null,
    filters: [],
    orderBy: [],
    groupBy: []
}

function reducer(state: State, action: Action): State
{
    switch (action.type) {
        case "SET_DIMENSION_X":
            return {
                ...state,
                dimensionX: action.payload ?
                    {
                        ...state.dimensionX,
                        ...action.payload
                    } :  null,
                orderBy: []
            };
        
        case "SET_DIMENSION_Y":
            return {
                ...state,
                dimensionY: action.payload ?
                    {
                        ...state.dimensionY,
                        ...action.payload
                    } : null,
                orderBy: []
            };
        
        case "SET_ORDER_BY":
            return {
                ...state,
                orderBy: action.payload || []
            };

        case "SET_GROUP_BY":
            return {
                ...state,
                groupBy: action.payload || []
            };

        case "SET_FILTERS":
            return {
                ...state,
                filters: action.payload || []
            };

        default:
            throw new Error(`Unknown action "${action.type}"`);
    }
}

function OrderByUI({
    usedTables = [],
    current = [],
    onChange
}: {
    usedTables: string[]
    current: OrderBy[]
    onChange: (current: OrderBy[]) => void
})
{
    const db = DB.filter(table => usedTables.includes(table.name))

    function add() {
        if (!db.length) {
            return alert("Please select at least one dimension first")
        }

        onChange([
            ...current,
            {
                column: { name: "", table: "" },
                direction: "asc"
            }
        ]);
    }

    return (
        <div className="mt-1 mb-2">
            <div className="row middle">
                <div className="col color-blue">
                    <label><i className="fas fa-sort-amount-down-alt"/> Order By</label>
                </div>
                <div className="col right">
                    <a onClick={add}>Add Order Condition <i className="fas fa-plus"/></a>
                </div>
            </div>
            <hr className="mb-1"/>
            { current.map((o, i) => (
                <div key={i} className="row small half-gap">
                    <div className="col">
                        <ColumnSelector
                            db={db}
                            value={o.column.table + "." + o.column.name}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                const list = [ ...current ]
                                const [table, column] = e.target.value.split(".")
                                list[i].column = { table, name: column }
                                onChange(list)
                            }}
                            disabled={current.filter((x, y) => y !== i).map(o => o.column.table + "." + o.column.name)}
                            addEmptyOption="start"
                        />
                    </div>
                    <div className="col col-3">
                        <select value={o.direction} onChange={(e) => {
                            const list = [ ...current ]
                            list[i].direction = e.target.value as sqlOrderDir
                            onChange(list)
                        }}>
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                    <div className="col col-0">
                        <div className="toolbar">
                            <button className="btn" disabled={i===0} onClick={() => {
                                const list = [ ...current ]
                                const item = list[i]
                                list.splice(i, 1)
                                list.splice(i - 1, 0, item)
                                onChange(list)
                            }}><i className="fas fa-arrow-up" /></button>
                            <button className="btn" disabled={i===current.length - 1} onClick={() => {
                                const list = [ ...current ]
                                const item = list[i]
                                list.splice(i, 1)
                                list.splice(i + 1, 0, item)
                                onChange(list)
                            }}><i className="fas fa-arrow-down" /></button>
                            <button className="btn" onClick={() => {
                                onChange(current.filter((_, index) => index !== i))
                            }}><i className="fas fa-trash-alt" /></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}



export default function QueryBuilder()
{
    const [state, dispatch] = useReducer(reducer, initialState);

    const {
        dimensionX,
        dimensionY,
        orderBy,
        groupBy,
        filters
    } = state;

    const usedTables = []

    const query = {
        dimensionX,
        dimensionY,
        orderBy: orderBy.filter(x => x.column.table && x.column.name).map(o => `${o.column.table}.${o.column.name} ${o.direction}`),
        groupBy: groupBy.filter(x => x.table && x.name).map(o => `${o.table}.${o.name}`),
        filters: filters.filter(x => {
            if (!x.left.table || !x.left.name || x.right.value === null) return false
            if (x.right.type == "date" && (!x.right.value || !(x.right.value instanceof Date))) return false
            if (x.right.type == "number" && (isNaN(+x.right.value) || !isFinite(+x.right.value))) return false
            if (x.right.type == "column" && (!(x.right.value as Column).table || !(x.right.value as Column).name)) return false
            return true
        })
    }

    if (dimensionX) {
        usedTables.push(dimensionX.table)
    }
    if (dimensionY) {
        if (!usedTables.includes(dimensionY.table)) {
            usedTables.push(dimensionY.table)
        }
    }

    function compileSQL() {

        const { dimensionX, dimensionY, filters, orderBy, groupBy } = query

        let sql = ""

        let cols = []
        let from = []
        let where: string[] = []

        if (dimensionX) {
            cols.push(`${dimensionX.table}.${dimensionX.name} AS "${dimensionX.alias}"`)
            from.push(dimensionX.table)
        }

        if (dimensionY) {
            cols.push(`${dimensionY.table}.${dimensionY.name} AS "${dimensionY.alias}"`)
            from.push(dimensionY.table)
        }

        filters.forEach(f => {
            if (f.right.type == "string") {
                where.push(`${f.left.table}.${f.left.name} ${f.operator} "${f.right.value}"`)    
            }
            else if (f.right.type == "number") {
                if (f.right.value !== null) {
                    where.push(`${f.left.table}.${f.left.name} ${f.operator} ${+f.right.value}`)    
                }
            }
            else if (f.right.type == "date") {
                if (f.right.value) {
                    where.push(`${f.left.table}.${f.left.name} ${f.operator} "${(f.right.value as Date).toISOString()}"`)    
                }
            }
            else {
                where.push(`${f.left.table}.${f.left.name} ${f.operator} ${(f.right.value as Column).table}.${(f.right.value as Column).name}`)
            }
        })

        if (cols.length) {
            sql += `  SELECT ${cols.join(", ")}\n`
            sql += `    FROM ${from.join(", ")}`

            if (where.length) {
                sql += `\n   WHERE ${where.join(" AND ")}`
            }

            if (groupBy.length) {
                sql += `\nGROUP BY ${groupBy.join(", ")}`
            }

            if (orderBy.length) {
                sql += `\nORDER BY ${orderBy.join(", ")}`
            }
        }

        return sql
    }

    return (
        <div className="query-builder small">
            <div className="row mt-1 mb-1 half-gap">
                <div className="col mb-1" style={{ minWidth: "400px" }}>
                    <div className="row half-gap">
                        <div className="col">
                            <label className="color-blue"><i className="fas fa-arrows-alt-h"/> Dimension 1 (X)</label>
                            <ColumnSelector
                                value={ dimensionX ? dimensionX.table + "." + dimensionX.name : "" }
                                onChange={ (e: ChangeEvent<HTMLSelectElement>) => {
                                    let value = e.target.value || ""
                                    let [table, name] = value.split(".")
                                    dispatch({
                                        type: "SET_DIMENSION_X",
                                        payload: table ? {
                                            table,
                                            name,
                                            alias: name
                                        } : null
                                    })
                                }}
                                disabled={[ dimensionY ? dimensionY.table + "." + dimensionY.name : "" ]}
                                addEmptyOption="start"
                            />
                        </div>
                        <div className="col col-4">
                            <label className="color-muted">Alias</label>
                            <input type="text" disabled={!dimensionX} value={dimensionX?.alias || ""} onChange={e => {
                                dispatch({
                                    type: "SET_DIMENSION_X",
                                    payload: {
                                        alias: e.target.value
                                    }
                                })
                            }}/>
                        </div>
                    </div>
                </div>
                <div className="col mb-1" style={{ minWidth: "400px" }}>
                    <div className="row half-gap">
                        <div className="col">
                            <label className="color-blue"><i className="fas fa-arrows-alt-v"/> Dimension 2 (Y)</label>
                            <ColumnSelector
                                value={ dimensionY ? dimensionY.table + "." + dimensionY.name : "" }
                                onChange={ (e: ChangeEvent<HTMLSelectElement>) => {
                                    let value = e.target.value || ""
                                    let [table, name] = value.split(".")
                                    dispatch({
                                        type: "SET_DIMENSION_Y",
                                        payload: table ? {
                                            table,
                                            name,
                                            alias: name
                                        } : null
                                    })
                                }}
                                disabled={[ dimensionX ? dimensionX.table + "." + dimensionX.name : "" ]}
                                addEmptyOption="start"
                            />
                        </div>
                        <div className="col col-4 pl-1">
                            <label className="color-muted">Alias</label>
                            <input type="text" disabled={!dimensionY} value={dimensionY?.alias || ""} onChange={e => {
                                dispatch({
                                    type: "SET_DIMENSION_Y",
                                    payload: {
                                        alias: e.target.value
                                    }
                                })
                            }}/>
                        </div>
                    </div>
                </div>
            </div>
            <FilterUI  usedTables={ usedTables } current={ filters } onChange={ payload => dispatch({ type: "SET_FILTERS" , payload }) } />
            <GroupByUI usedTables={ usedTables } current={ groupBy } onChange={ payload => dispatch({ type: "SET_GROUP_BY", payload }) } />
            <OrderByUI usedTables={ usedTables } current={ orderBy } onChange={ payload => dispatch({ type: "SET_ORDER_BY", payload }) } />

            <pre className="small">{JSON.stringify(query, null, 4)}</pre>
            <pre className="small">{compileSQL()}</pre>
        </div>
    )
}
