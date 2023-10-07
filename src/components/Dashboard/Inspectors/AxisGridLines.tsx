import { DashStyleValue, XAxisOptions, YAxisOptions } from "highcharts"
import PropertyGrid from "../../generic/PropertyGrid"
import { DASH_STYLES } from "../config"


export function getOptions(axis: XAxisOptions | YAxisOptions, onChange: (a: Partial<typeof axis>) => void) {
    return [
        {
            name    : "Color",
            type    : "color",
            value   : axis.gridLineColor ?? "#e6e6e6",
            onChange: (gridLineColor?: string) => onChange({ gridLineColor: gridLineColor ?? "#e6e6e6" })
        },
        {
            name    : "Width",
            type    : "number",
            min     : 0,
            step    : 0.1,
            value   : axis.gridLineWidth,
            onChange: (gridLineWidth?: number) => onChange({ gridLineWidth })
        },
        {
            name    : "Dash Style",
            type    : "options",
            options : DASH_STYLES,
            value   : axis.gridLineDashStyle ?? "Solid",
            onChange: (gridLineDashStyle: DashStyleValue) => onChange({ gridLineDashStyle: gridLineDashStyle ?? "Solid" })
        },
        {
            name    : "Z Index",
            type    : "number",
            value   : axis.gridZIndex ?? 1,
            onChange: (gridZIndex?: number) => onChange({ gridZIndex: gridZIndex ?? 1 })
        }
    ]
}

export default function AxisGridLinesEditor({
    axis,
    onChange
}: {
    axis: XAxisOptions | YAxisOptions,
    onChange: (a: Partial<typeof axis>) => void
}) {
    return <PropertyGrid props={getOptions(axis, onChange)}/>
}