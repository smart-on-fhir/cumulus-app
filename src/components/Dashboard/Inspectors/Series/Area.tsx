import { DashStyleValue, merge, Options, OptionsStepValue, SeriesAreaOptions, SeriesAreasplineOptions } from "highcharts"
import { getSeriesById, getSeriesPlotOptionsById, getSeriesUpdater } from "../lib"
import PropertyGrid from "../../../generic/PropertyGrid"
import { DASH_STYLES } from "../../config"
import { DEFS } from "../../Schema"

export function getOptions(options: Options, onChange: (o: Partial<Options>) => void, seriesId: string) {
    const series            = getSeriesById(options, seriesId) as SeriesAreasplineOptions | SeriesAreaOptions
    const seriesTypeOptions = getSeriesPlotOptionsById(options, seriesId) as typeof series
    const onSeriesChange    = getSeriesUpdater<SeriesAreasplineOptions | SeriesAreaOptions>(options, onChange, seriesId)

    function getMarkerVisibility() {
        if (series.marker?.enabled === false) {
            return series.marker.states?.hover?.enabled === false ? "hide" : "hover"
        }
        if (series.marker?.enabled === true) {
            return "show"
        }
        if (seriesTypeOptions.marker?.enabled === false) {
            return seriesTypeOptions.marker.states?.hover?.enabled === false ? "hide" : "hover"
        }
        if (seriesTypeOptions.marker?.enabled === true) {
            return "show"
        }
    }

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
            options: DASH_STYLES,
            value: series.dashStyle ?? seriesTypeOptions.dashStyle ?? "Solid",
            onChange: (dashStyle: DashStyleValue) => onSeriesChange({ dashStyle })
        },
        // { // Should not happen wit powerSets
        //     name: "Connect Nulls",
        //     type: "boolean",
        //     value: !!(series.connectNulls ?? seriesTypeOptions.connectNulls),
        //     onChange: (connectNulls: boolean) => onSeriesChange({ connectNulls }),
        //     description: "Whether to connect a graph line across null points, or render a gap between the two points on either side of the null."
        // },
        {
            name: "Markers",
            type: "options",
            options: [
                { value: "hover", label: "Show on hover" },
                { value: "show" , label: "Show" },
                { value: "hide" , label: "Hide" }
            ],
            value: getMarkerVisibility(),
            onChange: (x: string) => {
                if (x === "hide") {
                    onSeriesChange({ marker: merge(series.marker, { enabled: false, states: { hover: { enabled: false }}})})
                } else if (x === "hover") {
                    onSeriesChange({ marker: merge(series.marker, { enabled: false, states: { hover: { enabled: true  }}})})
                } else {
                    onSeriesChange({ marker: merge(series.marker, { enabled: true , states: { hover: { enabled: true  }}})})
                }
            }
        }
    ]

    if (series.type === "area") {
        out.push({
            name: "Step",
            type: "options",
            options: [
                { label: "none"  , value: ""       },
                { label: "left"  , value: "left"   },
                { label: "center", value: "center" },
                { label: "right" , value: "right"  }
            ],
            value: series.step ?? (seriesTypeOptions as SeriesAreaOptions).step,
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

export default function Area({
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