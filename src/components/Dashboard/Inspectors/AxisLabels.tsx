import { XAxisOptions, YAxisOptions } from "highcharts"
import PropertyGrid                   from "../../generic/PropertyGrid"
import { getStyleOptions }            from "./Style"


export function getOptions(axis: XAxisOptions | YAxisOptions, onChange: (a: Partial<typeof axis>) => void) {
    return [
        {
            name    : "Enabled",
            type    : "boolean",
            value   : axis.labels?.enabled !== false,
            onChange: (enabled: boolean) => onChange({ labels: { enabled }})
        },
        {
            name    : "Format",
            type    : "text",
            value   : axis.labels?.format ?? "{text}",
            onChange: (format: string) => onChange({ labels: { format }})
        },
        {
            name: "zIndex",
            type: "number",
            value: axis.labels?.zIndex ?? 7,
            onChange: (zIndex = 7) => onChange({ labels: { zIndex }})
        },
        {
            name : "Style",
            type : "group",
            open : true,
            value: getStyleOptions(axis.labels?.style ?? {}, style => onChange({ labels: { style }}), [
                "color",
                "fontSize",
                "fontWeight",
                "opacity",
                "fontStyle",
                "textDecoration",
                // @ts-ignore
                "textOutline"
            ])
        }
    ] as any
}

export default function AxisLabelsEditor({
    axis,
    onChange
}: {
    axis: XAxisOptions | YAxisOptions,
    onChange: (a: Partial<typeof axis>) => void
}) {
    return <PropertyGrid props={getOptions(axis, onChange)} />
}