import { AnnotationMockPointOptionsObject, AnnotationsLabelsOptions } from "highcharts";
import moment from "moment";
import Checkbox from "../Checkbox";


const emptyAnnotation: AnnotationsLabelsOptions = {
    text: "",
    overflow: "allow",
    //useHTML: true,
    style: {
        textAlign: "center",
        fontFamily: "inherit",

    },
    point: {
        x: 1,
        y: 1,
        xAxis: 0,
        yAxis: 0
    }
};

function Annotation({
    annotation,
    onChange,
    onRemove,
    xCol,
    down,
    up
}: {
    annotation: AnnotationsLabelsOptions
    onChange: (f: AnnotationsLabelsOptions) => void
    onRemove: () => void
    up     ?: () => void
    down   ?: () => void
    xCol    : app.DataRequestDataColumn
})
{
    const point = { ...(annotation.point || {}) as AnnotationMockPointOptionsObject }
    const { x, y, xAxis, yAxis } = point;

    return (
        <div className="mb-1" style={{ background: "#EAEAEA", padding: 3, borderRadius: 7, border: "1px solid #D9D9D9" }}>
            <div className="row small">
                <div className="col">
                    <textarea
                        rows={2}
                        value={ annotation.text }
                        onChange={e => onChange({ ...annotation, text: e.target.value })}
                        placeholder="Annotation text"
                    />
                </div>
            </div>
            <div className="row middle small" style={{ margin: "6px 0 1px" }}>
                <div className="col col-0 right" style={{ margin: "0 1px 0 2px" }}><b>X</b></div>
                <div className="col" style={{ margin: "0 1px 0 2px" }}>
                    { xCol.dataType.startsWith("date") ?
                        <input type="date" value={moment(x).utc().format("YYYY-MM-DD")} onChange={e => {
                            point.x = +(e.target.valueAsDate || 0)
                            onChange({ ...annotation, point })
                        }} /> :
                        <input type="number" value={x} onChange={e => {
                            point.x = e.target.valueAsNumber
                            onChange({ ...annotation, point })
                        }}/>
                    }
                </div>
                <div className="col col-3" style={{ margin: "0 1px 0 0" }}>
                    <select value={xAxis === null ? "px" : "axis"} onChange={e => {
                        point.xAxis = e.target.value === "px" ? null : 0
                        onChange({ ...annotation, point })
                    }}>
                        <option value="axis">Axis Unit</option>
                        <option value="px">Pixels</option>
                    </select>
                </div>
                <div className="col col-3" style={{ margin: "0 0 0" }}>
                    <div className="row">
                        <b className="col middle col-0" style={{ margin: "0 1px" }}>+</b>
                        <div className="col">
                            <input type="number" value={ annotation.x || 0 } onChange={e => onChange({ ...annotation, x: e.target.valueAsNumber })}/>
                        </div>
                        <b className="col middle col-0" style={{ margin: "0 2px 0 1px" }}>px</b>
                    </div>
                </div>
            </div>
            <div className="row middle small" style={{ margin: "0 0 9px" }}>
                <div className="col col-0 right" style={{ margin: "0 1px 0 2px" }}><b>Y</b></div>
                <div className="col" style={{ margin: "0 1px 0 2px" }}>
                    <input type="number" value={y} onChange={e => {
                        point.y = e.target.valueAsNumber
                        onChange({ ...annotation, point })
                    }}/>
                </div>
                <div className="col col-3" style={{ margin: "0 1px 0 0" }}>
                    <select value={yAxis === null ? "px" : "axis"} onChange={e => {
                        point.yAxis = e.target.value === "px" ? null : 0
                        onChange({ ...annotation, point })
                    }}>
                        <option value="axis">Axis Unit</option>
                        <option value="px">Pixels</option>
                    </select>
                </div>
                <div className="col col-3" style={{ margin: "0 0 0" }}>
                    <div className="row">
                        <b className="col middle col-0" style={{ margin: "0 1px" }}>+</b>
                        <div className="col">
                            <input type="number" value={ annotation.y } onChange={e => onChange({ ...annotation, y: e.target.valueAsNumber })}/>
                        </div>
                        <b className="col middle col-0" style={{ margin: "0 2px 0 1px" }}>px</b>
                    </div>
                </div>
            </div>
            <hr/>
            <div className="row middle small" style={{ margin: "6px 0 0" }}>
                <div className="col col-2 right"><b>Shape:&nbsp;</b></div>
                <div className="col col-3">
                    <select value={ annotation.shape } onChange={e => {
                        onChange({ ...annotation, shape: e.target.value })
                    }}>
                        <option value="callout">Callout</option>
                        <option value="circle">Oval</option>
                        <option value="connector">Connector</option>
                        <option value="rect">Rectangle</option>
                        <option value="diamond">Diamond</option>
                        <option value="triangle">Triangle</option>
                    </select>
                </div>
                <div className="col col-1 right" style={{ maxWidth: "5em" }}>
                    <b>&nbsp;Position:&nbsp;</b>
                </div>
                <div className="col col-3">
                    <select value={ (annotation.verticalAlign || "bottom") + "/" + (annotation.align || "center") } onChange={e => {
                        const [verticalAlign, align] = e.target.value.split("/")
                        // @ts-ignore
                        annotation.verticalAlign = verticalAlign
                        // @ts-ignore
                        annotation.align = align
                        onChange(annotation)
                    }}>
                        <option value="top/left">top/left</option>
                        <option value="top/center">top/center</option>
                        <option value="top/right">top/right</option>
                        <option value="middle/left">middle/left</option>
                        <option value="middle/center">middle/center</option>
                        <option value="middle/right">middle/right</option>
                        <option value="bottom/left">bottom/left</option>
                        <option value="bottom/center">bottom/center</option>
                        <option value="bottom/right">bottom/right</option>
                    </select>
                </div>
            </div>
            <div className="row middle small" style={{ margin: "3px 0 0" }}>
                <div className="col col-2 right"><b>Theme:&nbsp;</b></div>
                <div className="col col-3">
                    <select
                        value={ annotation.borderColor === "#888888" ? "light" : "dark" }
                        onChange={e => {
                            onChange({
                                ...annotation,
                                borderColor    : e.target.value === "light" ? "#888888" : "#000000",
                                backgroundColor: e.target.value === "light" ? "#EEEEEEDD" : "#333333DD",
                                style: { ...annotation.style, color: e.target.value === "light" ? "#000000" : "#FFFFFF" }
                            })
                        }}
                    >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                    </select>
                </div>
                <div className="col col-2 right">
                    <b>Color:&nbsp;</b>
                </div>
                <div className="col">
                    <input type="color" value={ annotation.style?.color || "#FFFFFF" } onChange={e => {
                        onChange({ ...annotation, style: { ...annotation.style, color: e.target.value }})
                    }} />
                </div>
            </div>
            <div className="row middle small" style={{ margin: "3px 0 0" }}>
                <div className="col col-2 right"><b>Font:&nbsp;</b></div>
                <div className="col col-3">
                    <select value={ annotation.style?.fontSize } onChange={e => {
                        onChange({ ...annotation, style: { ...annotation.style, fontSize: e.target.value } })
                    }}>
                        <option value="10px">10px</option>
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                        <option value="20px">20px</option>
                        <option value="22px">22px</option>
                    </select>
                </div>
                <div className="col col-2 right" style={{ maxWidth: "5em" }}><b>Padding:&nbsp;</b></div>
                <div className="col">
                    <select value={ annotation.padding } onChange={e => {
                        onChange({ ...annotation, padding: +e.target.value })
                    }}>
                        <option value="0">0px</option>
                        <option value="2">2px</option>
                        <option value="4">4px</option>
                        <option value="6">6px</option>
                        <option value="8">8px</option>
                        <option value="10">10px</option>
                        <option value="12">12px</option>
                        <option value="14">14px</option>
                        <option value="16">16px</option>
                    </select>
                </div>
                
            </div>
            <div className="row small middle" style={{ marginTop: 3 }}>
                <div className="col col-2"></div>
                <div className="col" style={{ lineHeight: 1.6 }}>
                    <Checkbox
                        label="Shadow"
                        checked={ !!annotation.shadow }
                        // disabled={ annotation.shape === "connector" }
                        name="shadow"
                        onChange={ shadow => onChange({ ...annotation, shadow })}
                    />
                </div>
                <div className="col right">
                    <button className="btn color-red small" onClick={onRemove}>
                        <i className="fas fa-trash-alt" />
                    </button>
                </div>
            </div>
        </div>
    )
}


export default function AnnotationsUI({
    current = [],
    onChange,
    xCol
}: {
    current: AnnotationsLabelsOptions[],
    onChange: (current: AnnotationsLabelsOptions[]) => void
    xCol: app.DataRequestDataColumn
})
{
    function add() {
        onChange([ ...current, emptyAnnotation ])
    }

    function remove(index: number) {
        current.splice(index, 1)
        onChange(current)
    }

    function up(index: number) {
        const items = [...current];
        const cur = items[index];
        items.splice(index, 1)
        items.splice(index - 1, 0, cur)
        onChange(items)
    }

    function down(index: number) {
        const items = [...current];
        const cur = items[index];
        items.splice(index, 1)
        items.splice(index + 1, 0, cur)
        onChange(items)
    }

    return (
        <div className="mt-1 mb-1">
            { current.map((f, i) => (
                <Annotation
                    key={i}
                    annotation={{...f}}
                    xCol={xCol}
                    onRemove={() => remove(i)}
                    up={ i > 0 ? up.bind(null, i) : undefined }
                    down={ i < current.length - 1 ? down.bind(null, i) : undefined }
                    onChange={f => {
                        current[i] = { ...f }
                        onChange(current)
                    }}
                />
            )) }
            { current.length > 0 && <hr className="mt-1 mb-1"/> }
            <div className="row middle">
                <div className="col center">
                    <button className="btn color-green small" onClick={add}>Add Annotation</button>
                </div>
            </div>
        </div>
    )
}