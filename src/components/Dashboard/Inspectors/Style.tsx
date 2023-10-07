import { CSSObject, CursorValue } from "highcharts"
import { CSSProperties }          from "react"
import { lengthToEm }             from "../../../utils"
import { EditableProperty }       from "../../generic/PropertyGrid/types"
import { DEFAULT_FONT_FAMILY }    from "../config"
import { DEFS }                   from "../Schema"


export function getStyleOptions(
    style: Partial<CSSObject>,
    onChange: (style: Partial<CSSObject>) => void,
    whiteList: ("textOutline" | keyof CSSProperties)[]
): EditableProperty[] {

    const props: any[] = whiteList.map(key => {
        
        if (key === "fontSize") {
            return {
                ...DEFS.fontSize,
                value: lengthToEm(style.fontSize ?? "1em"),
                onChange: (fontSize?: number) => onChange({ fontSize: (fontSize || 1) + "em" })
            }
        }

        if (key === "fontWeight") {
            return {
                ...DEFS.fontWeight,
                value: style.fontWeight ?? "400",
                onChange: (fontWeight: string) => onChange({ fontWeight })
            }
        }

        if (key === "color") {
            // The 'contrast' option is a Highcharts custom property that results in black or white, depending on the background of the element.
            return {
                name: "Color",
                type: "color",
                value: style.color,
                onChange: (color?: any) => onChange({ color })
            }
        }

        if (key === "background") {
            props.push({
                name: "Background",
                type: "string",
                value: style.background,
                onChange: (background?: string) => onChange({ background })
            })
        }
    
        if (key === "backgroundColor") {
            props.push({
                name: "Background Color",
                type: "color",
                value: style.backgroundColor,
                onChange: (backgroundColor?: string) => onChange({ backgroundColor })
            })
        }

        if (key === "border") {
            return {
                name: "Border",
                type: "string",
                value: style.border,
                onChange: (border?: string) => onChange({ border })
            }
        }

        if (key === "borderRadius") {
            return {
                name: "Border Radius",
                type: "number",
                min: 0,
                max: 50,
                value: style.borderRadius,
                onChange: (borderRadius?: number) => onChange({ borderRadius })
            }
        }

        if (key === "cursor") {
            return {
                name: "Cursor",
                type: "string",
                value: style.cursor,
                onChange: (cursor?: CursorValue) => onChange({ cursor })
            }
        }

        if (key === "height") {
            return {
                name: "Height",
                type: "length",
                min: 0,
                units: ["px", "em", "%"],
                value: style.height,
                onChange: (height?: any) => onChange({ height })
            }
        }

        if (key === "width") {
            return {
                name: "Width",
                type: "length",
                min: 0,
                units: ["px", "em", "%"],
                value: style.width,
                onChange: (width?: any) => onChange({ width })
            }
        }

        if (key === "borderWidth") {
            return {
                ...DEFS.borderWidth,
                value: style.borderWidth,
                onChange: (borderWidth?: number) => onChange({ borderWidth })
            }
        }

        if (key === "opacity") {
            return {
                name: "Opacity",
                type: "number",
                min: 0,
                max: 1,
                step: 0.01,
                value: style.opacity ?? 1,
                onChange: (opacity?: number) => onChange({ opacity })
            }
        }

        if (key === "textAlign") {
            return {
                ...DEFS.textAlign,
                value: style.textAlign,
                onChange: (textAlign?: string) => onChange({ textAlign })
            }
        }

        if (key === "padding") {
            return {
                name: "Padding",
                type: "string",
                value: style.padding,
                onChange: (padding?: string) => onChange({ padding })
            }
        }

        if (key === "fontFamily") {
            return {
                ...DEFS.fontFamily,
                value: style.fontFamily || DEFAULT_FONT_FAMILY,
                onChange: (fontFamily?: string) => onChange({ fontFamily })
            }
        }

        if (key === "textDecoration") {
            return {
                ...DEFS.textDecoration,
                value: style.textDecoration,
                onChange: (textDecoration?: string) => onChange({ textDecoration })
            }
        }

        if (key === "textOutline") {
            return {
                name: "Text Outline",
                type: "string",
                value: style.textOutline,
                onChange: (textOutline?: string) => onChange({ textOutline })
            }
        }

        if (key === "textOverflow") {
            return {
                ...DEFS.textOverflow,
                value: style.textOverflow,
                onChange: (textOverflow?: string) => onChange({ textOverflow })
            }
        }

        if (key === "whiteSpace") {
            return {
                ...DEFS.whiteSpace,
                value: style.whiteSpace,
                onChange: (whiteSpace?: string) => onChange({ whiteSpace })
            }
        }

        if (key === "fontStyle") {
            return {
                ...DEFS.fontStyle,
                value: style.fontStyle,
                onChange: (fontStyle?: string) => onChange({ fontStyle })
            }
        }

        return {
            name: key,
            type: "string",
            value: style[key],
            onChange: (x?: string) => onChange({ [key]: x })
        }

    })

    return props
}
