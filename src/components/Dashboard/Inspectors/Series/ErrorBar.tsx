import { DashStyleValue, Options, SeriesErrorbarOptions } from "highcharts"
import PropertyGrid from "../../../generic/PropertyGrid"
import { getSeriesById, getSeriesPlotOptionsById, getSeriesUpdater } from "../lib"
import { DEFS } from "../../Schema"

export function getOptions(options: Options, onChange: (o: Partial<Options>) => void, seriesId: string) {
    const series            = getSeriesById(options, seriesId) as SeriesErrorbarOptions
    const seriesTypeOptions = getSeriesPlotOptionsById(options, seriesId) as typeof series
    const onSeriesChange    = getSeriesUpdater<SeriesErrorbarOptions>(options, onChange, seriesId)

    return [
        {
            ...DEFS.lineWidth,
            value: series.lineWidth ?? seriesTypeOptions.lineWidth ?? 1.5,
            onChange: (lineWidth: number) => onSeriesChange({ lineWidth })
        },
        {
            name : "Whisker Length",
            type : "length",
            description: "The length of the whiskers, the horizontal lines marking low and high values. " +
                "It can be a numerical pixel value, or a percentage value of the box width. Set 0 to disable whiskers.",
            min  : 0,
            max  : 100,
            units: ["px", "%"],
            value: series.whiskerLength ?? seriesTypeOptions.whiskerLength ?? "80%",
            onChange: (whiskerLength: string) => {
                onSeriesChange({ whiskerLength: whiskerLength.endsWith("px") ? parseFloat(whiskerLength) : whiskerLength ?? "80%" })
            }
        },
        {
            name : "Whisker Width",
            type : "number",
            description: "The line width of the whiskers, the horizontal lines marking low and high values.",
            min: 0,
            max: 20,
            step: 0.1,
            value: series.whiskerWidth ?? seriesTypeOptions.whiskerWidth ?? 2,
            onChange: (whiskerWidth: number) => onSeriesChange({ whiskerWidth })
        },
        {
            ...DEFS.dashStyle,
            name: "Whisker Dash Style",
            value: series.whiskerDashStyle ?? seriesTypeOptions.whiskerDashStyle ?? "Solid",
            onChange: (whiskerDashStyle: DashStyleValue) => onSeriesChange({ whiskerDashStyle })
        },
        {
            ...DEFS.dashStyle,
            name: "Stem Dash Style",
            value: series.stemDashStyle ?? seriesTypeOptions.stemDashStyle ?? "Dash",
            onChange: (stemDashStyle: DashStyleValue) => onSeriesChange({ stemDashStyle })
        }
    ]
}

export default function ErrorBar({
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
