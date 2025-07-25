import { LegendOptions } from "highcharts"
import PropertyGrid from "../../generic/PropertyGrid"
import { getEditorPropsFromSchemaPaths } from "../Schema"
import { DEFS } from "../Schema/definitions";
import { lengthToEm } from "../../../utils";
import { DEFAULT_FONT_FAMILY } from "../config";


export default function Legend({
    legend = {} as LegendOptions,
    onChange
}: {
    legend?: LegendOptions,
    onChange: (a: Partial<typeof legend>) => void
}) {
    const props = getEditorPropsFromSchemaPaths(
        { legend },
        x => onChange(x.legend),
        [
            "legend.enabled",
            "legend.align",
            "legend.verticalAlign",
            "legend.x",
            "legend.y",
            "legend.layout",
            "legend.alignColumns",
            "legend.floating",
            "legend.width",
            "legend.padding",
            "legend.maxHeight",
            "legend.backgroundColor",
            "legend.borderWidth",
            "legend.borderColor",
            "legend.borderRadius",
            {
                name: "Items",
                type: "group",
                open: true,
                value: [
                    "legend.itemDistance",
                    "legend.itemMarginTop",
                    "legend.itemMarginBottom",
                    "legend.labelFormat",
                    {
                        name : "Color",
                        type : "color",
                        value: legend.itemStyle?.color ?? "#333333",
                        onChange: (color?: string) => onChange({ itemStyle: { ...legend.itemStyle, color }})
                    } as any,
                    {
                        ...DEFS.fontStyle,
                        value: legend.itemStyle?.fontStyle,
                        onChange: (fontStyle?: string) => onChange({ itemStyle: { ...legend.itemStyle, fontStyle }})
                    } as any,
                    {
                        ...DEFS.fontWeight,
                        value: legend.itemStyle?.fontWeight ?? "700",
                        onChange: (fontWeight?: string) => onChange({ itemStyle: { ...legend.itemStyle, fontWeight }})
                    } as any,
                    {
                        ...DEFS.fontSize,
                        value: lengthToEm(legend.itemStyle?.fontSize ?? "0.75em"),
                        onChange: (fontSize?: number) => onChange({ itemStyle: { ...legend.itemStyle, fontSize: fontSize + "em" }})
                    } as any,
                    {
                        ...DEFS.fontFamily,
                        value: legend.itemStyle?.fontFamily ?? DEFAULT_FONT_FAMILY,
                        onChange: (fontFamily: string) => onChange({ itemStyle: { ...legend.itemStyle, fontFamily }})
                    } as any,
                    {
                        ...DEFS.whiteSpace,
                        value: legend.itemStyle?.whiteSpace ?? "normal",
                        onChange: (whiteSpace: string) => onChange({ itemStyle: { ...legend.itemStyle, whiteSpace }})
                    } as any,
                    {
                        ...DEFS.textOverflow,
                        value: legend.itemStyle?.textOverflow,
                        onChange: (textOverflow: string) => onChange({ itemStyle: { ...legend.itemStyle, textOverflow }})
                    } as any
                ]
            },
            "legend.shadow"
        ]
    )

    return <PropertyGrid props={props} />
}
