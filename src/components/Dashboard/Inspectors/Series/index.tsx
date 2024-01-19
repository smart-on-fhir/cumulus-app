import {
    DataLabelsOptions,
    Options,
    SeriesAreaOptions,
    SeriesArearangeOptions,
    SeriesAreasplineOptions,
    SeriesAreasplinerangeOptions,
    SeriesBarOptions,
    SeriesColumnOptions,
    SeriesColumnrangeOptions,
    SeriesErrorbarOptions,
    SeriesLineOptions,
    SeriesSplineOptions,
    SeriesOptionsType,
    SeriesPieOptions
} from "highcharts"
import { getColorForSeries, getIndexOfSeriesId, getSeriesById, getSeriesUpdater } from "../lib"
import Collapse from "../../../generic/Collapse"
import PropertyGrid from "../../../generic/PropertyGrid"
import { Tabs } from "../../../generic/Tabs"
import { DEFS } from "../../Schema"
import { getOptions as getLineOptions      } from "./Line"
import { getOptions as getSplineOptions    } from "./Spline"
import { getOptions as getAreaOptions      } from "./Area"
import { getOptions as getColumnOptions    } from "./Column"
import { getOptions as getPieOptions       } from "./Pie"
import { getOptions as getAreaRangeOptions } from "./AreaRange"
import { getOptions as getErrorBarOptions  } from "./ErrorBar"
import { getOptions as getDataLabelsOptions} from "../DataLabels"


type SupportedSeriesOptions =
    SeriesAreaOptions |
    SeriesArearangeOptions |
    SeriesAreasplineOptions |
    SeriesAreasplinerangeOptions |
    SeriesBarOptions |
    SeriesColumnOptions |
    SeriesColumnrangeOptions |
    SeriesErrorbarOptions |
    SeriesLineOptions |
    SeriesSplineOptions |
    SeriesPieOptions;


export function getOptions(options : Options, onChange: (o: Partial<Options>) => void, seriesId: string) {

    const series         = getSeriesById(options, seriesId) as SupportedSeriesOptions
    const seriesIndex    = getIndexOfSeriesId(options, seriesId)
    const onSeriesChange = getSeriesUpdater<SeriesOptionsType>(options, onChange, seriesId)
    const color          = getColorForSeries(options, seriesId)
    const seriesType     = series.type ?? options.chart?.type

    const props = [
        {
            name: "Visible",
            type: "boolean",
            description: "Set the initial visibility of the series.",
            value: series.visible !== false,
            onChange: (visible: boolean) => onSeriesChange({ visible })
        },
        {
            name: "Name",
            type: "string",
            value: series.name,
            onChange: (name: string) => onSeriesChange({ name })
        },
        {
            name: "Index",
            description: "The index of the series in the chart, affecting the internal index in the chart.series array, the visible Z index as well as the order in the legend.",
            type: "number",
            value: series.index,
            onChange: (index?: number) => onSeriesChange({ index })
        },
        // {
        //     ...DEFS.seriesType,
        //     value: seriesType,
        //     onChange: (type: any) => onSeriesChange({ type })
        // },
        {
            ...DEFS.opacity,
            value: series.opacity ?? 1,
            onChange: (opacity: number) => onSeriesChange({ opacity })
        },
        {
            name : "Z Index",
            type : "number",
            value: series.zIndex ?? 0,
            onChange: (zIndex: number) => onSeriesChange({ zIndex })
        }
    ] as any[]

    if (seriesType !== "pie") {
        props.unshift({
            name: "Color",
            type: "color",
            value: color,
            onChange: (color: string) => {
                const colors = [...options.colors!]
                colors[seriesIndex % colors.length] = color
                onChange({ colors })
            }
        })
    }

    if (options.series!.length > 1) {
        props.push({
            name : "Show in Legend",
            type : "boolean",
            value: series.showInLegend !== false,
            onChange: (showInLegend: boolean) => onSeriesChange({ showInLegend })
        })
    }

    if (seriesType === "line") {
        props.push(...getLineOptions(options, onChange, seriesId))
    }
    else if (seriesType === "spline") {
        props.push(...getSplineOptions(options, onChange, seriesId))
    }
    else if (seriesType === "areaspline" || seriesType === "area") {
        props.push(...getAreaOptions(options, onChange, seriesId))
    }
    else if (seriesType === "column" || seriesType === "bar") {
        props.push(...getColumnOptions(options, onChange, seriesId))
    }
    else if (seriesType === "pie") {
        props.push(...getPieOptions(options, onChange, seriesId))
    }
    else if (seriesType === "areasplinerange" || seriesType === "arearange") {
        props.push(...getAreaRangeOptions(options, onChange, seriesId))
    }
    else if (seriesType === "errorbar") {
        props.push(...getErrorBarOptions(options, onChange, seriesId))
    }

    if (seriesType !== "pie") {
        props.push({
            name: "Data Labels",
            type: "group",
            value: getDataLabelsOptions(
                {
                    ...options.plotOptions?.series?.dataLabels,
                    ...series.dataLabels
                } as DataLabelsOptions,
                dataLabels => onSeriesChange({ dataLabels: dataLabels as any })
            )
        })
    }

    return props
}

export default function Series({
    options,
    onChange,
    seriesId
}: {
    options : Options
    onChange: (o: Partial<Options>) => void
    seriesId: string
}) {
    const children = [
        {
            name: <><i className="fa-solid fa-crosshairs"/> Selected Series</>,
            children: <PropertyGrid props={getOptions(options, onChange, seriesId)} />
        }
    ];
    
    if ((options.series?.length ?? 0) > 1) {
        children.push({
            name: <><i className="fa-solid fa-layer-group" /> All Series</>,
            children: <AllSeries options={options} onChange={onChange} seriesId={seriesId} />
        })
    }
    
    return <Tabs children={children} />
}

export function AllSeries({
    options,
    onChange,
    seriesId
}: {
    options : Options
    onChange: (o: Partial<Options>) => void
    seriesId?: string
}) {
    return (
        <div className="all-series">
            { options.series?.map((s: any, i) => {
                const color = getColorForSeries(options, s.id)
                return <Collapse key={i} collapsed className={seriesId === s.id ? "selected" : ""} header={
                    <>
                         <b style={{
                             background: s.visible !== false ? color : "#DDD",
                             width     : "15px",
                             height    : "15px",
                             display   : "inline-block",
                             boxShadow : s.visible !== false ? "#666 0 0 0 1px inset, #FFF8 0 0 0px 2px inset" : "#CCC 0 0 0 1px inset",
                             borderRadius: "2px",
                             margin      : "0 2px 0 0"
                         }}/>
                        <span
                            className={ "ellipsis" + (seriesId === s.id ? " selected" : "") }
                            style={{ color: s.visible !== false ? "#414e5c" : "#999" }}
                        >{ String(s.name ?? "") || "Series " + (i + 1)}</span>
                    </>
                }>
                    <PropertyGrid props={getOptions(options, onChange, s.id)} />
                </Collapse>
            })}
        </div>
    )
}