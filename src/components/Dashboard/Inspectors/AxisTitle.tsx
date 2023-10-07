import { AxisTitleAlignValue, AxisTitleOptions } from "highcharts"
import PropertyGrid                              from "../../generic/PropertyGrid"
import { getStyleOptions }                       from "./Style"


export function getOptions(title: AxisTitleOptions, onChange: (a: Partial<AxisTitleOptions>) => void) {
    return [
        {
            name: "Text",
            type: "string",
            value: title.text ?? "",
            onChange: (text?: string) => onChange({ text })
        },
        {
            name: "Align",
            type: "options",
            options: ["low", "middle", "high"],
            value: title.align ?? "middle",
            onChange: (align: AxisTitleAlignValue) => onChange({ align })
        },
        {
            name : "Style",
            type : "group",
            open : true,
            value: getStyleOptions(title.style ?? {}, style => onChange({ style }), [
                "color",
                "fontSize",
                "fontWeight",
                "opacity",
                "fontStyle",
                "textDecoration",
                "textOutline"
            ])
        }
    ] as any
}

export default function AxisTitleEditor({
    title = {} as AxisTitleOptions,
    onChange
}: {
    title?: AxisTitleOptions,
    onChange: (a: Partial<AxisTitleOptions>) => void
}) {
    return <PropertyGrid props={getOptions(title, onChange)} />
}