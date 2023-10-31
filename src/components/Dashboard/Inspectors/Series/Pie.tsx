import { DashStyleValue, Options, SeriesPieOptions } from "highcharts"
import PropertyGrid from "../../../generic/PropertyGrid"
import { DASH_STYLES } from "../../config"
import { getSeriesById, getSeriesPlotOptionsById, getSeriesUpdater } from "../lib"


export function getOptions(options : Options, onChange: (o: Partial<Options>) => void, seriesId: string) {
    
    const series             = getSeriesById(options, seriesId) as SeriesPieOptions
    const seriesTypeOptions  = getSeriesPlotOptionsById(options, seriesId) as typeof series
    const onSeriesChange     = getSeriesUpdater<SeriesPieOptions>(options, onChange, seriesId)
    
    const is3d = !!options.chart?.options3d?.enabled

    const props: any[] = [];

    const slices: any[] = series.data?.map((s:any, i) => ({
        name: s.name + "",
        type: "color",
        value: options.colors![i % options.colors!.length],
        onChange: (color?: string) => {
            if (color) {
                options.colors![i % options.colors!.length] = color
                onChange({ colors: options.colors! })
            }
        }
    })) || [];


    if (is3d) {
        props.push(
            {
                name    : "Edge Width",
                type    : "number",
                min     : 0,
                step    : 0.1,
                // @ts-ignore
                value   : series.edgeWidth ?? seriesTypeOptions.edgeWidth ?? 1,
                // @ts-ignore
                onChange: (edgeWidth: number) => onSeriesChange({ edgeWidth })
            },
            {
                name    : "Edge Color",
                type    : "color",
                // @ts-ignore
                value   : series.edgeColor ?? seriesTypeOptions.edgeColor ?? "#00000088",
                // @ts-ignore
                onChange: (edgeColor: string) => onSeriesChange({ edgeColor }),
            },
            {
                name    : "Depth",
                type    : "number",
                min     : 0,
                description: "The thickness of a 3D pie.",
                value   : series.depth ?? seriesTypeOptions.depth ?? 50,
                onChange: (depth: number) => onSeriesChange({ depth })
            }
        )
    } else {
        props.push(
            {
                name    : "Border Width",
                type    : "number",
                min     : 0,
                step    : 0.1,
                value   : series.borderWidth ?? 0.5,
                onChange: (borderWidth: number) => onSeriesChange({ borderWidth })
            },
            {
                name    : "Border Color",
                type    : "color",
                value   : series.borderColor ?? "#00000088",
                onChange: (borderColor: string) => onSeriesChange({ borderColor })
            }
        )
    }
    
    props.push(
        {
            name    : "Dash Style",
            type    : "options",
            options : DASH_STYLES,
            // @ts-ignore
            value   : series.dashStyle ?? seriesTypeOptions.dashStyle ?? "Solid",
            // @ts-ignore
            onChange: (dashStyle: DashStyleValue) => onSeriesChange({ dashStyle })
        },
        {
            name : "Size",
            type : "length",
            units: ["%", "px"],
            value: series.size ?? seriesTypeOptions.size ?? undefined,
            min  : 0,
            max  : 100,
            onChange: (size: string) => onSeriesChange({ size })
        },
        {
            name : "Inner Size",
            type : "length",
            units: ["%", "px"],
            value: series.innerSize ?? seriesTypeOptions.innerSize ?? "0%",
            min  : 0,
            max  : 100,
            onChange: (innerSize: string) => onSeriesChange({ innerSize })
        },
        {
            name: "Center X",
            type: "length",
            units: ["%", "px"],
            value: series.center?.[0] ?? seriesTypeOptions.center?.[0] ?? "50%",
            onChange: (x?: string) => onSeriesChange({ center: [x || null, series.center?.[1] ?? null] })
        },
        {
            name: "Center Y",
            type: "length",
            units: ["%", "px"],
            value: series.center?.[1] ?? seriesTypeOptions.center?.[1] ?? "50%",
            onChange: (y?: string) => onSeriesChange({ center: [series.center?.[0] ?? null, y || null] })
        },
        {
            name    : "Start Angle",
            type    : "number",
            min     : -360,
            max     : 360,
            value   : series.startAngle ?? seriesTypeOptions.startAngle ?? 0,
            onChange: (startAngle: number) => onSeriesChange({ startAngle })
        },
        {
            name    : "End Angle",
            type    : "number",
            min     : -360,
            max     : 360,
            value   : series.endAngle ?? seriesTypeOptions.endAngle ?? 360,
            onChange: (endAngle: number) => onSeriesChange({ endAngle })
        },
        {
            name: "Selected Slice Offset",
            type: "number",
            min: 0,
            max: 50,
            step: 1,
            value: series.slicedOffset ?? seriesTypeOptions.slicedOffset ?? 30,
            onChange: (slicedOffset: number) => onSeriesChange({ slicedOffset })
        },
        // {
        //     name: "borderRadius",
        //     type: "number",
        //     // @ts-ignore
        //     value: series.borderRadius,
        //     // @ts-ignore
        //     onChange: (borderRadius: number) => onSeriesChange({ borderRadius })
        // }
    )

    return [
        {
            name: "Pie Options",
            type: "group",
            open : true,
            value: props
        },
        {
            name: "Slice Colors",
            type: "group",
            open : true,
            value: slices
        }
    ] as any[]
}

export default function Pie({
    options = {} as Options,
    onChange,
    seriesId
}: {
    options?: Options
    onChange: (o: Partial<Options>) => void
    seriesId: string
}) {
    return <PropertyGrid props={getOptions(options, onChange, seriesId)} />
}