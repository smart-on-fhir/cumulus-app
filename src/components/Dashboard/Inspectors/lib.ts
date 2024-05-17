import { merge, Options, SeriesOptions } from "highcharts";

export function getIndexOfSeriesId(options: Options, seriesId: string) {
    return options.series?.findIndex(s => s.id === seriesId) ?? -1
}

export function getSeriesById(options: Options, seriesId: string) {
    const index = getIndexOfSeriesId(options, seriesId)
    return options.series![index]
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
    const series = options.series![index]
    
    const color = (
        // @ts-ignore
        series.color?.pattern?.color || series.color?.stops?.[0]?.[1] ||
        series.color ||
        // @ts-ignore
        series.colors?.[index % series.colors!.length] ||
        options.colors?.[index % options.colors!.length] ||
        "#888888"
    );
    return color
}