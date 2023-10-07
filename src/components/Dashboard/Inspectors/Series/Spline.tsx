import { DashStyleValue, Options, SeriesSplineOptions } from "highcharts"
import PropertyGrid from "../../../generic/PropertyGrid"
import { getSeriesById, getSeriesPlotOptionsById, getSeriesUpdater } from "../lib"
import { DEFS } from "../../Schema"


export function getOptions(options: Options, onChange: (o: Partial<Options>) => void, seriesId: string) {    
    const series            = getSeriesById(options, seriesId) as SeriesSplineOptions
    const seriesTypeOptions = getSeriesPlotOptionsById(options, seriesId) as typeof series
    const onSeriesChange    = getSeriesUpdater<SeriesSplineOptions>(options, onChange, seriesId)

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

    return [
        {
            ...DEFS.lineWidth,
            value: series.lineWidth ?? seriesTypeOptions.lineWidth ?? 1.5,
            onChange: (lineWidth: number) => onSeriesChange({ lineWidth })
        },
        {
            ...DEFS.dashStyle,
            value: series.dashStyle ?? seriesTypeOptions.dashStyle ?? "Solid",
            onChange: (dashStyle: DashStyleValue) => onSeriesChange({ dashStyle })
        },
        // This should not happen in a powerSet data
        // {
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
                    onSeriesChange({ marker: { enabled: false, states: { hover: { enabled: false }}}})
                } else if (x === "hover") {
                    onSeriesChange({ marker: { enabled: false, states: { hover: { enabled: true  }}}})
                } else {
                    onSeriesChange({ marker: { enabled: true , states: { hover: { enabled: true  }}}})
                }
            }
        },
        {
            name    : "Shadow",
            type    : "shadow",
            value   : (series.shadow ?? seriesTypeOptions.shadow) || false,
            // open    : true,
            onChange: (shadow: any) => onSeriesChange({ shadow })
        }
    ]
}

export default function Spline({
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