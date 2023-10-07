import { ChartOptions } from "highcharts"
import PropertyGrid from "../../generic/PropertyGrid"
import { getEditorPropsFromSchemaPaths } from "../Schema"

export default function Plot({
    chart = {} as ChartOptions,
    onChange
}: {
    chart?: ChartOptions,
    onChange: (a: Partial<ChartOptions>) => void
}) {
    const props = getEditorPropsFromSchemaPaths({ chart }, x => onChange(x.chart), [
        "chart.plotBorderWidth",
        "chart.plotBorderColor",
        "chart.plotBackgroundColor",
        "chart.plotShadow"
    ])

    return <PropertyGrid props={props} />
}