import { LegendOptions } from "highcharts"
import PropertyGrid from "../../generic/PropertyGrid"
import { getEditorPropsFromSchemaPaths } from "../Schema"


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
                ]
            },
            "legend.shadow"
        ]
    )

    return <PropertyGrid props={props} />
}
