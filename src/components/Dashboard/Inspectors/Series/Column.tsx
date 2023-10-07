import { DashStyleValue, Options, SeriesBarOptions, SeriesColumnOptions } from "highcharts"
import PropertyGrid from "../../../generic/PropertyGrid"
import { getSeriesById, getSeriesPlotOptionsById, getSeriesPlotOptionsUpdater, getSeriesUpdater } from "../lib"
import { DEFS } from "../../Schema"


export function getOptions(options: Options, onChange: (o: Partial<Options>) => void, seriesId: string) {
    
    const seriesOptions      = getSeriesById(options, seriesId) as SeriesColumnOptions | SeriesBarOptions
    const seriesTypeOptions  = getSeriesPlotOptionsById(options, seriesId) as typeof seriesOptions
    const onSeriesChange     = getSeriesUpdater<SeriesColumnOptions | SeriesBarOptions>(options, onChange, seriesId)
    const onSeriesTypeChange = getSeriesPlotOptionsUpdater<SeriesColumnOptions | SeriesBarOptions>(options, onChange, seriesId)

    const is3d = !!options.chart?.options3d?.enabled

    const out: any[] = [
        {
            ...DEFS.borderWidth,
            value   : seriesOptions.borderWidth ?? seriesTypeOptions.borderWidth,
            onChange: (borderWidth?: number) => onSeriesChange({ borderWidth, edgeWidth: borderWidth })
        },
        {
            name    : "Border Color",
            type    : "color",
            value   : seriesOptions.borderColor ?? seriesTypeOptions.borderColor,
            onChange: (borderColor: string) => onSeriesChange({ borderColor, edgeColor: borderColor })
        },
        {
            ...DEFS.borderRadius,
            value   : seriesOptions.borderRadius ?? seriesTypeOptions.borderRadius ?? 0,
            onChange: (borderRadius: number) => onSeriesChange({ borderRadius })
        },
        {
            name    : "Width",
            type    : "number",
            min     : 0,
            value   : seriesOptions.pointWidth,
            onChange: (pointWidth?: number) => onSeriesChange({ pointWidth })
        },
        {
            ...DEFS.dashStyle,
            value   : seriesOptions.dashStyle,
            onChange: (dashStyle?: DashStyleValue) => onSeriesChange({ dashStyle })
        }
    ];

    if (is3d) {
        out.push({
            name       : "Depth (3D)",
            value      : seriesOptions.depth ?? seriesTypeOptions.depth ?? 25,
            type       : "number",
            min        : 0,
            description: "Depth of the columns in a 3D column chart.",
            onChange   : (depth?: number) => onSeriesChange({ depth })
        })
    }

    out.push({
        name: "Shadow",
        type: "shadow",
        value: (seriesOptions.shadow ?? seriesTypeOptions.shadow) || false,
        onChange: (shadow: any) => onSeriesChange({ shadow })
    })
    
    out.push({
        name: "All Bars or Columns",
        type: "group",
        // open: true,
        value: [
            {
                name    : "Point Padding",
                type    : "number",
                min     : 0,
                max     : 1,
                step    : 0.01,
                value   : seriesTypeOptions.pointPadding ?? 0.02,
                onChange: (pointPadding?: number) => onSeriesTypeChange({ pointPadding })
            },
            {
                name    : "Group Padding",
                type    : "number",
                min     : 0,
                max     : 1,
                step    : 0.01,
                value   : seriesTypeOptions.groupPadding ?? 0.2,
                onChange: (groupPadding?: number) => onSeriesTypeChange({ groupPadding })
            },
            {
                name : "Width",
                type : "number",
                min  : 0,
                value: seriesTypeOptions.pointWidth,
                onChange: (pointWidth: number) => onSeriesTypeChange({ pointWidth })
            },
            {
                name: "Center",
                type: "boolean",
                value: !!seriesTypeOptions.centerInCategory,
                onChange: (centerInCategory: boolean) => onSeriesTypeChange({ centerInCategory }),
                description: "In case of stratified data center multiple columns on the same axis and allow them to overlap each other."
            },
            {
                name: "Crisp",
                type: "boolean",
                value: !!seriesTypeOptions.crisp,
                onChange: (crisp: boolean) => onSeriesTypeChange({ crisp })
            },
            {
                name: "Grouping",
                type: "boolean",
                value: !!seriesTypeOptions.grouping,
                onChange: (grouping: boolean) => onSeriesTypeChange({ grouping }),
                description: "Whether to group non-stacked columns or to let them render independent of each other. Non-grouped columns will be laid out individually and overlap each other."
            }
        ]
    })

    return out
}

export default function Column({
    options,
    onChange,
    seriesId
}: {
    options : Options
    onChange: (o: Partial<Options>) => void
    seriesId: string
}) {
    return <PropertyGrid props={getOptions(options, onChange, seriesId)} />
}