import moment         from "moment"
import { classList }  from "../../utils"
import Select         from "../Select"
import ColumnSelector from "./ColumnSelector"
import { operators }  from "./config"


const emptyFilter: app.Filter = {
    left: "",
    operator: "",
    negated: false,
    join: "and",
    right: {
        type: "value",
        // value: undefined
    }
};

function Filter({
    cols,
    filter,
    onChange,
    onRemove,
    down,
    up
}: {
    cols    : app.DataRequestDataColumn[]
    filter  : app.Filter
    onChange: (f: app.Filter) => void
    onRemove: () => void
    up     ?: () => void
    down   ?: () => void
})
{
    const leftColumn   = filter.left ? cols.find(c => c.name === filter.left) : null;
    const leftDataType = leftColumn ? leftColumn.dataType : "";

    

    return (
        <div style={{ background: "#EAEAEA", padding: 3, borderRadius: 7, border: "1px solid #D9D9D9" }}>
            <div className="row">
                <div className="col">
                    <ColumnSelector
                        cols={cols}
                        value={filter.left}
                        onChange={(value: string) => onChange({ ...emptyFilter, left: value })}
                        disabled={ filter.right.type === "column" ? [filter.right.value + ""] : undefined }
                        placeholder="Select Column"
                    />
                </div>
            </div>
            <div className="row">
                <div className="col" style={{ margin: "3px 0" }}>
                    { filter.left && <Select
                        value={ operators.find(op => op.id === filter.operator) }
                        onChange={ operator => onChange({
                            ...filter,
                            operator: operator.id,
                            right: {
                                type: filter.right.type || "value",
                                value: filter.right.value === undefined ? operator.defaultValue : filter.right.value
                            }
                        }) }
                        placeholder="Select Operator"
                        options={operators.filter(o => filter.left && (o.type.includes("*") || o.type.includes(leftDataType))).map(o => ({
                            value: o,
                            label: o.label
                        }))}
                    /> }
                </div>
                
                { filter.left && filter.operator && filter.operator !== "isNull" && (
                    <div className="col col-0" style={{ margin: "3px 0 3px 3px" }}>
                        <select
                            value={ filter.right.type }
                            onChange={ e => onChange({
                                ...filter,
                                right: {
                                    type: e.target.value as "value" | "column",
                                    value: null
                                }
                            })}
                        >
                            <option value="value">Value</option>
                            <option value="column">Column</option>
                        </select>
                    </div>
                )}
            </div>
            <div className="row">

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

                    { filter.left && filter.operator && filter.operator !== "isNull" && filter.right.type === "value" && (leftDataType === "integer" || leftDataType === "float") && <input
                        type="number"
                        value={isNaN(filter.right.value as number) ? "" : filter.right.value + ""}
                        onChange={e => onChange({ ...filter, right: { ...filter.right, value: e.target.valueAsNumber } })}
                        placeholder="Enter value"
                    /> }

                    { filter.operator && filter.operator !== "isNull" && filter.right.type === "value" && leftDataType.startsWith("date") && <input type="date"
                        value={ moment(filter.right.value).utc().format("YYYY-MM-DD") }
                        onChange={e => onChange({ ...filter, right: { ...filter.right, value: moment(e.target.valueAsDate).valueOf() } })}
                    /> }

                    { filter.left && filter.operator && filter.operator !== "isNull" && filter.right.type === "value" && leftDataType === "string" && <input type="text"
                        value={filter.right.value as string || ""}
                        onChange={e => onChange({ ...filter, right: { ...filter.right, value: e.target.value } })}
                        style={ filter.operator === "matches" || filter.operator === "matchesCI" ? { fontFamily: "monospace" } : undefined }
                        placeholder="Enter value"
                    /> }
                </div>
            </div>
            {/* <hr/> */}
            <div className="row" style={{ marginTop: 3 }}>
                <div className="col col-0 small">
                    { filter.left && <label><input
                        type="checkbox"
                        checked={filter.negated}
                        onChange={e => onChange({ ...filter, negated: e.target.checked })}
                        style={{ margin: "1px 0 -1px 4px", lineHeight: 1, verticalAlign: "top" }}
                    /> Negate filter
                    </label> }
                </div>
                <div className="col"></div>
                
                { up && <><div className="col col-0">
                    <button className="btn small" onClick={up}>
                        <i className="fas fa-arrow-up" />
                    </button>
                </div>
                <div className="col" style={{ maxWidth: "3px" }}></div>
                </> }
                { down && <>
                <div className="col col-0">
                    <button className="btn small" onClick={down}>
                        <i className="fas fa-arrow-down" />
                    </button>
                </div>
                <div className="col" style={{ maxWidth: "3px" }}></div>
                </>}
                <div className="col col-0">
                    <button className="btn color-red small" onClick={onRemove}>
                        <i className="fas fa-trash-alt" />
                    </button>
                </div>
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
        onChange([ ...current, emptyFilter ])
    }

    function remove(index: number) {
        current.splice(index, 1)
        onChange(current)
    }

    function up(index: number) {
        const filters = [...current];
        const cur = filters[index];
        filters.splice(index, 1)
        filters.splice(index - 1, 0, cur)
        onChange(filters)
    }

    function down(index: number) {
        const filters = [...current];
        const cur = filters[index];
        filters.splice(index, 1)
        filters.splice(index + 1, 0, cur)
        onChange(filters)
    }

    return (
        <div className="mt-1 mb-1">
            { current.map((f, i) => (
                <div key={i}>
                    { i > 0 &&
                    <div className="row center" style={{ margin: "-1px 0" }}>
                        <div className="col"/>
                        <div className="col col-0" style={{ background: "#EAEAEA", padding: "0 3px", borderRight: "1px solid #D9D9D9", borderLeft: "1px solid #D9D9D9" }}>
                            <div className="toolbar small">
                                <button
                                    style={{ width: "3.4em" }}
                                    className={classList({ btn: true, active: f.join === "and" })}
                                    onClick={() => {
                                        current[i] = { ...f, "join": "and" };
                                        onChange(current)
                                    }}
                                >AND</button>
                                <button
                                    style={{ width: "3.4em" }}
                                    className={classList({ btn: true, active: f.join === "or" })}
                                    onClick={() => {
                                        current[i] = { ...f, "join": "or" };
                                        onChange(current)
                                    }}
                                >OR</button>
                            </div>
                        </div>
                        <div className="col"/>
                    </div> }
                    <Filter
                        cols={cols}
                        filter={{...f}}
                        onRemove={() => remove(i)}
                        up={ i > 0 ? up.bind(null, i) : undefined }
                        down={ i < current.length - 1 ? down.bind(null, i) : undefined }
                        onChange={filter => {
                            current[i] = { ...filter }
                            onChange(current)
                        }}
                    />
                </div>
            )) }
            <hr className="mt-1 mb-1"/>
            <div className="row middle">
                <div className="col center">
                    <button className="btn color-green small" onClick={add}>Add Filter</button>
                </div>
            </div>
        </div>
    )
}