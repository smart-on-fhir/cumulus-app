import { ChangeEvent } from "react"
import ColumnSelector from "./ColumnSelector"




const DATA_TYPES = {
    column: "Column",
    string: "String",
    number: "Number",
    date  : "Date"
}


interface iFilter {
    left: string
    operator: string
    right: {
        type : keyof typeof DATA_TYPES
        value: string | number | Date | null
    }
}

function Filter({
    cols,
    filter,
    onChange,
    onRemove
}: {
    cols: app.DataRequestDataColumn[]
    filter: iFilter
    onChange: (f: iFilter) => void
    onRemove: () => void
})
{
    return (
        <div className="row half-gap">
            <div className="col">
                <ColumnSelector
                    cols={cols}
                    value={filter.left}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                        filter.left = e.target.value
                        onChange(filter)
                    }}
                    filter={column => {
                        return !(filter.right.type === "column" && column.name === filter.right.value)
                    }}
                    addEmptyOption="start"
                    emptyLabel="--- Select Column ---"
                />
            </div>
            <div className="col col-2">
                <select value={filter.operator} onChange={e => {
                    filter.operator = e.target.value
                    onChange(filter)
                }}>
                    <option value="==">==</option>
                    <option value="===">===</option>
                    <option value="!=">!=</option>
                    <option value="!==">!==</option>
                    <option value=">">&gt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                </select>
            </div>
            <div className="col col-2">
                <select value={filter.right.type} onChange={e => {
                    filter.right.type = e.target.value as any
                    onChange(filter)
                }}>
                    <option value="column">column:</option>
                    <option value="string">string:</option>
                    <option value="number">number:</option>
                    <option value="date">date:</option>
                    <option value="null">null</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                </select>
            </div>
            <div className="col">
                { filter.right.type === "column" && <ColumnSelector
                    cols={cols}
                    // filter={column => !((filter.left as Column).name === column)}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                        filter.right.value = e.target.value
                        onChange(filter)
                    }}
                    addEmptyOption="start"
                /> }
                { filter.right.type === "number" && <input type="number"
                    value={filter.right.value as number}
                    onChange={e => {
                        filter.right.value = e.target.valueAsNumber
                        onChange(filter)
                    }}
                /> }
                { filter.right.type === "date" && <input type="date"
                    value={filter.right.value as string}
                    onChange={e => {
                        filter.right.value = e.target.valueAsDate
                        onChange(filter)
                    }}
                /> }
                { filter.right.type === "string" && <input type="text"
                    value={filter.right.value as string}
                    onChange={e => {
                        filter.right.value = e.target.value
                        onChange(filter)
                    }}
                /> }
            </div>
            <div className="col col-0">
                <button className="btn color-red" onClick={onRemove}><i className="fas fa-trash-alt" /></button>
            </div>
        </div>
    )
}

export default function FilterUI({
    current = [],
    onChange,
    cols
}: {
    cols: app.DataRequestDataColumn[]
    current: iFilter[]
    onChange: (current: iFilter[]) => void
})
{
    function add() {
        onChange([
            ...current,
            {
                left: "",
                operator: ">",
                right: {
                    type: "column",
                    value: ""
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
                <div className="col right" style={{ paddingBottom: "4px" }}>
                    <button className="btn color-green small" onClick={add}>Add Filter</button>
                </div>
            </div>
            <hr/>
            <div className="row middle">
                <div className="col">
                    <p className="small color-muted">
                    <i className="fas fa-info-circle"/> Filters are used to exclude data rows using the given
                        column condition. Click on "Add Filter" to get started.
                    </p>
                </div>
            </div>
            { current.map((f, i) => (
                <Filter
                    key={i}
                    cols={cols}
                    filter={{...f}}
                    onRemove={() => remove(i)}
                    onChange={filter => {
                        current[i] = { ...filter }
                        onChange(current)
                    }}
                />    
            )) }
            {/* <br/> */}
            {/* <hr/> */}
            {/* <div className="row half-gap">
                <div className="col center">
                    <button className="btn btn-green small" onClick={add}>Add Filter</button>
                </div>
            </div> */}
        </div>
    )
}