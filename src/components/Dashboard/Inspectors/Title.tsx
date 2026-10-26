import { SubtitleOptions, TitleOptions } from "highcharts"
import PropertyGrid        from "../../generic/PropertyGrid"
import { getStyleOptions } from "./Style"

/**
 * Editor of the chart title, also used for the subtitle
 */
export default function Title({
    title = {} as TitleOptions,
    onChange,
    defaultColor = "#000000"
}: {
    title?: TitleOptions | SubtitleOptions,
    onChange: (a: Partial<TitleOptions | SubtitleOptions>) => void

    /**
     * The color Highcharts uses when none is set (gray for subtitles)
     */
    defaultColor?: string
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
                value: title.style?.color || defaultColor,
                onChange: (color?: string) => onChange({ style: { ...title.style, color: color || defaultColor } })
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