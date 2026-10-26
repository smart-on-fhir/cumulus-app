import { merge, Options, SeriesOptions, SeriesOptionsType } from "highcharts";

export function getIndexOfSeriesId(options: Options, seriesId: string) {
    return options.series?.findIndex(s => s.id === seriesId) ?? -1
}

export function getSeriesById(options: Options, seriesId: string) {
    const index = getIndexOfSeriesId(options, seriesId)
    // Not UnknownSeriesOptions, which has no type or color
    return options.series![index] as SeriesOptionsType
}

export function getSeriesPlotOptionsById(options: Options, seriesId: string) {
    const series = getSeriesById(options, seriesId);
    const seriesType = series.type ?? options.chart?.type ?? "spline"
    return options.plotOptions?.[seriesType] || {}
}

export function getSeriesUpdater<T extends SeriesOptions>(options: Options, onChange: (o: Partial<Options>) => void, seriesId: string) {
    return (patch: Partial<T>) => {
        const index = getIndexOfSeriesId(options, seriesId)
        options.series![index] = merge(options.series![index], patch)
        onChange(options)
    }
}

export function getSeriesPlotOptionsUpdater<T extends SeriesOptions>(options: Options, onChange: (o: Partial<Options>) => void, seriesId: string) {
    return (patch: Partial<T>) => {
        const series = getSeriesById(options, seriesId);
        const seriesType = series.type ?? options.chart?.type ?? "spline"
        onChange(merge(options, { plotOptions: { [seriesType]: patch }}))
    }
}

export function getColorForSeries(options: Options, seriesId: string) {
    const index = getIndexOfSeriesId(options, seriesId)
    const series = getSeriesById(options, seriesId) as any

    const color = (
        series.color?.pattern?.color || series.color?.stops?.[0]?.[1] ||
        series.color ||
        series.colors?.[index % series.colors!.length] ||
        options.colors?.[index % options.colors!.length] ||
        "#888888"
    );
    return color
}