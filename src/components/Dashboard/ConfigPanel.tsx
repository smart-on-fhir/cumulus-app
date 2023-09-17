import { useState }   from "react"
import Select         from "../generic/Select"
import ColumnSelector from "./ColumnSelector"
import FilterUI       from "./FilterUI"
import Collapse       from "../generic/Collapse"
import Checkbox       from "../generic/Checkbox"
import AnnotationsUI  from "./AnnotationsUI"
import TagSelector    from "../Tags/TagSelector"
import PropertyGrid   from "../generic/PropertyGrid"
import { app }        from "../../types"
import {
    AlignValue,
    AxisTitleAlignValue,
    DashStyleValue,
    merge,
    Options,
    OptionsLayoutValue,
    SeriesAreasplineOptions,
    SeriesAreasplinerangeOptions,
    SeriesColumnOptions,
    SeriesErrorbarOptions,
    SeriesOptionsType,
    SeriesPieOptions,
    SeriesSplineOptions,
    VerticalAlignValue,
    XAxisOptions,
    YAxisOptions
} from "highcharts"
import {
    SupportedChartTypes,
    ChartIcons,
    DEFAULT_COLORS
} from "./config"

type SupportedChartType = keyof typeof SupportedChartTypes

const DASH_STYLES: DashStyleValue[] = ['Solid', 'ShortDash', 'ShortDot', 'ShortDashDot',
'ShortDashDotDot', 'Dot', 'Dash', 'LongDash', 'DashDot',
'LongDashDot', 'LongDashDotDot'];

function SecondaryDataEditor({
    state,
    dataRequest,
    onChange
}: {
    state: ChartConfigPanelState
    dataRequest: app.DataRequest
    onChange: (state: ChartConfigPanelState) => void
}) {
    
    const { cols } = dataRequest.metadata || { cols: [] }

    return (
        <>
            <div className="pt-1">
                <label>Secondary Data</label>
                <ColumnSelector
                    addEmptyOption="start"
                    cols={ cols }
                    value={ state.column2 || null }
                    disabled={[ "cnt", state.stratifyBy, state.groupBy ].filter(Boolean)}
                    onChange={ (column2: string) => onChange({ ...state, column2 }) }
                />
                <p className="small color-muted">
                    Select another data column to render over the same X axis
                </p>
            </div>
            
            { !!state.column2 && <div className="pt-1">
                <label>Secondary Data Chart Type</label>
                <Select
                    value={ state.column2type }
                    onChange={ column2type => onChange({ ...state, column2type })}
                    options={[
                        {
                            value: "spline",
                            label: "Line",
                            icon: ChartIcons.spline
                        },
                        {
                            value: "areaspline",
                            label: "Area",
                            icon: ChartIcons.areaspline
                        },
                        {
                            value: "column",
                            label: "Columns",
                            icon: ChartIcons.column
                        },
                        {
                            value: "columnStack",
                            label: "Stacked Columns",
                            icon : ChartIcons.columnStack
                        }
                    ]}
                />
                <p className="small color-muted">
                    How should the secondary data be rendered
                </p>
            </div> }
        </>
    )
}

// ----------------------------------------------------------------------------

interface ChartConfigPanelState {
    groupBy        : string
    stratifyBy     : string
    sortBy         : string
    filters        : any[]
    chartType      : SupportedChartType
    viewName       : string
    viewDescription: string
    chartOptions   : Partial<Highcharts.Options>
    denominator    : string
    column2        : string
    column2type    : string
    annotations    : app.Annotation[]
    xCol           : app.DataRequestDataColumn
    tags           : Pick<app.Tag, "id"|"name"|"description">[]
    ranges         : app.RangeOptions | null
}

export default function ConfigPanel({
    dataRequest,
    state,
    onChange
} : {
    dataRequest: app.DataRequest
    view?: Partial<app.View>
    state: ChartConfigPanelState
    viewType: "overview" | "data"
    onChange: (state: ChartConfigPanelState) => void
}) {
    const { cols } = dataRequest.metadata || { cols: [] }

    const { chartOptions, chartType } = state;

    const isBar    = chartType.startsWith("bar")
    const isColumn = chartType.startsWith("column")
    const isPie    = chartType.startsWith("pie") || chartType.startsWith("donut")
    const isStack  = chartType.endsWith("Stack")
    const isBarOrColumn = isBar || isColumn

    const updateChartOptions = (patch: Partial<Options>) => {
        onChange({
            ...state,
            chartOptions: merge(state.chartOptions, patch)
        })
    };

    return (
        <div style={{
            color: "#666",
            padding: "0 0.5rem 0 0",
            width: 330,
            marginRight: "0.5rem"
        }}>

            <div className="mb-1">
                <label>Tags</label>
                <TagSelector selected={state.tags} onChange={tags => onChange({ ...state, tags })} />
            </div>

            <Collapse collapsed header="Chart">
                <div className="mt-1">
                    <label>Chart Type</label>
                    <Select
                        value={ state.chartType }
                        onChange={ chartType => onChange({ ...state, chartType })}
                        options={Object.keys(SupportedChartTypes).map((type, i) => ({
                            value: type,
                            label: SupportedChartTypes[type as SupportedChartType],
                            icon: ChartIcons[type as keyof typeof ChartIcons],
                            disabled: (type.includes("Stack") && !state.stratifyBy) || (
                                (type.includes("pie") || type.includes("donut")) && !!state.stratifyBy
                            )
                        }))}
                    />
                </div>
                <div className="mt-1">
                    <label>Chart Title</label>
                    <input
                        type="text"
                        value={ chartOptions.title?.text || "" }
                        onChange={ e => onChange(merge(state, {
                            chartOptions: {
                                title: {
                                    text: e.target.value
                                }
                            }
                        }))}
                    />
                    <br/>
                </div>
                { isBarOrColumn && state.stratifyBy && 
                    <div className="mt-1">
                        <label>
                            Group Padding
                            <input
                                type="range"
                                min={0}
                                max={0.5}
                                step={0.01}
                                value={
                                    isColumn ? 
                                        chartOptions.plotOptions?.column?.groupPadding === undefined ?
                                            0.2 :
                                            chartOptions.plotOptions.column.groupPadding :
                                        chartOptions.plotOptions?.bar?.groupPadding === undefined ?
                                            0.2 :
                                            chartOptions.plotOptions.bar.groupPadding
                                }
                                onChange={e => onChange(
                                    merge(state, {
                                        chartOptions: {
                                            plotOptions: {
                                                [isColumn ? "column" : "bar"]: {
                                                    groupPadding: e.target.valueAsNumber
                                                }
                                            }
                                        }
                                    })
                                )}
                                style={{ width: "100%", margin: 0 }}
                            />
                        </label>
                        <p className="small color-muted">Padding between each value groups</p>
                    </div>
                }
                { isBarOrColumn && !isStack &&
                    <div className="mt-1">
                        <label>
                            Point Padding
                            <input
                                type="range"
                                min={0}
                                max={0.5}
                                step={0.01}
                                value={
                                    isColumn ? 
                                        chartOptions.plotOptions?.column?.pointPadding === undefined ?
                                            0.02 :
                                            chartOptions.plotOptions.column.pointPadding :
                                        chartOptions.plotOptions?.bar?.pointPadding === undefined ?
                                            0.02 :
                                            chartOptions.plotOptions.bar.pointPadding
                                }
                                onChange={e => onChange(     
                                    merge(state, {
                                        chartOptions: {
                                            plotOptions: {
                                                [isColumn ? "column" : "bar"]: {
                                                    pointPadding: e.target.valueAsNumber
                                                }
                                            }
                                        }
                                    })
                                )}
                                style={{ width: "100%", margin: 0 }}
                            />
                        </label>
                        <p className="small color-muted">Padding between each column or bar</p>
                    </div>
                }
                { isPie && <div className="mt-1">
                    <label>
                        Start Angle
                        <input
                            type="range"
                            min={0}
                            max={360}
                            step={1}
                            value={ chartOptions.plotOptions?.pie?.startAngle || 0 }
                            onChange={e => onChange(     
                                merge(state, {
                                    chartOptions: {
                                        plotOptions: {
                                            pie: {
                                                startAngle: e.target.valueAsNumber
                                            }
                                        }
                                    }
                                })
                            )}
                            style={{ width: "100%", margin: 0 }}
                        />
                    </label>
                </div> }
                { isPie && <div className="mt-1">
                    <label>
                        Selected Slice Offset
                        <input
                            type="range"
                            min={0}
                            max={30}
                            step={1}
                            value={ chartOptions.plotOptions?.pie?.slicedOffset === undefined ? 30 : chartOptions.plotOptions.pie.slicedOffset }
                            onChange={e => onChange(
                                merge(state, {
                                    chartOptions: {
                                        plotOptions: {
                                            pie: {
                                                slicedOffset: e.target.valueAsNumber
                                            }
                                        }
                                    }
                                })
                            )}
                            style={{ width: "100%", margin: 0 }}
                        />
                    </label>
                </div> }
                <div className="mt-1 pb-1">
                    <Collapse collapsed header="Advanced">
                        <PropertyGrid props={[
                            {
                                name: "Background Color",
                                description: "The background color or gradient for the outer chart area.",
                                type: "color",
                                value: state.chartOptions.chart?.backgroundColor ?? "#FFFFFF",
                                onChange: backgroundColor => onChange(merge(state, {
                                    chartOptions: {
                                        chart: {
                                            backgroundColor
                                        }
                                    }
                                }))
                            },
                            // {
                            //     name: "Border Color",
                            //     description: "The color of the outer chart border.",
                            //     type: "color",
                            //     value: state.chartOptions.chart?.borderColor ?? "#334eff",
                            //     onChange: borderColor => onChange(merge(state, {
                            //         chartOptions: {
                            //             chart: {
                            //                 borderColor
                            //             }
                            //         }
                            //     }))
                            // },
                            // {
                            //     name: "Border Width",
                            //     description: "The pixel width of the outer chart border.",
                            //     type: "number",
                            //     value: state.chartOptions.chart?.borderWidth ?? 0,
                            //     min: 0,
                            //     onChange: borderWidth => onChange(merge(state, {
                            //         chartOptions: {
                            //             chart: {
                            //                 borderWidth
                            //             }
                            //         }
                            //     }))
                            // },
                            // {
                            //     name: "Border Radius",
                            //     description: "The corner radius of the outer chart border.",
                            //     type: "number",
                            //     value: state.chartOptions.chart?.borderRadius ?? 0,
                            //     min: 0,
                            //     onChange: borderRadius => onChange(merge(state, {
                            //         chartOptions: {
                            //             chart: {
                            //                 borderRadius
                            //             }
                            //         }
                            //     }))
                            // },
                            {
                                name: "Spacing Top",
                                description: "The space between the top edge of the chart and the content (plot area, axis title and labels, title, subtitle or legend in top position).",
                                type: "number",
                                value: state.chartOptions.chart?.spacingTop ?? 10,
                                onChange: spacingTop => onChange(merge(state, {
                                    chartOptions: {
                                        chart: {
                                            spacingTop
                                        }
                                    }
                                }))
                            },
                            {
                                name: "Spacing Right",
                                description: "The space between the right edge of the chart and the content (plot area, axis title and labels, title, subtitle or legend in top position).",
                                type: "number",
                                value: state.chartOptions.chart?.spacingRight ?? 10,
                                onChange: spacingRight => onChange(merge(state, {
                                    chartOptions: {
                                        chart: {
                                            spacingRight
                                        }
                                    }
                                }))
                            },
                            {
                                name: "Spacing Bottom",
                                description: "The space between the bottom edge of the chart and the content (plot area, axis title and labels, title, subtitle or legend in top position).",
                                type: "number",
                                value: state.chartOptions.chart?.spacingBottom ?? 15,
                                onChange: spacingBottom => onChange(merge(state, {
                                    chartOptions: {
                                        chart: {
                                            spacingBottom
                                        }
                                    }
                                }))
                            },
                            {
                                name: "Spacing Left",
                                description: "The space between the left edge of the chart and the content (plot area, axis title and labels, title, subtitle or legend in top position).",
                                type: "number",
                                value: state.chartOptions.chart?.spacingLeft ?? 10,
                                onChange: spacingLeft => onChange(merge(state, {
                                    chartOptions: {
                                        chart: {
                                            spacingLeft
                                        }
                                    }
                                }))
                            }
                        ]} />
                    </Collapse>
                </div>
                <br/>
            </Collapse>

            <Collapse collapsed header="Data">
                <div className="pt-1">
                    <label>{ isPie ? "Slices" : isBar ? "Y Axis" : "X Axis" }</label>
                    <ColumnSelector
                        cols={ cols.filter(c => c.name !== "cnt" && c.name !== "cnt_min" && c.name !== "cnt_max") }
                        value={ state.groupBy }
                        disabled={[ "cnt", state.stratifyBy, state.column2 ].filter(Boolean)}
                        onChange={ (groupBy: string) => onChange({ ...state, groupBy }) }
                    />
                    <p className="small color-muted"> {
                        isPie ?
                            "Select which data column provides the slices of the pie" :
                            `Select which data column to plot over the ${isBar ? "Y" : "X"} axis`
                    }</p>
                </div>
                { !isPie && <>
                    <div className="pt-1">
                        <label>Stratifier</label>
                        <ColumnSelector
                            cols={ cols }
                            placeholder="Select Column"
                            addEmptyOption="start"
                            value={ state.stratifyBy }
                            disabled={[
                                "cnt",
                                "cnt_min",
                                "cnt_max",
                                state.groupBy,
                                state.column2
                            ].filter(Boolean)}
                            onChange={ (stratifyBy: string) => onChange({
                                ...state,
                                stratifyBy,
                                denominator: state.denominator === "local" && !stratifyBy ? "" : state.denominator
                            }) }
                        />
                        <p className="small color-muted">
                            Stratify the data into multiple series based on the chosen column. For example,
                            this would produce multiple lines in a line chart.
                        </p>
                    </div>
                    <div className="pt-1">
                        <label>Denominator</label>
                        <Select
                            options={[
                                {
                                    label: <div>
                                        <div>None</div>
                                        <div className="small color-muted">
                                            Render the aggregate counts as found in the<br/>
                                            data source without further processing
                                        </div>
                                    </div>,
                                    value: "",
                                    icon: "fa-solid fa-percent grey-out"
                                },
                                {
                                    label: <div>
                                        <div>Stratified Count</div>
                                        <div className="small color-muted">
                                            Convert counts to percentage of the total<br />
                                            count of every given data group.<br />
                                            Not available with no stratifier.
                                        </div>
                                    </div>,
                                    value: "count",
                                    icon: "fa-solid fa-percent color-brand-2",
                                    disabled: !state.stratifyBy
                                },
                                {
                                    label: <div>
                                        <div>Stratified Sum</div>
                                        <div className="small color-muted">
                                            Convert counts to percentage of the sum<br />
                                            of values in every given data group.<br />
                                            Not available with no stratifier.
                                        </div>
                                    </div>,
                                    value: "local",
                                    icon: "fa-solid fa-percent color-brand-2",
                                    disabled: !state.stratifyBy
                                },
                                {
                                    label: <div>
                                        <div>Total Count</div>
                                        <div className="small color-muted">
                                            Convert counts to percentage of the total<br />
                                            count within the entire dataset
                                        </div>
                                    </div>,
                                    value: "global",
                                    icon: "fa-solid fa-percent color-blue"
                                }
                            ]}
                            value={ state.denominator }
                            onChange={ denominator => onChange({ ...state, denominator })}
                        />
                        <p className="small color-muted">
                            If set, renders the values as percentages of the given denominator
                        </p>
                    </div>
                    { state.ranges && <div className="pt-1">
                        <label>Confidence Intervals</label>
                        <Select value={ state.ranges?.type || "" } options={[
                            {
                                value: "",
                                icon : "fa-solid fa-plus-minus color-muted",
                                label: "None"
                            },
                            {
                                label: "Error Bars",
                                value: "errorbar",
                                icon : "fa-solid fa-plus-minus color-blue"
                            },
                            {
                                label: "Area",
                                value: "areasplinerange",
                                icon : "fa-solid fa-plus-minus color-blue"
                            },
                            {
                                label: "Bars / Columns",
                                value: "column",
                                icon : "fa-solid fa-plus-minus color-blue"
                            },
                        ]} onChange={type => onChange({ ...state, ranges: { type, enabled: !!type }})} />
                        <p className="small color-muted">
                            If information is available, add the error ranges to the chart
                        </p>
                    </div> }

                    <SecondaryDataEditor state={state} dataRequest={dataRequest} onChange={onChange} />
                </> }

                { isPie && <SliceEditor state={state} onChange={onChange} /> }
                <br />
            </Collapse>

            <Collapse collapsed header="Filters">
                <div className="pt-1 pb-1">
                    <FilterUI
                        onChange={filters => onChange({ ...state, filters })}
                        current={ state.filters }
                        cols={ cols }
                    />
                </div>
            </Collapse>

            { !isPie && <SeriesEditor state={state} onChange={onChange} /> }

            { !isPie && <Collapse collapsed header={ isBar ? "X Axis" : "Y Axis" }>
                <div className="mt-1">
                    <label>Axis Title</label>
                    <input
                        type="text"
                        // @ts-ignore
                        value={ chartOptions.yAxis?.title?.text || "" }
                        onChange={ e => onChange(merge(state, {
                            chartOptions: {
                                yAxis: {
                                    title: {
                                        text: e.target.value
                                    }
                                }
                            }
                        }))}
                    />
                </div>
                <div className="mt-1 pb-1">
                    <Checkbox
                        name="YTicks"
                        label="Render axis tick marks"
                        // @ts-ignore
                        checked={chartOptions.yAxis?.tickWidth !== 0}
                        onChange={checked => onChange(merge(state, {
                            chartOptions: {
                                yAxis: {
                                    tickWidth: checked ? 1 : 0
                                }
                            }
                        }))}
                    />
                    <Checkbox
                        name="YLabels"
                        label="Render labels"
                        // @ts-ignore
                        checked={chartOptions.yAxis?.labels?.enabled !== false}
                        onChange={checked => onChange(merge(state, {
                            chartOptions: {
                                yAxis: {
                                    labels: { enabled: checked }
                                }
                            }
                        }))}
                    />
                </div>
                <div className="pb-1">
                    <AdvancedAxisEditor
                        axis={ (state.chartOptions.yAxis || {}) as YAxisOptions }
                        onChange={yAxis => onChange({ ...state, chartOptions: merge(state.chartOptions, { yAxis })})}
                    />
                </div>
            </Collapse> }

            { !isPie && <Collapse collapsed header={ isBar ? "Y Axis" : "X Axis" }>
                <div className="mt-1">
                    <label>Axis Title</label>
                    <input
                        type="text"
                        placeholder={state.xCol.label || state.xCol.name || ""}
                        // @ts-ignore
                        value={ chartOptions.xAxis?.title?.text || "" }
                        onChange={ e => onChange(merge(state, {
                            chartOptions: {
                                xAxis: {
                                    title: {
                                        text: e.target.value
                                    }
                                }
                            }
                        }))}
                    />
                </div>
                <div className="mt-1 pb-1">
                    <Checkbox
                        name="XTicks"
                        label="Render axis tick marks"
                        // @ts-ignore
                        checked={ !!chartOptions.xAxis?.tickWidth }
                        onChange={checked => onChange(merge(state, {
                            chartOptions: {
                                xAxis: {
                                    tickWidth: checked ? 1 : 0
                                }
                            }
                        }))}
                    />
                    <Checkbox
                        name="XLabels"
                        label="Render labels"
                        // @ts-ignore
                        checked={chartOptions.xAxis?.labels?.enabled !== false}
                        onChange={checked => onChange(merge(state, {
                            chartOptions: {
                                xAxis: {
                                    labels: { enabled: checked }
                                }
                            }
                        }))}
                    />
                </div>
                <div className="pb-1">
                    <AdvancedAxisEditor
                        axis={ (state.chartOptions.xAxis || {}) as XAxisOptions }
                        onChange={xAxis => onChange({ ...state, chartOptions: merge(state.chartOptions, { xAxis })})}
                    />
                </div>
            </Collapse> }

            <Collapse collapsed header="Plot">
                <div className="pb-1">
                    <PropertyGrid props={[
                        {
                            name: "Border Width",
                            description: "The pixel width of the plot area border",
                            type: "number",
                            step: 1,
                            min: 0,
                            max: 100,
                            value: chartOptions.chart?.plotBorderWidth || 0,
                            onChange: (n?: number) => updateChartOptions({ chart: { plotBorderWidth: n || 0 }})
                        },
                        {
                            name: "Border Color",
                            type: "color",
                            value: chartOptions.chart?.plotBorderColor || "#334eff",
                            onChange: (c: string) => updateChartOptions({ chart: { plotBorderColor: c || "#334eff" }})
                        },
                        {
                            name: "Background Color",
                            type: "color",
                            value: chartOptions.chart?.plotBackgroundColor,
                            onChange: (c?: string) => updateChartOptions({ chart: { plotBackgroundColor: c }})
                        },
                        {
                            name: "Plot Shadow",
                            type: "shadow",
                            description: "Controls the drop shadow of the plot area",
                            value: (chartOptions?.chart?.plotShadow || false) as any,
                            onChange: (plotShadow: any) => updateChartOptions({ chart: { plotShadow }})
                        }
                    ]} />
                </div>
            </Collapse>

            <Collapse collapsed header="Legend">
                <div className="pb-1">
                    <PropertyGrid props={[
                        {
                            name: "Enabled",
                            type: "boolean",
                            value: chartOptions.legend?.enabled !== false,
                            onChange: (enabled: boolean) => updateChartOptions({ legend: { enabled }})
                        },
                        {
                            name: "X Align",
                            description: "The horizontal alignment of the legend box within the chart area. Valid values are left, center and right.\nIn the case that the legend is aligned in a corner position, the layout option will determine whether to place it above/below or on the side of the plot area.",
                            type: "options",
                            options: ["left", "center", "right"],
                            value: chartOptions.legend?.align || "center",
                            onChange: (align: AlignValue) => updateChartOptions({ legend: { align }})
                        },
                        {
                            name: "Y Align",
                            description: "The vertical alignment of the legend box. Can be one of top, middle or bottom. Vertical position can be further determined by the y option.\n\nIn the case that the legend is aligned in a corner position, the layout option will determine whether to place it above/below or on the side of the plot area.\n\nWhen the layout option is proximate, the verticalAlign option doesn't apply.",
                            type: "options",
                            options: ["top", "middle", "bottom"],
                            value: chartOptions.legend?.verticalAlign || "bottom",
                            onChange: (verticalAlign: VerticalAlignValue) => updateChartOptions({ legend: { verticalAlign }})
                        },
                        {
                            name: "X Offset",
                            type: "number",
                            value: chartOptions.legend?.x ?? 0,
                            description: "The x offset of the legend relative to its horizontal alignment align within chart.spacingLeft and chart.spacingRight. Negative x moves it to the left, positive x moves it to the right.",
                            onChange: (x?: number) => updateChartOptions({ legend: { x: x ?? 0 }})
                        },
                        {
                            name: "Y Offset",
                            type: "number",
                            value: chartOptions.legend?.y ?? 0,
                            description: "The vertical offset of the legend relative to it's vertical alignment verticalAlign within chart.spacingTop and chart.spacingBottom. Negative y moves it up, positive y moves it down.",
                            onChange: (y: number) => updateChartOptions({ legend: { y: y ?? 0 }})
                        },
                        {
                            name: "Layout",
                            description: "The layout of the legend items. Can be one of horizontal or vertical or proximate. When proximate, the legend items will be placed as close as possible to the graphs they're representing, except in inverted charts or when the legend position doesn't allow it.",
                            type: "options",
                            options: ["horizontal", "vertical"/*, "proximate"*/],
                            value: chartOptions.legend?.layout || "horizontal",
                            onChange: (layout: OptionsLayoutValue) => updateChartOptions({ legend: { layout }})
                        },
                        {
                            name: "Align Columns",
                            description: "If the layout is horizontal and the legend items span over two lines or more, whether to align the items into vertical columns. Setting this to false makes room for more items, but will look more messy.",
                            type: "boolean",
                            value: chartOptions.legend?.alignColumns ?? true,
                            onChange: (alignColumns: boolean) => updateChartOptions({ legend: { alignColumns }})
                        },
                        {
                            name: "Floating",
                            description: "When the legend is floating, the plot area ignores it and is allowed to be placed below it.",
                            type: "boolean",
                            value: chartOptions.legend?.floating ?? false,
                            onChange: (floating: boolean) => updateChartOptions({ legend: { floating }})
                        },
                        {
                            name: "Width",
                            type: "length",
                            value: chartOptions.legend?.width,
                            units: ["%", "px"],
                            onChange: (width: string) => updateChartOptions({ legend: { width: width || undefined }})
                        },
                        {
                            name: "Padding",
                            type: "number",
                            description: "The inner padding of the legend box.",
                            value: chartOptions.legend?.padding ?? 8,
                            onChange: (padding?: number) => updateChartOptions({ legend: { padding }})
                        },
                        {
                            name: "Max Height",
                            type: "number",
                            value: chartOptions.legend?.maxHeight,
                            description: "Maximum pixel height for the legend. When the maximum height is extended, navigation will show.",
                            onChange: (maxHeight?: number) => updateChartOptions({ legend: { maxHeight }})
                        },
                        {
                            name: "Background Color",
                            type: "color",
                            value: chartOptions.legend?.backgroundColor,
                            description: "The background color of the legend.",
                            onChange: (backgroundColor?: string) => updateChartOptions({ legend: { backgroundColor }})
                        },
                        {
                            name: "Border Width",
                            type: "number",
                            value: chartOptions.legend?.borderWidth,
                            onChange: (borderWidth: number) => updateChartOptions({ legend: { borderWidth }})
                        },
                        {
                            name: "Border Color",
                            type: "color",
                            value: chartOptions.legend?.borderColor ?? "#999999",
                            onChange: (borderColor?: string) => updateChartOptions({ legend: { borderColor: borderColor || "#999999" }})
                        },
                        {
                            name: "Border Radius",
                            type: "number",
                            value: chartOptions.legend?.borderRadius ?? 0,
                            onChange: (borderRadius?: number) => updateChartOptions({ legend: { borderRadius: borderRadius ?? 0 }})
                        },
                        {
                            name: "Drop Shadow",
                            type: "shadow",
                            value: chartOptions.legend?.shadow ?? false,
                            onChange: (shadow: any) => updateChartOptions({ legend: { shadow: shadow ?? false }})
                        },
                        {
                            name: "Items",
                            type: "group",
                            value: [
                                {
                                    name: "Distance",
                                    type: "number",
                                    value: chartOptions.legend?.itemDistance ?? 20,
                                    onChange: (itemDistance: number) => updateChartOptions({ legend: { itemDistance }})
                                },
                                {
                                    name: "Margin Top",
                                    type: "number",
                                    value: chartOptions.legend?.itemMarginTop ?? 2,
                                    onChange: (itemMarginTop: number) => updateChartOptions({ legend: { itemMarginTop }})
                                },
                                {
                                    name: "Margin Bottom",
                                    type: "number",
                                    value: chartOptions.legend?.itemMarginBottom ?? 2,
                                    onChange: (itemMarginBottom: number) => updateChartOptions({ legend: { itemMarginBottom }})
                                },
                                {
                                    name: "Format",
                                    type: "string",
                                    value: chartOptions.legend?.labelFormat ?? "{name}",
                                    description: "A format string for each legend label. Available variables relates to properties on the series, or the point in case of pies.",
                                    onChange: (labelFormat: string) => updateChartOptions({ legend: { labelFormat }})
                                },
                            ],
                        }
                    ]} />
                </div>
            </Collapse>

            { !isPie && <Collapse collapsed header="Annotations">
                <AnnotationsUI
                    onChange={ annotations => onChange(
                        {
                            ...state,
                            chartOptions: {
                                
                                annotations: [{
                                    visible: true,
                                    draggable: '',
                                    crop: false,
                                    labelOptions: {
                                        overflow: "justify",
                                        allowOverlap: true,
                                        className: "chart-annotation"
                                    },
                                    labels: annotations
                                }]
                            }
                        }
                    )}
                    current={ chartOptions.annotations?.[0]?.labels || [] }
                    xCol={ state.xCol }
                />
            </Collapse> }
            
            <br/>
        </div>
    )
}



function getColumnOptions(options: SeriesColumnOptions, onChange: (options: Partial<SeriesColumnOptions>) => void) {
    return [
        {
            name: "Border Width",
            type: "number",
            min: 0,
            max: 10,
            step: 0.1,
            value: options.borderWidth,
            onChange: (borderWidth?: number) => onChange({ borderWidth, edgeWidth: borderWidth })
        },
        {
            name: "Border Color",
            type: "color",
            value: options.borderColor,
            onChange: (borderColor: string) => onChange({ borderColor, edgeColor: borderColor })
        },
        {
            name : "Border Radius",
            type : "number",
            min: 0,
            max: 50,
            value: options.borderRadius ?? 0,
            onChange: (borderRadius: number) => onChange({ borderRadius })
        },
        {
            name: "Center",
            type: "boolean",
            value: !!options.centerInCategory,
            onChange: (centerInCategory: boolean) => onChange({ centerInCategory }),
            description: "In case of stratified data center multiple columns on the same axis and allow them to overlap each other."
        },
        {
            name : "Width",
            type : "number",
            min  : 0,
            value: options.pointWidth,
            onChange: (pointWidth: number) => onChange({ pointWidth })
        },
        {
            name: "Shadow",
            type: "shadow",
            value: options.shadow || false,
            onChange: (shadow: any) => onChange({ shadow })
        }
    ]
}

function getErrorbarOptions(options: SeriesErrorbarOptions, onChange: (options: Partial<SeriesErrorbarOptions>) => void) {
    return [
        {
            name: "Line Width",
            type: "number",
            min: 0,
            max: 50,
            step: 0.1,
            value: options.lineWidth ?? 1,
            onChange: (lineWidth: number) => onChange({ lineWidth })
        },
        {
            name : "Whisker Length",
            type : "length",
            description: "The length of the whiskers, the horizontal lines marking low and high values. " +
                "It can be a numerical pixel value, or a percentage value of the box width. Set 0 to disable whiskers.",
            min: 0,
            max: 100,
            units: ["px", "%"],
            value: options.whiskerLength ?? "80%",
            onChange: (whiskerLength: string) => {
                onChange({ whiskerLength: whiskerLength.endsWith("px") ? parseFloat(whiskerLength) : whiskerLength ?? "80%" })
            }
        },
        {
            name : "Whisker Width",
            type : "number",
            description: "The line width of the whiskers, the horizontal lines marking low and high values.",
            min: 0,
            max: 20,
            step: 0.1,
            value: options.whiskerWidth ?? 2,
            onChange: (whiskerWidth: number) => onChange({ whiskerWidth })
        },
        {
            name: "whisker Dash Style",
            type: "options",
            options: DASH_STYLES,
            value: options.whiskerDashStyle ?? "Solid",
            onChange: (whiskerDashStyle: DashStyleValue) => onChange({ whiskerDashStyle })
        },
        {
            name: "Stem Dash Style",
            type: "options",
            options: DASH_STYLES,
            value: options.stemDashStyle ?? "Dash",
            onChange: (stemDashStyle: DashStyleValue) => onChange({ stemDashStyle })
        }
    ]
}

function getAreaOptions(options: SeriesAreasplineOptions | SeriesAreasplinerangeOptions, onChange: (options: Partial<SeriesAreasplineOptions | SeriesAreasplinerangeOptions>) => void) {
    return [
        {
            name: "Line Width",
            type: "number",
            min: 0,
            max: 50,
            step: 0.1,
            value: options.lineWidth ?? 1,
            onChange: (lineWidth: number) => onChange({ lineWidth })
        },
        {
            name: "Fill Opacity",
            type: "number",
            min: 0,
            max: 1,
            step: 0.01,
            value: options.fillOpacity ?? 1,
            onChange: (fillOpacity: number) => onChange({ fillOpacity })
        },
        {
            name: "Dash Style",
            type: "options",
            options: DASH_STYLES,
            value: options.dashStyle ?? "Solid",
            onChange: (dashStyle: DashStyleValue) => onChange({ dashStyle })
        },
        {
            name: "Shadow",
            type: "shadow",
            value: options.shadow || false,
            onChange: (shadow: any) => onChange({ shadow })
        }
    ]
}

function getSplineOptions(options: SeriesSplineOptions, onChange: (options: Partial<SeriesSplineOptions>) => void) {
    return [
        {
            name : "Line Width",
            type : "number",
            value: options.lineWidth ?? 1.5,
            max  : 10,
            min  : 0,
            step : 0.1,
            onChange: (lineWidth: number) => onChange({ lineWidth })
        },
        {
            name: "Dash Style",
            type: "options",
            options: DASH_STYLES,
            value: options.dashStyle ?? "Solid",
            onChange: (dashStyle: DashStyleValue) => onChange({ dashStyle })
        },
        {
            name: "Shadow",
            type: "shadow",
            value: options.shadow || false,
            onChange: (shadow: any) => onChange({ shadow })
        }
    ]
}

function getPieOptions(options: any, onChange: (options: any) => void, has3d = false) {
    const props: any[] = [];

    if (has3d) {
        props.push(
            {
                name    : "Edge Width",
                type    : "number",
                min     : 0,
                step    : 0.1,
                value   : options.edgeWidth ?? 1,
                onChange: (edgeWidth: number) => onChange({ edgeWidth })
            },
            {
                name    : "Edge Color",
                type    : "color",
                value   : options.edgeColor ?? "#00000088",
                onChange: (edgeColor: string) => onChange({ edgeColor }),
            },
            {
                name    : "Depth",
                type    : "number",
                // min     : 0,
                // step    : 0.1,
                value   : options.depth ?? 50,
                onChange: (depth: number) => onChange({ depth })
            }
        )
    } else {
        props.push(
            {
                name    : "Border Width",
                type    : "number",
                min     : 0,
                step    : 0.1,
                value   : options.borderWidth ?? 0.5,
                onChange: (borderWidth: number) => onChange({ borderWidth })
            },
            {
                name    : "Border Color",
                type    : "color",
                value   : options.borderColor ?? "#00000088",
                onChange: (borderColor: string) => onChange({ borderColor })
            }
        )
    }
    
    props.push(
        {
            name    : "Dash Style",
            type    : "options",
            options : DASH_STYLES,
            value   : options.dashStyle ?? "Solid",
            onChange: (dashStyle: DashStyleValue) => onChange({ dashStyle })
        },
        {
            name    : "Opacity",
            type    : "number",
            min     : 0,
            max     : 1,
            step    : 0.01,
            value   : options.opacity ?? 1,
            onChange: (opacity: number) => onChange({ opacity })
        },
        {
            name : "Inner Size",
            type : "length",
            units: ["%", "px"],
            value: options.innerSize ?? "50%",
            min  : 0,
            max  : 100,
            onChange: (innerSize: string) => onChange({ innerSize })
        },
        {
            name: "Center X",
            type: "length",
            units: ["%", "px"],
            value: options.center?.[0] ?? null,
            onChange: (x?: string) => onChange({ center: [x || null, options.center?.[1] ?? null] })
        },
        {
            name: "Center Y",
            type: "length",
            units: ["%", "px"],
            value: options.center?.[1] ?? null,
            onChange: (y?: string) => onChange({ center: [options.center?.[0] ?? null, y || null] })
        },
        {
            name    : "startAngle",
            type    : "number",
            min     : -360,
            max     : 360,
            value   : options.startAngle ?? 0,
            onChange: (startAngle: number) => onChange({ startAngle })
        },
        {
            name    : "endAngle",
            type    : "number",
            min     : -360,
            max     : 360,
            value   : options.endAngle ?? 360,
            onChange: (endAngle: number) => onChange({ endAngle })
        }
    )

    return props;
}

function AdvancedAxisEditor({
    axis,
    onChange
}: {
    axis: XAxisOptions | YAxisOptions,
    onChange: (axis: Partial<XAxisOptions | YAxisOptions>) => void
}) {
    return (
        <Collapse collapsed header="Advanced">
            <PropertyGrid props={[
                {
                    name: "Alternate Grid Color",
                    type: "color",
                    value: axis.alternateGridColor ?? "#0000",
                    onChange: (alternateGridColor?: string) => onChange({ alternateGridColor: alternateGridColor ?? undefined })
                },
                {
                    name: "Line Color",
                    type: "color",
                    value: axis.lineColor ?? "#333333",
                    onChange: (lineColor?: string) => onChange({ lineColor: lineColor ?? "#333333" })
                },
                {
                    name: "Line Width",
                    type: "number",
                    min: 0,
                    value: axis.lineWidth ?? 1,
                    onChange: (lineWidth?: number) => onChange({ lineWidth: lineWidth ?? 1 })
                },
                {
                    name: "Reversed",
                    type: "boolean",
                    value: !!axis.reversed,
                    onChange: (reversed: boolean) => onChange({ reversed })
                },
                {
                    name: "Start on Tick",
                    type: "boolean",
                    value: axis.startOnTick !== false,
                    onChange: (startOnTick: boolean) => onChange({ startOnTick })
                },
                {
                    name    : "Min",
                    type    : axis.type === "datetime" ? "date" : "number",
                    value   : axis.type === "datetime" ? +new Date(axis.min ?? 0) : axis.min ?? undefined,
                    disabled: axis.type === "category",
                    onChange: (min?: number) => onChange({
                        min: min ?
                            axis.type === "datetime" ?
                                +new Date(min) :
                                min ?? null:
                            null
                    })
                },
                // {
                //     name : "softMin",
                //     type : "number",
                //     value: axis.softMin,
                //     onChange: (softMin?: number) => onChange({ softMin })
                // },
                {
                    name: "End on Tick",
                    type: "boolean",
                    value: !!axis.endOnTick,
                    onChange: (endOnTick: boolean) => onChange({ endOnTick })
                },
                {
                    name    : "Max",
                    type    : axis.type === "datetime" ? "date" : "number",
                    value   : axis.type === "datetime" ? +new Date(axis.max ?? 0) : axis.max ?? undefined,
                    disabled: axis.type === "category",
                    onChange: (max?: number) => onChange({
                        max: max ?
                            axis.type === "datetime" ?
                                +new Date(max) :
                                max ?? null:
                            null
                    })
                },
                // {
                //     name : "softMax",
                //     type : "number",
                //     value: axis.softMax,
                //     onChange: (softMax?: number) => onChange({ softMax })
                // },
                // {
                //     name : "minPadding",
                //     type : "number",
                //     value: axis.minPadding ?? 0.05,
                //     step: 0.01,
                //     min: 0,
                //     onChange: (minPadding?: number) => onChange({ minPadding })
                // },
                {
                    name: "Grid Lines",
                    type: "group",
                    value: [
                        {
                            name: "Color",
                            type: "color",
                            value: axis.gridLineColor ?? "#e6e6e6",
                            onChange: (gridLineColor?: string) => onChange({ gridLineColor: gridLineColor ?? "#e6e6e6" })
                        },
                        {
                            name: "Width",
                            type: "number",
                            min: 0,
                            step: 0.1,
                            value: axis.gridLineWidth,
                            onChange: (gridLineWidth?: number) => onChange({ gridLineWidth })
                        },
                        {
                            name: "Dash Style",
                            type: "options",
                            options: DASH_STYLES,
                            value: axis.gridLineDashStyle ?? "Solid",
                            onChange: (gridLineDashStyle: DashStyleValue) => onChange({ gridLineDashStyle: gridLineDashStyle ?? "Solid" })
                        },
                        {
                            name: "Z Index",
                            type: "number",
                            value: axis.gridZIndex ?? 1,
                            onChange: (gridZIndex?: number) => onChange({ gridZIndex: gridZIndex ?? 1 })
                        }
                    ]
                },
                {
                    name: "Title",
                    type: "group",
                    value: [
                        {
                            name: "Align",
                            type: "options",
                            options: ["low", "middle", "high"],
                            value: axis.title?.align ?? "middle",
                            onChange: (align: AxisTitleAlignValue) => onChange({ title: { align }})
                        },
                        {
                            name: "Color",
                            type: "color",
                            value: axis.title?.style?.color ?? "#666666",
                            onChange: (color?: string) => onChange({ title: { style: { color: color ?? "#666666" }}})
                        },
                        {
                            name: "Font Size",
                            type: "length",
                            units: ["px", "em", "rem"],
                            value: axis.title?.style?.fontSize ?? "0.8em",
                            onChange: (fontSize?: string) => onChange({ title: { style: { fontSize: fontSize ?? "0.8em" }}})
                        }
                    ]
                }
            ]}/>
        </Collapse>
    )
}

function SeriesEditor({
    state,
    onChange,
}: {
    state: ChartConfigPanelState,
    onChange: (state: ChartConfigPanelState) => void
}) {

    const hasInvisible = !!state.chartOptions.series?.find(s => s.visible === false)

    const [force, setForce] = useState(hasInvisible)

    const props = (state.chartOptions.series || []).map((s, i) => {

        // Inherit defaults for the current chart type
        s = merge(state.chartOptions.plotOptions?.[s.type] || {}, s) as SeriesOptionsType

        // @ts-ignore
        const color = s.color?.pattern?.color || s.color?.stops?.[0]?.[1] || s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]

        const props = [
            {
                name: "Visible",
                type: "boolean",
                value: s.visible !== false,
                onChange: (visible: boolean) => {
                    const next = merge(state)
                    next.chartOptions.series![i].visible = visible;
                    onChange(next)
                }
            },
            {
                name: "Name",
                type: "string",
                value: s.name,
                onChange: (name: string) => {
                    const next = merge(state)
                    next.chartOptions.series![i].name = name;
                    onChange(next)
                }
            },
            // {
            //     name: "Type",
            //     type: "options",
            //     options: [
            //         'line', 'spline', 'area', 'areaspline', 'arearange',
            //         'areasplinerange', 'bar', 'bubble', 'column',
            //         'columnpyramid', 'pie', 'scatter'
            //     ],
            //     value: s.type,
            //     onChange: (type: any) => {
            //         const next = merge(state)
            //         next.chartOptions.series![i].type = type;
            //         onChange(next)
            //     }
            // },
            {
                name: "Color",
                type: "color",
                value: color,
                onChange: (color: string) => {
                    state.chartOptions.colors![i] = color
                    onChange(state)
                }
            },
            {
                name: "Opacity",
                type: "number",
                value: s.opacity ?? 1,
                max: 1,
                step: 0.01,
                onChange: (opacity: number) => {
                    const next = merge(state)
                    next.chartOptions.series![i].opacity = opacity;
                    onChange(next)
                }
            },
            {
                name : "Z Index",
                type : "number",
                value: s.zIndex ?? 0,
                onChange: (zIndex: number) => {
                    const next = merge(state)
                    next.chartOptions.series![i].zIndex = zIndex;
                    onChange(next)
                }
            },
            {
                name : "Show in Legend",
                type : "boolean",
                value: s.showInLegend !== false,
                onChange: (showInLegend: boolean) => {
                    const next = merge(state)
                    next.chartOptions.series![i].showInLegend = showInLegend;
                    onChange(next)
                }
            }
        ]

        if (s.type === "spline") {
            props.push(...getSplineOptions(s as SeriesSplineOptions, options => {
                const next = merge(state)
                next.chartOptions.series![i] = merge(next.chartOptions.series![i], options);
                onChange(next)
            }) as any)
        }
        else if (s.type === "areasplinerange" || s.type === "areaspline") {
            props.push(...getAreaOptions(s as SeriesAreasplinerangeOptions, options => {
                const next = merge(state)
                // @ts-ignore
                next.chartOptions.series![i] = merge(next.chartOptions.series![i], options);
                onChange(next)
            }) as any)
        }
        else if (s.type === "column" || s.type === "bar") {
            props.push(...getColumnOptions(s as SeriesColumnOptions, options => {
                const next = merge(state)
                // @ts-ignore
                next.chartOptions.series![i] = merge(next.chartOptions.series![i], options);
                onChange(next)
            }) as any)
        }
        else if (s.type === "errorbar") {
            props.push(...getErrorbarOptions(s as SeriesErrorbarOptions, options => {
                const next = merge(state)
                // @ts-ignore
                next.chartOptions.series![i] = merge(next.chartOptions.series![i], options);
                onChange(next)
            }) as any)
        }

        return {
            name: <>
                <b style={{
                    background: s.visible !== false ? color : "#DDD",
                    width     : "0.9em",
                    height    : "0.9em",
                    display   : "inline-block",
                    boxShadow : s.visible !== false ? "0 0 1px #FFF, 0 1px 1px #FFF8 inset" : "0 0 1px #FFF, 0 1px 1px #CCC8 inset",
                    border    : s.visible !== false ? "1px solid #000" : "1px solid #BBB",
                    borderRadius: "20%",
                }}/>
                <span style={{ color: s.visible !== false ? "#414e5c" : "#999" }}> { String(s.name ?? "") || "Series " + (i + 1)}</span>
            </>,
            type: "group",
            value: props
        }
    })

    return (
        <Collapse collapsed header="Series">
            <PropertyGrid props={props as any} />
            <div
                className="link pt-1 pb-1"
                style={{ color: hasInvisible ? "#06D" : "#AAA", userSelect: "none" }}
                tabIndex={0}
                onClick={() => {
                    if (hasInvisible) {
                        const next = merge(state)
                        next.chartOptions.series?.forEach(s => {
                            if (s.visible === false) {
                                s.showInLegend = !force
                            }
                        });
                        onChange(next)
                        setForce(!force)
                    }
                }}
            >
                <i className={
                    "fa-solid " +
                    (force ? "fa-eye" : "fa-eye-slash")
                } style={{
                    width: "1.8em",
                    display: "inline-block",
                    textAlign: "center"
                }} />Toggle all hidden series in legend
            </div>
            <Collapse collapsed header={
                <span title="Changing these options will affect all series!">
                    All Serries Override <i className="fa-solid fa-triangle-exclamation color-orange" />
                </span>
            }>
                <AllSeriesEditor state={state} onChange={onChange} />
            </Collapse>
            <br/>
        </Collapse>
    )
}

function AllSeriesEditor({
    state,
    onChange,
}: {
    state: ChartConfigPanelState,
    onChange: (state: ChartConfigPanelState) => void
}) {
    const change = (patch: any) => {
        const next = merge(state)
        next.chartOptions.series?.forEach(s => Object.assign(s, patch));
        onChange(next)
    }

    const S: any = state.chartOptions.series?.[0] || {}

    const currentTypes = (state.chartOptions.series || []).reduce((prev, cur) => {
        if (!prev.includes(cur.type)) {
            prev.push(cur.type)
        }
        return prev
    }, [] as string[])

    function hasSeries(...types: string[]) {
        for (const type of types) {
            if (currentTypes.includes(type)) {
                return true
            }
        }
        return false
    }

    const hasColumn     = hasSeries("column")
    const hasBar        = hasSeries("bar")
    const hasPie        = hasSeries("pie")
    const hasSpline     = hasSeries("spline")
    const hasAreaSpline = hasSeries("areaspline")

    const has3d = !!state.chartOptions.chart?.options3d?.enabled

    const props: any[] = []

    if (hasColumn || hasBar || hasPie) {
        if (has3d) {
            props.push(
                {
                    name: "Edge Width",
                    type: "number",
                    min: 0,
                    step: 0.1,
                    value: S.edgeWidth ?? 1,
                    onChange: (edgeWidth: number) => change({ edgeWidth })
                },
                {
                    name: "Edge Color",
                    type: "color",
                    value: S.edgeColor ?? "#00000088",
                    onChange: (edgeColor: string) => change({ edgeColor }),
                }
            )
        } else {
            props.push(
                {
                    name: "Border Width",
                    type: "number",
                    min: 0,
                    step: 0.1,
                    value: S.borderWidth ?? 0.5,
                    onChange: (borderWidth: number) => change({ borderWidth })
                },
                {
                    name: "Border Color",
                    type: "color",
                    value: S.borderColor ?? "#00000088",
                    onChange: (borderColor: string) => change({ borderColor })
                }
            )
        }
    }

    if (hasColumn || hasBar) {
        props.push(
            {
                name : "Border Radius",
                type : "number",
                min: 0,
                max: 50,
                value: S.borderRadius ?? 0,
                onChange: (borderRadius: number) => change({ borderRadius })
            },
            {
                name : "Point Padding",
                type : "number",
                min: 0,
                max: 0.5,
                step: 0.01,
                value: S.pointPadding ?? 0.1,
                onChange: (pointPadding: number) => change({ pointPadding })
            }
        )
    }

    if (state.stratifyBy && (hasColumn || hasBar)) {
        props.push({
            name : "Group Padding",
            type : "number",
            min: 0,
            max: 0.5,
            step: 0.01,
            value: S.groupPadding ?? 0.2,
            onChange: (groupPadding: number) => change({ groupPadding })
        })
    }

    props.push({
        name: "Dash Style",
        type: "options",
        options: DASH_STYLES,
        value: S.dashStyle ?? "Solid",
        onChange: (dashStyle: DashStyleValue) => change({ dashStyle })
    })

    if (hasSpline || hasAreaSpline) {
        props.push({
            name: "Line Width",
            type: "number",
            min: 0,
            max: 50,
            step: 0.1,
            value: S.lineWidth ?? 1,
            onChange: (lineWidth: number) => change({ lineWidth }),
            disabled: !hasSeries("areaspline", "spline")
        })
    }

    if (hasAreaSpline) {
        props.push({
            name: "Fill Opacity",
            type: "number",
            min: 0,
            max: 1,
            step: 0.01,
            value: S.fillOpacity ?? 1,
            onChange: (fillOpacity: number) => change({ fillOpacity }),
        })
    }

    props.push({
        name: "Opacity",
        type: "number",
        min: 0,
        max: 1,
        step: 0.01,
        value: S.opacity ?? 1,
        onChange: (opacity: number) => change({ opacity })
    })

    if (!has3d && (hasColumn || hasBar || hasSpline || hasAreaSpline)) {
        props.push({
            name: "Shadow",
            type: "shadow",
            value: S.shadow || false,
            onChange: (shadow: any) => change({ shadow })
        })
    }

    return <PropertyGrid props={ props } />
}

function SliceEditor({
    state,
    onChange
}: {
    state: ChartConfigPanelState,
    onChange: (state: ChartConfigPanelState) => void
}) {
    const S = state.chartOptions.series?.[0] || {} as SeriesPieOptions

    const colors = state.chartOptions.colors || DEFAULT_COLORS

    // @ts-ignore
    const props = (S.data || []).map((point, i) => ({
        name: String(point.name ?? "") || "Series " + (i + 1),
        type: "color",
        value: colors[i % colors.length],
        onChange: (color: string) => {
            state.chartOptions.colors![i] = color
            onChange(state)
        }
    }));

    const has3d = !!state.chartOptions.chart?.options3d?.enabled

    const change = (patch: any) => {
        const next = merge(state)
        next.chartOptions.series?.forEach(s => Object.assign(s, patch));
        onChange(next)
    }

    return (
        <div>
            <div className="pt-1">
                <Collapse collapsed header="Slice Colors">
                    <div className="pb-1">
                        <PropertyGrid props={props} />
                    </div>
                </Collapse>
                <Collapse collapsed header="Advanced">
                    <div className="pb-1">
                        <PropertyGrid props={getPieOptions(S, change, has3d)} />
                        {/* <AllSeriesEditor state={state} onChange={onChange} /> */}
                    </div>
                </Collapse>
            </div>
        </div>
    )
}
