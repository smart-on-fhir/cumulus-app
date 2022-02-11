import { ChangeEvent } from "react"
import DB from "../../../mocks/views"
import ColumnSelector from "./ColumnSelector"


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

function Filter({
    db,
    filter,
    onChange,
    onRemove
}: {
    db: typeof DB
    filter: Filter
    onChange: (f: Filter) => void
    onRemove: () => void
})
{
    return (
        <div className="row half-gap">
            <div className="col">
                <ColumnSelector
                    db={db}
                    value={filter.left.table + "." + filter.left.name}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                        const [table, name] = e.target.value.split(".")
                        filter.left = { table, name }
                        onChange(filter)
                    }}
                    filter={(table, column) => {
                        if (filter.right.type != "column") {
                            return true
                        }
                        return !((filter.right.value as Column).table == table && (filter.right.value as Column).name == column)
                    }}
                    addEmptyOption="start"
                />
            </div>
            <div className="col col-2">
                <select value={filter.operator} onChange={e => {
                    filter.operator = e.target.value as keyof typeof SQL_OPERATORS
                    onChange(filter)
                }}>
                    { Object.keys(SQL_OPERATORS).map((op, i) => (
                        <option key={i} value={op}>{op}</option>
                    ))}
                </select>
            </div>
            <div className="col col-2">
                <select value={filter.right.type} onChange={e => {
                    filter.right.type = e.target.value as keyof typeof DATA_TYPES
                    filter.right.value = filter.right.type == "string" ? "" :
                        filter.right.type == "column" ? { table: "", name: "" } : null
                    onChange(filter)
                }}>
                    { Object.keys(DATA_TYPES).map((type, i) => (
                        <option key={i} value={type}>{DATA_TYPES[type as keyof typeof DATA_TYPES]}</option>    
                    ))}
                </select>
            </div>
            <div className="col">
            { filter.right.type == "column" && <ColumnSelector
                db={db}
                filter={(table, column) => !((filter.left as Column).table == table && (filter.left as Column).name == column)}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    const [table, name] = e.target.value.split(".")
                    filter.right.value = { table, name }
                    onChange(filter)
                }}
                addEmptyOption="start"
            /> }
            { filter.right.type == "number" && <input type="number"
                onChange={e => {
                    filter.right.value = e.target.valueAsNumber
                    onChange(filter)
                }}
            /> }
            { filter.right.type == "date" && <input type="date"
                onChange={e => {
                    filter.right.value = e.target.valueAsDate
                    onChange(filter)
                }}
            /> }
            { filter.right.type == "string" && <input type="text"
                onChange={e => {
                    filter.right.value = e.target.value
                    onChange(filter)
                }}
            /> }
            </div>
            <div className="col col-0">
                <button className="btn" onClick={onRemove}><i className="fas fa-trash-alt" /></button>
            </div>
        </div>
    )
}

export default function FilterUI({
    usedTables = [],
    current = [],
    onChange
}: {
    usedTables: string[]
    current: Filter[]
    onChange: (current: Filter[]) => void
})
{
    const db = DB.filter(table => usedTables.includes(table.name))

    function add() {
        onChange([
            ...current,
            {
                left: { table: "", name: "" },
                operator: ">",
                right: {
                    type: "column",
                    value: {
                        table: "",
                        name: ""
                    }
                }
            }
        ])
    }

    function remove(index: number) {
        current.splice(index, 1)
        onChange(current)
    }

    return (
        <div className="mt-1 mb-3">
            <div className="row middle">
                <div className="col color-blue">
                    <label><i className="fas fa-filter"/> Filters</label>
                </div>
                <div className="col right">
                    <a onClick={add}>Add Filter Condition <i className="fas fa-plus"/></a>
                </div>
            </div>
            <hr className="mb-1"/>
            { current.map((f, i) => (
                <Filter
                    key={i}
                    db={db}
                    filter={f}
                    onRemove={() => remove(i)}
                    onChange={filter => {
                        current[i] = filter
                        onChange(current)
                    }}
                />    
            )) }
        </div>
    )
}