import {
    AlignValue, AxisTypeValue, DashStyleValue, merge, Options, VerticalAlignValue,
    XAxisOptions, XAxisPlotLinesOptions, YAxisOptions, YAxisPlotLinesOptions
} from "highcharts"
import moment from "moment"
import { MouseEvent } from "react"
import PropertyGrid from "../../generic/PropertyGrid"
import { Tabs } from "../../generic/Tabs"
import { DASH_STYLES, DATE_BOOKMARKS } from "../config"
import { getStyleOptions } from "./Style"


export default function AxisPlotLinesUI({
    chartOptions,
    onChange,
    selectedId = "",
    selectedPlotLineAxis = ""
}: {
    chartOptions: Options,
    onChange: (a: Partial<Options>) => void
    selectedId?: string
    selectedPlotLineAxis?: "x" | "y" | ""
}) {
    const xAxis = (chartOptions.xAxis ?? {}) as XAxisOptions
    const yAxis = (chartOptions.yAxis ?? {}) as YAxisOptions

    const children = [];
    
    if (selectedId && selectedPlotLineAxis) {
        const axis  = selectedPlotLineAxis === "x" ? xAxis : yAxis
        const lines = axis.plotLines || []
        const index = lines.findIndex(l => l.id === selectedId)
        const line  = lines[index]

        if (line) {
            children.push({
                name: <>
                    <i className="fa-solid fa-crosshairs"/> Selected Plot Line
                </>,
                children: <AxisPlotLine
                    axisType={axis.type}
                    line={line}
                    direction={selectedPlotLineAxis}
                    index={index}
                    onRemove={() => {
                        lines.splice(index, 1)
                        onChange(selectedPlotLineAxis === "x" ?
                            { xAxis: { plotLines: lines }} :
                            { yAxis: { plotLines: lines }}
                        )
                    }}
                    onChange={line => {
                        Object.assign(axis.plotLines![index], line)
                        onChange(selectedPlotLineAxis === "x" ?
                            { xAxis: { plotLines: lines }} :
                            { yAxis: { plotLines: lines }}
                        )
                    }}
                />
            })
        }
    }

    children.push({
        name: <><i className="fa-solid fa-layer-group" /> All Plot Lines</>,
        children: <AllPlotLines chartOptions={chartOptions} onChange={onChange} />
    })

    return <Tabs children={children} selectedIndex={0} />
}

export function AllPlotLines({
    chartOptions,
    onChange
}: {
    chartOptions: Options,
    onChange: (a: Partial<Options>) => void
}) {
    const xAxis = (chartOptions.xAxis ?? {}) as XAxisOptions
    const yAxis = (chartOptions.yAxis ?? {}) as YAxisOptions
    return <>
        <h6 className="color-blue-dark center">Vertical Lines</h6>
        <hr className="mb-05 color-blue-dark"/>
        <AxisPlotLines axis={xAxis} onChange={ a => onChange({ xAxis: a as XAxisOptions }) } direction="x" />
        <h6 className="color-blue-dark center">Horizontal Lines</h6>
        <hr className="mb-05 color-blue-dark"/>
        <AxisPlotLines axis={yAxis} onChange={ a => onChange({ yAxis: a as YAxisOptions }) } direction="y" />
    </>
}

export function AxisPlotLines({
    axis,
    onChange,
    direction
}: {
    axis: XAxisOptions | YAxisOptions,
    direction: "x" | "y"
    onChange: (a: Partial<typeof axis>) => void
}) {
    const lines = axis.plotLines || []
    return (
        <div className="pt-05 pb-2">
            { axis.plotLines?.map((o, i) => {
                return <AxisPlotLine
                    axisType={axis.type}
                    index={i}
                    line={o}
                    key={i}
                    direction={direction}
                    onRemove={() => {
                        lines.splice(i, 1)
                        onChange({ plotLines: [...lines] })
                    }}
                    onChange={line => {
                        Object.assign(axis.plotLines![i], line)
                        onChange({ plotLines: lines })
                    }}
                />
            }) || null }
            <div className="row middle">
                <div className="col center">
                    <button className="btn color-blue-dark small" onClick={() => {
                        lines.push({
                            // value: type === "y" ? 3500 : 1619222400000,
                            color: "#000000",
                            width: 1,
                            label: {
                                // text: "THIS IS A TEST",
                                x: direction === "y" ? 0  : 5,
                                y: direction === "x" ? 10 : -5,
                                rotation: 0,
                                style: {
                                    fontSize  : "1em",
                                    fontWeight: "400"
                                }
                            }
                        })
                        onChange({ plotLines: [ ...lines ] })
                    }}>Add { direction === "x" ? "Vertical" : "Horizontal" } Line</button>
                </div>
            </div>
        </div>
    )
}

export function AxisPlotLine({
    line,
    index,
    onChange,
    onRemove,
    axisType,
    direction
}: {
    line: XAxisPlotLinesOptions | YAxisPlotLinesOptions,
    index: number
    axisType?: AxisTypeValue
    direction: "x" | "y"
    onChange: (a: Partial<typeof line>) => void
    onRemove: () => void
}) {
    return (
        <div className="repeatable">
            <header>
                <b>{ direction === "x" ? "Vertical" : "Horizontal" } Line { index + 1 }</b>
                <button className="btn color-red small btn-virtual" onClick={() => onRemove()}>
                    <i className="fas fa-trash-alt" />
                </button>
            </header>
            <PropertyGrid props={[
                {
                    name: "Position",
                    type: axisType === "datetime" ? "date" : "number",
                    description: "The position of the line in axis units.",
                    value: line.value,
                    onChange: (value: any) => {
                        onChange({ value: axisType === "datetime" ? +new Date(value) : value })
                    },
                    onContextMenu: axisType === "datetime" ? (e: MouseEvent) => {

                        // @ts-ignore
                        e.nativeEvent.menuItems = DATE_BOOKMARKS.map(item => ({
                            label: <>{ item.date }  -  <b>{ item.name }</b></>,
                            icon : <i className="fa-regular fa-calendar-check color-blue-dark" />,
                            active: moment(line.value).utc().isSame(moment(item.date).utc(), "day"),
                            execute: () => {
                                onChange({ value: +new Date(item.date) })
                            }
                        }));

                        // @ts-ignore
                        e.nativeEvent.menuItems.unshift({ label: "Well Known Dates" })
                    } : undefined
                },
                {
                    name: "Width",
                    type: "number",
                    value: line.width,
                    step: 0.1,
                    min: 0,
                    onChange: (width: number) => onChange({ width })
                },
                {
                    name: "Color",
                    type: "color",
                    value: line.color,
                    onChange: (color: string) => onChange({ color })
                },
                {
                    name: "Dash Style",
                    type: "options",
                    options: DASH_STYLES,
                    value: line.dashStyle ?? "Solid",
                    onChange: (dashStyle: DashStyleValue) => onChange({ dashStyle })
                },
                {
                    name : "Z Index",
                    type : "number",
                    value: line.zIndex,
                    onChange: (zIndex: number) => onChange({ zIndex })
                },
                {
                    name: "Label",
                    type: "group",
                    value: [
                        {
                            name: "Text",
                            type: "string",
                            value: line.label?.text ?? "",
                            onChange: (text: string) => onChange({ label: { ...line.label, text }})
                        },
                        {
                            name: "Align",
                            type: "options",
                            options: ["left", "center", "right"],
                            value: line.label?.align,
                            onChange: (align: AlignValue) => onChange({ label: { ...line.label, align }})
                        },
                        direction === "x" ? {
                            name: "Vertical Align",
                            type: "options",
                            options: ["top", "middle", "bottom"],
                            value: line.label?.verticalAlign,
                            onChange: (verticalAlign: VerticalAlignValue) => onChange({ label: { ...line.label, verticalAlign }})
                        } : false,
                        {
                            name: "X Offset",
                            type: "number",
                            value: line.label?.x,
                            min: -500,
                            max: 500,
                            onChange: (x: number) => onChange({ label: { ...line.label, x }})
                        },
                        {
                            name: "Y Offset",
                            type: "number",
                            value: line.label?.y,
                            min: -500,
                            max: 500,
                            onChange: (y: number) => onChange({ label: { ...line.label, y } })
                        },
                        {
                            name: "Rotation",
                            type: "number",
                            value: line.label?.rotation,
                            min: -360,
                            max: 360,
                            onChange: (rotation: number) => onChange({ label: { ...line.label, rotation } })
                        }
                    ].filter(Boolean) as any,
                },
                {
                    name: "Label Style",
                    type: "group",
                    value: getStyleOptions(line.label?.style ?? {}, style => onChange(merge(line, { label: { style }})), [
                        "fontSize",
                        "fontWeight",
                        "fontStyle",
                        "fontFamily",
                        "color",
                        "textOutline"
                    ])
                }
            ]} />
        </div>
    )
}

