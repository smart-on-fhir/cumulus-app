import moment         from "moment"
import { classList }  from "../../utils"
import ColumnSelector from "./ColumnSelector"
import { operators }  from "./config"
import { app }        from "../../types"


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

    const noRightOps = ["isNull", "isNotNull", "isTrue", "isFalse", "isNotTrue", "isNotFalse"];
    

    return (
        <div style={{ background: "#EFEFEF", padding: 3, borderRadius: 7, border: "1px solid #D9D9D9" }}>
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
            { filter.left && <div className="row">
                <div className="col" style={{ margin: "3px 0" }}>
                    <select
                        value={ operators.find(op => op.id === filter.operator)?.id }
                        onChange={ e => {
                            const op = operators.find(op => op.id === e.target.value)!
                            onChange({
                                ...filter,
                                operator: op?.id,
                                right: {
                                    type: filter.right.type || "value",
                                    value: filter.right.value
                                }
                            })
                        }}
                    >
                        <option value="">Select Operator</option>
                        { operators.filter(
                            o => filter.left && (o.type.includes("*") || o.type.includes(leftDataType))
                        ).map((o, i) => <option key={i} value={ o.id }>{ o.label }</option>) }
                    </select>
                </div>
            </div> }
            {  filter.left && filter.operator && !noRightOps.includes(filter.operator) && <>
                    { (leftDataType === "integer" || leftDataType === "float") &&
                        <div className="row"><div className="col"><input
                            type="number"
                            value={isNaN(filter.right.value as number) ? "" : filter.right.value + ""}
                            onChange={e => onChange({ ...filter, right: { ...filter.right, value: e.target.valueAsNumber } })}
                            placeholder="Enter value"
                        /></div></div>
                    }

                    { leftDataType.startsWith("date") && <div className="row"><div className="col"><input type="date"
                        value={ filter.right.value ? moment(filter.right.value).utc().format("YYYY-MM-DD") : "" }
                        onChange={e => {
                            const m = moment(e.target.valueAsDate)
                            onChange({
                                ...filter,
                                right: {
                                    ...filter.right,
                                    value: m.isValid() ? m.utc().format("YYYY-MM-DD") : undefined
                                }
                            })
                        }}
                    /></div></div> }

                    { leftDataType === "string" && <div className="row"><div className="col"><input type="text"
                        value={filter.right.value as string || ""}
                        onChange={e => onChange({ ...filter, right: { ...filter.right, value: e.target.value } })}
                        style={ filter.operator === "matches" || filter.operator === "matchesCI" ? { fontFamily: "monospace" } : undefined }
                        placeholder="Enter value"
                    /></div></div> }
            </> }
            <div className="row" style={{ marginTop: 3 }}>
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
                <div className="col"></div>
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
        <div>
            { current.map((f, i) => (
                <div key={i}>
                    { i > 0 &&
                    <div className="row center" style={{ margin: "-1px 0" }}>
                        <div className="col"/>
                        <div className="col col-0" style={{ background: "#EFEFEF", padding: "0 3px", borderRight: "1px solid #D9D9D9", borderLeft: "1px solid #D9D9D9" }}>
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
            { current.length > 0 && <br /> }
            <div className="row middle">
                <div className="col center">
                    <button className="btn color-green small" onClick={add}>Add Filter</button>
                </div>
            </div>
        </div>
    )
}