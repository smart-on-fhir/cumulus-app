import { TitleOptions }    from "highcharts"
import PropertyGrid        from "../../generic/PropertyGrid"
import { getStyleOptions } from "./Style"

export default function Title({
    title = {} as TitleOptions,
    onChange
}: {
    title?: TitleOptions,
    onChange: (a: Partial<TitleOptions>) => void
}) {
    return (
        <PropertyGrid props={[
            {
                name: "Text",
                type: "string",
                value: title.text,
                onChange: (text?: string) => onChange({ text })
            },
            {
                name: "Color",
                type: "color",
                value: title.style?.color || "#000000",
                onChange: (color?: string) => onChange({ style: { ...title.style, color: color || "#000000"  } })
            },
            ...getStyleOptions(
                title.style ?? {},
                style => onChange({ style }),
                [
                    "fontSize",
                    "fontWeight",
                    "opacity",
                    "fontStyle",
                    "textDecoration",
                    "textOutline"                    
                ]
            )
        ]} />
    )
}