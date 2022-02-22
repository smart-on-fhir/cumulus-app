import moment         from "moment"
import { classList }  from "../../utils"
import Select         from "../Select"
import ColumnSelector from "./ColumnSelector"
import { operators }  from "./config"


function Filter({
    cols,
    filter,
    onChange,
    onRemove
}: {
    cols: app.DataRequestDataColumn[]
    filter: app.Filter
    onChange: (f: app.Filter) => void
    onRemove: () => void
})
{
    const leftColumn   = filter.left ? cols.find(c => c.name === filter.left) : null;
    const leftDataType = leftColumn ? leftColumn.dataType : "";

    return (
        <div className="row half-gap">
            <div className="col">
                <ColumnSelector
                    cols={cols}
                    value={filter.left}
                    onChange={(value: string) => onChange({ ...filter, left: value })}
                    disabled={ filter.right.type === "column" ? [filter.right.value + ""] : undefined }
                    placeholder="Select Column"
                />
            </div>

            <div className="col col-0">
                { filter.left && <button
                    style={{ paddingLeft: "0.5em", paddingRight: "0.5em" }}
                    className={classList({ btn: true, "color-red": filter.negated, "string": !filter.negated })}
                    title={ filter.negated ? "Filter negated. Click to reset." : "Filter not negated. Click to negate." }
                    onClick={() => onChange({ ...filter, negated: !filter.negated })}>
                    <i className={ "fa-solid fa-thumbs-" + (filter.negated ? "down" : "up") } />
                </button> }
            </div>

            <div className="col">
                { filter.left && <Select
                    value={ filter.operator }
                    onChange={ operator => onChange({ ...filter, operator }) }
                    placeholder="Select Operator"
                    options={operators.filter(o => filter.left && (o.type.includes("*") || o.type.includes(leftDataType))).map(o => ({
                        value: o.id,
                        label: o.label || o.op
                    }))}
                /> }
            </div>

            <div className="col">
                { filter.left && filter.operator && filter.operator !== "isNull" && (
                    <Select
                        value={ filter.right.type }
                        onChange={ type => onChange({ ...filter, right: { type, value: null }})}
                        placeholder="Please Select"
                        options={[
                            { value: "value", label: "Value:" },
                            { value: "column", label: "Column:" },
                        ]}
                    />
                )}
            </div>

            <div className="col">
                { filter.left && filter.operator && filter.operator !== "isNull" && filter.right.type === "column" && <ColumnSelector
                    cols={cols}
                    value={filter.right.value}
                    disabled={[ filter.left as any ]}
                    filter={column => column.dataType === leftDataType}
                    onChange={(value: string) => onChange({ ...filter, right: { ...filter.right, value } })}
                    placeholder="Select Column"
                    right
                /> }

                { filter.left && filter.operator && filter.operator !== "isNull" && filter.right.type === "value" && (leftDataType === "integer" || leftDataType === "float") && <input type="number"
                    value={filter.right.value as number || 0}
                    onChange={e => onChange({ ...filter, right: { ...filter.right, value: e.target.valueAsNumber } })}
                /> }

                { filter.operator && filter.operator !== "isNull" && filter.right.type === "value" && leftDataType.startsWith("date") && <input type="date"
                    value={ moment(filter.right.value).utc().format("YYYY-MM-DD") }
                    onChange={e => onChange({ ...filter, right: { ...filter.right, value: moment(e.target.valueAsDate).valueOf() } })}
                /> }

                { filter.left && filter.operator && filter.operator !== "isNull" && filter.right.type === "value" && leftDataType === "string" && <input type="text"
                    value={filter.right.value as string || ""}
                    onChange={e => onChange({ ...filter, right: { ...filter.right, value: e.target.value } })}
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
    current: app.Filter[]
    onChange: (current: app.Filter[]) => void
})
{
    function add() {
        onChange([
            ...current,
            {
                left: "",
                operator: "",
                negated: false,
                right: {
                    type: "value",
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
        <div className="mt-1 mb-1">
            <div className="row middle">
                <div className="col">
                    <label>
                        Filters
                        <span className="color-muted small" style={{ fontWeight: 400 }}> - conditions used to exclude data rows</span>
                    </label>
                </div>
                <div className="col col-0" style={{ paddingBottom: "4px" }}>
                    <button className="btn color-blue small" onClick={add}>Add Filter</button>
                </div>
            </div>
            <hr/>
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
        </div>
    )
}