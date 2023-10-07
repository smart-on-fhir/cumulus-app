import { ChartOptions } from "highcharts"
import PropertyGrid from "../../generic/PropertyGrid"
import { getEditorPropsFromSchemaPaths } from "../Schema"


export default function Chart({
    chart = {} as ChartOptions,
    onChange
}: {
    chart?: ChartOptions,
    onChange: (a: Partial<ChartOptions>) => void
}) {

    const props = getEditorPropsFromSchemaPaths(
        { chart },
        x => onChange(x.chart),
        [
            "chart.backgroundColor",
            // "chart.borderColor",
            // "chart.borderWidth",
            // "chart.borderRadius",
            // "chart.polar",
            {
                name: "Spacing",
                type: "group",
                open: true,
                value: [
                    "chart.spacingTop",
                    "chart.spacingRight",
                    "chart.spacingBottom",
                    "chart.spacingLeft",
                ]
            },
            {
                name: "Margin",
                type: "group",
                open: true,
                value: [
                    "chart.marginTop",
                    "chart.marginRight",
                    "chart.marginBottom",
                    "chart.marginLeft",
                ]
            },
            {
                name: "Style",
                type: "group",
                open: true,
                description: <div>
                    <i className="fas fa-info-circle color-blue"/> Objects
                    in the chart will use this font family, unless configured
                    otherwise. They will also use font sizes relative to this
                    one.
                </div>,
                value: [
                    "chart.style.fontSize",
                    "chart.style.fontFamily",
                ]
            },
            // {
            //     name: "3D Options",
            //     type: "group",
            //     value: [
            //         "chart.options3d.enabled",
            //         "chart.options3d.alpha",
            //         "chart.options3d.beta",
            //         "chart.options3d.depth",
            //         "chart.options3d.viewDistance",
            //         "chart.options3d.fitToPlot",
            //         "chart.options3d.axisLabelPosition"
            //     ]
            // }
        ]
    )

    return <PropertyGrid props={props} />
}