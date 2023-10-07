import { DashStyleValue, Options, OptionsStepValue, SeriesArearangeOptions, SeriesAreasplinerangeOptions } from "highcharts"
import PropertyGrid from "../../../generic/PropertyGrid"
import { getSeriesById, getSeriesPlotOptionsById, getSeriesUpdater } from "../lib"
import { DEFS } from "../../Schema"

type T = SeriesArearangeOptions | SeriesAreasplinerangeOptions

export function getOptions(options: Options, onChange: (o: Partial<Options>) => void, seriesId: string) {
    
    const series            = getSeriesById(options, seriesId) as T
    const seriesTypeOptions = getSeriesPlotOptionsById(options, seriesId) as typeof series
    const onSeriesChange    = getSeriesUpdater<T>(options, onChange, seriesId)

    const out: any[] = [
        {
            ...DEFS.lineWidth,
            value: series.lineWidth ?? seriesTypeOptions.lineWidth ?? 1,
            onChange: (lineWidth: number) => onSeriesChange({ lineWidth })
        },
        {
            name: "Line Color",
            type: "color",
            value: series.lineColor ?? seriesTypeOptions.lineColor,
            onChange: (lineColor?: string) => onSeriesChange({ lineColor })
        },
        {
            ...DEFS.opacity,
            name: "Fill Opacity",
            value: series.fillOpacity ?? seriesTypeOptions.fillOpacity ?? 0.75,
            onChange: (fillOpacity: number) => onSeriesChange({ fillOpacity })
        },
        {
            ...DEFS.dashStyle,
            value: series.dashStyle ?? seriesTypeOptions.dashStyle ?? "Solid",
            onChange: (dashStyle: DashStyleValue) => onSeriesChange({ dashStyle })
        },
        // { // Should not happen in a powerSet data
        //     name: "Connect Nulls",
        //     type: "boolean",
        //     value: !!(series.connectNulls ?? seriesTypeOptions.connectNulls),
        //     onChange: (connectNulls: boolean) => onSeriesChange({ connectNulls }),
        //     description: "Whether to connect a graph line across null points, or render a gap between the two points on either side of the null."
        // }
    ]

    if (series.type === "arearange") {
        out.push({
            name: "Step",
            type: "options",
            options: [
                { label: "none"  , value: ""       },
                { label: "left"  , value: "left"   },
                { label: "center", value: "center" },
                { label: "right" , value: "right"  }
            ],
            value: series.step ?? (seriesTypeOptions as SeriesArearangeOptions).step,
            onChange: (step?: OptionsStepValue) => onSeriesChange({ step: step || undefined }),
            description: "Whether to apply steps to the line."
        })
    }

    out.push({
        name: "Shadow",
        type: "shadow",
        value: (series.shadow ?? seriesTypeOptions.shadow) || false,
        onChange: (shadow: any) => onSeriesChange({ shadow })
    })

    return out
}

export default function AreaRange({
    options = {} as Options,
    onChange,
    seriesId
}: {
    options: Options
    onChange: (o: Partial<Options>) => void
    seriesId: string
}) {
    return <PropertyGrid props={getOptions(options, onChange, seriesId)} />
}