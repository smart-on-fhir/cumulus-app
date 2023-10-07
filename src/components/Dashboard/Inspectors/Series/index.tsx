import { Options, SeriesOptionsType } from "highcharts"
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


export function getOptions(options : Options, onChange: (o: Partial<Options>) => void, seriesId: string) {
    
    const series         = getSeriesById(options, seriesId) as SeriesOptionsType
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
            ...DEFS.seriesType,
            value: seriesType,
            onChange: (type: any) => onSeriesChange({ type })
        },
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
                options.colors![seriesIndex % options.colors!.length] = color
                onChange(options)
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
                return <Collapse key={i} collapsed header={
                    <div style={{
                        background: seriesId === s.id ? "linear-gradient(90deg, #06C1, #06C2)" : "none",
                        boxShadow : seriesId === s.id ? "0 0 0 1px #06C2 inset" : "none",
                        display   : "inline-flex",
                        alignItems: "center",
                        flex      : 1,
                        margin    : "-2px 0 -2px 2px",
                        padding   : "2px 0",
                        borderRadius: 3
                    }}>
                         <b style={{
                             background: s.visible !== false ? color : "#DDD",
                             width     : "1em",
                             height    : "1em",
                             flex      : "0 0 1em",
                             display   : "inline-block",
                             boxShadow : s.visible !== false ? "#666 0 0 0 1px inset, #FFF8 0 0 0px 2px inset" : "#CCC 0 0 0 1px inset",
                             borderRadius: "2px",
                             margin      : "0 4px 0 3px"
                         }}/>
                         <div style={{ color: s.visible !== false ? "#414e5c" : "#999", overflow: "hidden", flex: "1 1 100%" }}> 
                            <div style={{
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                maxWidth: "100%"
                            }}>{ String(s.name ?? "") || "Series " + (i + 1)}</div>
                         </div>
                    </div>
                }>
                    <PropertyGrid props={getOptions(options, onChange, s.id)} />
                </Collapse>
            })}
        </div>
    )
}