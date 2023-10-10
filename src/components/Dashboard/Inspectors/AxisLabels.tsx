import { OptionsPosition3dValue, XAxisOptions, YAxisOptions } from "highcharts"
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
        // {
        //     name    : "Format",
        //     type    : "text",
        //     value   : axis.labels?.format ?? "{text}",
        //     onChange: (format: string) => onChange({ labels: { format }})
        // },
        {
            name: "zIndex",
            type: "number",
            value: axis.labels?.zIndex ?? 7,
            onChange: (zIndex = 7) => onChange({ labels: { zIndex }})
        },
        {
            name    : "skew3d",
            type    : "boolean",
            value   : !!axis.labels?.skew3d,
            onChange: (skew3d: boolean) => onChange({ labels: { skew3d }})
        },
        {
            name: "Position-3D",
            type: "options",
            description: "Defines how the labels are be repositioned according to the 3D chart orientation.\n\n" +
                "'offset': Maintain a fixed horizontal/vertical distance from the tick marks, despite the chart orientation. This is the backwards compatible behavior, and causes skewing of X and Z axes.\n\n" + 
                "'chart': Preserve 3D position relative to the chart. This looks nice, but hard to read if the text isn't forward-facing.\n\n" +
                "'flap': Rotated text along the axis to compensate for the chart orientation. This tries to maintain text as legible as possible on all orientations.\n\n" + 
                "'ortho': Rotated text along the axis direction so that the labels are orthogonal to the axis. This is very similar to 'flap', but prevents skewing the labels (X and Y scaling are still present).\n\n" + 
                "Defaults to offset.",
            options: ["offset", "chart", "flap", "ortho"],
            value   : axis.labels?.position3d ?? "offset",
            onChange: (position3d: OptionsPosition3dValue) => onChange({ labels: { position3d }})
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