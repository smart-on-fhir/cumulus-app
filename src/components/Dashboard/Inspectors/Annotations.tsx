import { AnnotationMockPointOptionsObject, AnnotationsLabelsOptions } from "highcharts"
import moment             from "moment"
import Checkbox           from "../../generic/Checkbox"
import { Tabs }           from "../../generic/Tabs";
import { DATE_BOOKMARKS } from "../config"


const emptyAnnotation: AnnotationsLabelsOptions = {
    text: "",
    overflow: "allow",
    style: {
        textAlign : "center",
        fontFamily: "inherit",
        fontSize  : "1em"
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
    xType,
    selected
}: {
    annotation: AnnotationsLabelsOptions
    onChange: (f: AnnotationsLabelsOptions) => void
    onRemove: () => void
    xType  ?: string
    selected?: boolean
})
{
    const point = { ...(annotation.point || {}) as AnnotationMockPointOptionsObject }
    const { x, y, xAxis, yAxis } = point;

    return (
        <div className="mb-1" style={{
            background: "#DDD3 linear-gradient(#F7F7F7, #DDD3)",
            padding: 5,
            borderRadius: 7,
            border: selected ? "1px solid #09F" : "1px solid #D9D9D9",
            boxShadow: selected ? "0 0 0 3px #09F3" : "none"
        }}>
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
                    { xType?.startsWith("date") ?
                        <input type="date" value={moment(x).utc().format("YYYY-MM-DD")} onChange={e => {
                            point.x = +(e.target.valueAsDate || 0)
                            onChange({ ...annotation, point })
                        }} onContextMenu={e => {

                            // @ts-ignore
                            e.nativeEvent.menuItems = DATE_BOOKMARKS.map(item => ({
                                label: <>{ item.date }  -  <b>{ item.name }</b></>,
                                icon : <i className="fa-regular fa-calendar-check color-blue-dark" />,
                                active: moment(x).utc().isSame(moment(item.date).utc(), "day"),
                                execute: () => {
                                    point.x = +(new Date(item.date))
                                    onChange({ ...annotation, point })
                                }
                            }));

                            // @ts-ignore
                            e.nativeEvent.menuItems.unshift({ label: "Well Known Dates" })
                        }}/> :
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
                            <input type="number" value={ annotation.y || 0 } onChange={e => onChange({ ...annotation, y: e.target.valueAsNumber })}/>
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
                <div className="col col-2 right" style={{ maxWidth: "5em" }}>
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
                <div className="col col-0">
                    <input
                        type="color"
                        value={
                            annotation.style?.color === "contrast" ?
                            annotation.backgroundColor ===  "#EEEEEEDD" ? "#000000" : "#FFFFFF" :
                            annotation.style?.color || "#888888"
                        }
                        onChange={e => {
                            onChange({ ...annotation, style: { ...annotation.style, color: e.target.value }})
                        }}
                    />
                </div>
            </div>
            <div className="row middle small" style={{ margin: "3px 0 0" }}>
                <div className="col col-2 right"><b>Padding:&nbsp;</b></div>
                <div className="col col-3">
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
                <div className="col col-3 right">
                    <Checkbox
                        label="Shadow"
                        checked={ !!annotation.shadow }
                        // disabled={ annotation.shape === "connector" }
                        name="shadow"
                        // labelLeft
                        onChange={ shadow => onChange({ ...annotation, shadow })}
                    />
                </div>
                
            </div>
            <div className="row small middle" style={{ marginTop: 3 }}>
                <div className="col col-2"></div>
                <div className="col" style={{ lineHeight: 1.6 }}>
                    
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

export default function Annotations({
    annotations = [],
    onChange,
    xType = "",
    selectedIndex
}: {
    annotations?: AnnotationsLabelsOptions[],
    onChange: (annotations: AnnotationsLabelsOptions[]) => void
    xType?: string
    selectedIndex: number
})
{
    const validSelectionIndex = selectedIndex > -1 && selectedIndex < annotations.length

    const children = [];

    

    if (validSelectionIndex && selectedIndex > -1) {
        const annotation = annotations[selectedIndex]
        children.push({
            name: <>
                <i className="fa-solid fa-crosshairs"/> Selected Annotation
            </>,
            children: <Annotation
                annotation={{ ...annotation }}
                xType={ xType }
                onRemove={() => {
                    annotations.splice(selectedIndex, 1)
                    onChange(annotations)
                }}
                onChange={f => {
                    annotations[selectedIndex] = { ...f }
                    onChange(annotations)
                }}
            />
        })
    }

    children.push({
        name: <><i className="fa-solid fa-layer-group" /> All Annotations</>,
        children: <AllAnnotations
            annotations={annotations}
            onChange={onChange}
            selectedIndex={selectedIndex}
            xType={xType}
        />
    })

    return <Tabs children={children} selectedIndex={0} />
}

export function AllAnnotations({
    annotations = [],
    onChange,
    xType = "",
    selectedIndex = -1
}: {
    annotations?: AnnotationsLabelsOptions[],
    onChange: (annotations: AnnotationsLabelsOptions[]) => void
    xType?: string
    selectedIndex?: number
})
{
    function add() {
        onChange([ ...annotations, emptyAnnotation ])
    }

    function remove(index: number) {
        annotations.splice(index, 1)
        onChange(annotations)
    }

    return <>
        { annotations.map((f, i) => (
            <Annotation
                key={i}
                annotation={{...f}}
                xType={xType}
                selected={selectedIndex === i}
                onRemove={() => remove(i)}
                onChange={f => {
                    annotations[i] = { ...f }
                    onChange(annotations)
                }}
            />
        )) }
        { annotations.length > 0 && <hr/> }
        <div className="row middle mt-1">
            <div className="col center">
                <button className="btn color-green small" onClick={add}>Add Annotation</button>
            </div>
        </div>
    </>

}
