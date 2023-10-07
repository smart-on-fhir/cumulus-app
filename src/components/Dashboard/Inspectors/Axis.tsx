import { XAxisOptions, YAxisOptions }       from "highcharts"
import PropertyGrid                         from "../../generic/PropertyGrid"
import { getOptions as getLabelsOptions }   from "./AxisLabels"
import { getOptions as getGridLineOptions } from "./AxisGridLines"
import { getOptions as getTitleOptions }    from "./AxisTitle"


export function getOptions(axis: XAxisOptions | YAxisOptions, onChange: (a: Partial<typeof axis>) => void) {
    return [
        {
            name: "Alternate Grid Color",
            type: "color",
            value: axis.alternateGridColor ?? "#0000",
            onChange: (alternateGridColor?: any) => onChange({ alternateGridColor: alternateGridColor + "" })
        },
        {
            name: "Line Color",
            type: "color",
            value: axis.lineColor ?? "#333333",
            onChange: (lineColor?: string) => onChange({ lineColor: lineColor ?? "#333333" })
        },
        {
            name: "Line Width",
            type: "number",
            min: 0,
            value: axis.lineWidth ?? 1,
            onChange: (lineWidth?: number) => onChange({ lineWidth: lineWidth ?? 1 })
        },
        {
            name: "Reversed",
            type: "boolean",
            value: !!axis.reversed,
            onChange: (reversed: boolean) => onChange({ reversed })
        },
        {
            name: "Start on Tick",
            type: "boolean",
            value: axis.startOnTick !== false,
            onChange: (startOnTick: boolean) => onChange({ startOnTick })
        },
        {
            name    : "Min",
            type    : axis.type === "datetime" ? "date" : "number",
            value   : axis.type === "datetime" ? +new Date(axis.min ?? 0) : axis.min ?? undefined,
            disabled: axis.type === "category",
            onChange: (min?: number) => onChange({
                min: min ?
                    axis.type === "datetime" ?
                        +new Date(min) :
                        min ?? null:
                    null
            })
        },
        // {
        //     name : "softMin",
        //     type : "number",
        //     value: axis.softMin,
        //     onChange: (softMin?: number) => onChange({ softMin })
        // },
        {
            name: "End on Tick",
            type: "boolean",
            value: !!axis.endOnTick,
            onChange: (endOnTick: boolean) => onChange({ endOnTick })
        },
        {
            name    : "Max",
            type    : axis.type === "datetime" ? "date" : "number",
            value   : axis.type === "datetime" ? +new Date(axis.max ?? 0) : axis.max ?? undefined,
            disabled: axis.type === "category",
            onChange: (max?: number) => onChange({
                max: max ?
                    axis.type === "datetime" ?
                        +new Date(max) :
                        max ?? null:
                    null
            })
        },
        // {
        //     name : "softMax",
        //     type : "number",
        //     value: axis.softMax,
        //     onChange: (softMax?: number) => onChange({ softMax })
        // },
        // {
        //     name : "minPadding",
        //     type : "number",
        //     value: axis.minPadding ?? 0.05,
        //     step: 0.01,
        //     min: 0,
        //     onChange: (minPadding?: number) => onChange({ minPadding })
        // },
        {
            name: "Tick Width",
            type: "number",
            min: 0,
            max: 10,
            step: 0.5,
            value: axis.tickWidth ?? 0,
            onChange: (tickWidth?: number) => onChange({ tickWidth })
        },
        {
            name: "Title",
            type: "group",
            value: getTitleOptions(axis.title ?? {}, title => onChange({ title })),
            // open: true
        },
        {
            name: "Grid Lines",
            type: "group",
            value: getGridLineOptions(axis, onChange),
            // open: true
        },
        {
            name: "Labels",
            type: "group",
            value: getLabelsOptions(axis, onChange),
            // open: true
        }
    ] as any[]
}


export default function AxisEditor({
    axis = {} as XAxisOptions,
    onChange
}: {
    axis?: XAxisOptions | YAxisOptions,
    onChange: (a: Partial<typeof axis>) => void
}) {
    return <PropertyGrid props={ getOptions(axis, onChange) } />
}
