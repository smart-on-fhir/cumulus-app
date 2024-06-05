import { useState }       from "react"
import Select             from "../generic/Select"
import ColumnSelector     from "./ColumnSelector"
import FilterUI           from "./FilterUI"
import Collapse           from "../generic/Collapse"
import Checkbox           from "../generic/Checkbox"
import { AllAnnotations } from "./Inspectors/Annotations"
import TagSelector        from "../Tags/TagSelector"
import PropertyGrid       from "../generic/PropertyGrid"
import { app }            from "../../types"
import ColorEditor        from "../generic/PropertyGrid/ColorEditor"
import DynamicInspector   from "./Inspectors"
import Legend             from "./Inspectors/Legend"
import AxisEditor         from "./Inspectors/Axis"
import Chart              from "./Inspectors/Chart"
import { AllPlotLines }   from "./Inspectors/AxisPlotLines"
import { DEFS }           from "./Schema"
import { AllSeries }      from "./Inspectors/Series"
import {
    DashStyleValue,
    merge,
    Options,
    SeriesPieOptions,
    XAxisOptions,
    YAxisOptions
} from "highcharts"
import {
    SupportedChartTypes,
    ChartIcons,
    DASH_STYLES,
    COLOR_THEMES,
    DEFAULT_COLOR_THEME
} from "./config"


type SupportedChartType = keyof typeof SupportedChartTypes

function SecondaryDataEditor({
    state,
    dataRequest,
    onChange
}: {
    state: ChartConfigPanelState
    dataRequest: app.DataRequest
    onChange: (payload: { column?: string, type?: string }) => void
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
                    onChange={ (column: string) => onChange({ column, type: state.column2type }) }
                />
                <p className="small color-muted">
                    Select another data column to render over the same X axis
                </p>
            </div>
            
            { !!state.column2 && <div className="pt-1">
                <label>Secondary Data Chart Type</label>
                <Select
                    value={ state.column2type ?? "spline" }
                    onChange={ type => onChange({ type, column: state.column2 })}
                    options={[
                        {
                            value: "line",
                            label: "Line",
                            icon: ChartIcons.line
                        },
                        {
                            value: "spline",
                            label: "Soft Line",
                            icon: ChartIcons.spline
                        },
                        {
                            value: "area",
                            label: "Area",
                            icon: ChartIcons.area
                        },
                        {
                            value: "areaspline",
                            label: "Soft Area",
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
    column2type   ?: string
    annotations    : app.Annotation[]
    xCol           : app.DataRequestDataColumn
    tags           : Pick<app.Tag, "id"|"name"|"description">[]
    ranges         : app.RangeOptions | null
    visualOverrides: app.VisualOverridesState
    inspection     : app.Inspection
}

export default function ConfigPanel({
    dataRequest,
    state,
    onChange,
    onChartTypeChange,
    onChartOptionsChange,
    onRangeOptionsChange,
    onSecondaryDataOptionsChange
} : {
    dataRequest: app.DataRequest
    view?: Partial<app.View>
    state: ChartConfigPanelState
    viewType: "overview" | "data"
    onChange: (state: ChartConfigPanelState) => void
    onChartTypeChange: (type: string) => void
    onChartOptionsChange: (options: Options) => void
    onRangeOptionsChange: (ranges: app.RangeOptions) => void
    onSecondaryDataOptionsChange: (payload: { column?: string, type?: string }) => void
}) {
    const { cols } = dataRequest.metadata || { cols: [] }

    const { chartOptions, chartType } = state;

    const isBar    = chartType.startsWith("bar")
    const isColumn = chartType.startsWith("column")
    const isPie    = chartType.startsWith("pie") || chartType.startsWith("donut")
    const isStack  = chartType.endsWith("Stack")
    const isBarOrColumn = isBar || isColumn

    return (
        <div style={{
            color: "#666",
            padding: "0 0.5rem 0 3px",
            width: 330,
            marginRight: "0.5rem"
        }}>

            <div className="mb-1">
                <label>Tags</label>
                <TagSelector selected={state.tags} onChange={tags => onChange({ ...state, tags })} />
            </div>

            {state.inspection.match?.length ?
                <>
                    {/* <pre style={{ whiteSpace: "pre-wrap" }}>{ JSON.stringify(state.inspection, null, 4) }</pre> */}
                    <DynamicInspector
                        chartOptions={state.chartOptions}
                        onChange={onChartOptionsChange}
                        inspection={state.inspection}
                        xCol={ state.xCol }
                        chartType={chartType}
                    />
                    <br />
                </> :
                <>

                

                <Collapse collapsed header="Chart">
                    <div className="mt-1">
                        <label>Chart Type</label>
                        <Select
                            value={ state.chartType }
                            onChange={ onChartTypeChange }
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
                            onChange={ e => onChartOptionsChange({ title: { text: e.target.value }})}
                        />
                        <br/>
                    </div>

                    <div className="mt-1">
                        <label>Color Theme</label>
                        <Select
                            // @ts-ignore
                            value={ state.chartOptions.custom?.theme ?? DEFAULT_COLOR_THEME }
                            onChange={ (id) => {
                                const theme = COLOR_THEMES.find(t => t.id === id)
                                onChartOptionsChange({
                                    colors: theme!.colors,
                                    // @ts-ignore
                                    custom: { theme: id }
                                })
                            }}
                            options={COLOR_THEMES.map((theme, i) => ({
                                value: theme.id,
                                label: theme.name,
                                right: <>{ theme.colors.map((c, i) => <div key={i} style={{
                                    background: c,
                                    display: "inline-block",
                                    width: "8px",
                                    height: "1.36em",
                                    margin: "0 0.5px",
                                    boxShadow: "0 0 0 0.5px #0008 inset, 0 0 0 0.5px #FFF",
                                    verticalAlign: "top"
                                }} />)}</>,
                                icon: "fas fa-palette color-muted"
                            }))}
                        />
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
                                    onChange={e => onChartOptionsChange({
                                        plotOptions: {
                                            [isColumn ? "column" : "bar"]: {
                                                groupPadding: e.target.valueAsNumber
                                            }
                                        }
                                    })}
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
                                    onChange={e => onChartOptionsChange({
                                        plotOptions: {
                                            [isColumn ? "column" : "bar"]: {
                                                pointPadding: e.target.valueAsNumber
                                            }
                                        }
                                    })}
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
                                // @ts-ignore
                                value={ chartOptions.series![0]?.startAngle || 0 }
                                onChange={e => {
                                    chartOptions.series![0] = merge(chartOptions.series![0], { startAngle: e.target.valueAsNumber })
                                    onChartOptionsChange(chartOptions)
                                }}
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
                                onChange={e => onChartOptionsChange({
                                    plotOptions: {
                                        pie: {
                                            slicedOffset: e.target.valueAsNumber
                                        }
                                    }
                                })}
                                style={{ width: "100%", margin: 0 }}
                            />
                        </label>
                    </div> }
                    <div className="mt-1 pb-1">
                        <Collapse collapsed header="Advanced">
                            <Chart chart={state.chartOptions.chart} onChange={chart => onChartOptionsChange({ chart })} />
                        </Collapse>
                    </div>
                    <br/>
                </Collapse>

                <Collapse collapsed header="Data">
                    <div className="color-muted small mt-1" style={{ padding: "0 0 0 1.5em", margin: "1em 0 0" }}>
                        <i className="fas fa-exclamation-circle" style={{ color: "#D30", width: "1.2em", margin: "0 0.2em 0 -1.5em" }} />
                        Changing these settings may result in new data being fetched.
                        That will create a different chart using different series and
                        some of your visualization settings may have to be re-applied.
                        To avoid that try to configure your <b>Data</b> and <b>Filters</b> settings
                        first.
                    </div>
                    <div style={{ position: "relative" }}>
                        { state.stratifyBy && <div className="dashboard-sidebar-swap-btn-wrap">
                            <div className="fas fa-exchange-alt" onClick={() => {
                                onChange({
                                    ...state,
                                    groupBy: state.stratifyBy,
                                    stratifyBy: state.groupBy,
                                })
                            }} data-tooltip="Swap selected columns" />
                        </div> }
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
                            <div className="pt-1 pb-1">
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
                                        denominator: (state.denominator === "local" || state.denominator === "count") && !stratifyBy ? "" : state.denominator
                                    }) }
                                />
                                <p className="small color-muted">
                                    Stratify the data into multiple series based on the chosen column. For example,
                                    this would produce multiple lines in a line chart.
                                </p>
                            </div>
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
                                                count within the entire dataset.
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
                                ]} onChange={type => onRangeOptionsChange({ type, enabled: !!type })} />
                                <p className="small color-muted">
                                    If information is available, add the error ranges to the chart
                                </p>
                            </div> }

                            <SecondaryDataEditor state={state} dataRequest={dataRequest} onChange={onSecondaryDataOptionsChange} />
                        </> }

                        { isPie && <SliceEditor state={state} onChange={onChange} /> }
                        <br />
                    </div>
                </Collapse>

                <Collapse collapsed header="Filters">
                    <div className="color-muted small mt-1" style={{ padding: "0 0 0 1.5em", margin: "1em 0 0" }}>
                        <i className="fas fa-exclamation-circle" style={{ color: "#D30", width: "1.2em", margin: "0 0.2em 0 -1.5em" }} />
                        Changing these settings may result in new data being fetched.
                        That will create a different chart using different series and
                        some of your visualization settings may have to be re-applied.
                        To avoid that try to configure your <b>Data</b> and <b>Filters</b> settings
                        first.
                    </div>
                    <div className="pt-1 pb-1">
                        <FilterUI
                            onChange={filters => onChange({ ...state, filters })}
                            current={ state.filters }
                            cols={ cols }
                        />
                    </div>
                </Collapse>

                { !isPie && <SeriesEditor state={state} onChange={onChartOptionsChange} /> }

                { !isPie && <Collapse collapsed header={ isBar ? "X Axis" : "Y Axis" }>
                    <div className="mt-1">
                        <label>Axis Title</label>
                        <input
                            type="text"
                            // @ts-ignore
                            value={ chartOptions.yAxis?.title?.text || "" }
                            onChange={ e => onChartOptionsChange({
                                yAxis: {
                                    title: {
                                        text: e.target.value
                                    }
                                }
                            })}
                        />
                    </div>
                    <div className="mt-1 pb-1">
                        <Checkbox
                            name="YTicks"
                            label="Render axis tick marks"
                            // @ts-ignore
                            checked={chartOptions.yAxis?.tickWidth !== 0}
                            onChange={checked => onChartOptionsChange({
                                yAxis: {
                                    tickWidth: checked ? 1 : 0
                                }
                            })}
                        />
                        <Checkbox
                            name="YLabels"
                            label="Render labels"
                            // @ts-ignore
                            checked={chartOptions.yAxis?.labels?.enabled !== false}
                            onChange={checked => onChartOptionsChange({
                                yAxis: {
                                    labels: { enabled: checked }
                                }
                            })}
                        />
                    </div>
                    <div className="pb-1">
                        <Collapse collapsed header="Advanced Axis Options">
                            <AxisEditor axis={state.chartOptions.yAxis as YAxisOptions} onChange={(yAxis: YAxisOptions) => onChartOptionsChange({ yAxis })} />
                        </Collapse>
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
                            onChange={ e => onChartOptionsChange({
                                xAxis: {
                                    title: {
                                        text: e.target.value
                                    }
                                }
                            })}
                        />
                    </div>
                    <div className="mt-1 pb-1">
                        <Checkbox
                            name="XTicks"
                            label="Render axis tick marks"
                            // @ts-ignore
                            checked={ !!chartOptions.xAxis?.tickWidth }
                            onChange={checked => onChartOptionsChange({
                                xAxis: {
                                    tickWidth: checked ? 1 : 0
                                }
                            })}
                        />
                        <Checkbox
                            name="XLabels"
                            label="Render labels"
                            // @ts-ignore
                            checked={chartOptions.xAxis?.labels?.enabled !== false}
                            onChange={checked => onChartOptionsChange({
                                xAxis: {
                                    labels: { enabled: checked }
                                }
                            })}
                        />
                    </div>
                    <div className="pb-1">
                        <Collapse collapsed header="Advanced Axis Options">
                            <AxisEditor axis={state.chartOptions.xAxis as XAxisOptions} onChange={(xAxis: any) => onChartOptionsChange({ xAxis })} />
                        </Collapse>
                    </div>
                </Collapse> }

                { !isPie && <Collapse collapsed header="Plot Lines">
                    <AllPlotLines chartOptions={state.chartOptions} onChange={onChartOptionsChange} />
                </Collapse> }

                <Collapse collapsed header="Legend">
                    <div className="pb-1">
                        <Legend legend={chartOptions.legend} onChange={legend => onChartOptionsChange({ legend })} />
                    </div>
                </Collapse>

                { !isPie && <Collapse collapsed header="Annotations">
                    <div className="pt-1 pb-2">
                        <AllAnnotations
                            onChange={ annotations => onChartOptionsChange({
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
                            })}
                            annotations={ chartOptions.annotations?.[0]?.labels || [] }
                            xType={ state.xCol.dataType }
                        />
                    </div>
                </Collapse> }
                
                <Collapse collapsed header="Advanced">
                    <br/>
                    <Collapse collapsed header="Visual Overrides">
                        <div className="mt-1">
                            <VisualOverridesEditor state={state.visualOverrides} onChange={visualOverrides => onChange({ ...state, visualOverrides })} />
                        </div>
                    </Collapse>
                </Collapse>
                <br/>
            </>}
        </div>
    )
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
            name : "Size",
            type : "length",
            units: ["%", "px"],
            value: options.size ?? undefined,
            min  : 0,
            max  : 100,
            onChange: (size: string) => onChange({ size })
        },
        {
            name : "Inner Size",
            type : "length",
            units: ["%", "px"],
            value: options.innerSize ?? "0%",
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

function SeriesEditor({
    state,
    onChange,
}: {
    state: ChartConfigPanelState,
    onChange: (options: Options) => void
}) {

    const hasInvisible = !!state.chartOptions.series?.find(s => s.visible === false)

    const [force, setForce] = useState(hasInvisible)

    return (
        <Collapse collapsed header="Series">
            <AllSeries options={state.chartOptions} onChange={onChange} />
            <div
                className="link pt-1 pb-1"
                style={{ color: hasInvisible ? "#06D" : "#AAA", userSelect: "none" }}
                tabIndex={0}
                onClick={() => {
                    if (hasInvisible) {
                        const series = [...state.chartOptions.series!]
                        series.forEach(s => {
                            if (s.visible === false) {
                                s.showInLegend = !force
                            }
                        });
                        onChange({ series })
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
    onChange: (options: Options) => void
}) {
    const change = (patch: any) => {
        const next = merge(state)
        next.chartOptions.series?.forEach(s => Object.assign(s, patch));
        onChange(next.chartOptions)
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
            ...DEFS.opacity,
            name: "Fill Opacity",
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

    const colors = state.chartOptions.colors!

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
                    </div>
                </Collapse>
            </div>
        </div>
    )
}

function VisualOverridesEditor({
    state,
    onChange
}: {
    state: app.VisualOverridesState
    onChange: (state: app.VisualOverridesState) => void
}) {
    const { brightness, contrast, saturation, enabled, fontColor, fontColorEnabled } = state

    return (
        <>
            <blockquote className="color-muted small" style={{
                borderLeft: "3px solid orange",
                padding: "0 0 0 0.5em",
                margin: "0 0 1em"
            }}>
                <i className="fas fa-info-circle"/> Override the appearance of the chart before
                exporting it as an image, taking a screenshot or printing it. These
                settings are <b>NOT STORED</b>!
            </blockquote>
            <Checkbox name="" label="Enable Overrides" checked={ enabled } onChange={ enabled => onChange({ ...state, enabled })}/>
            <br/>

            <div aria-disabled={!enabled}>

                <div className="row middle">
                    <div className="col-0 color-blue-dark">Brightness&nbsp;</div>
                    <div className="col left color-muted">{ brightness !== 100 && <i title="Reset" className="fa-solid fa-rotate-left small" onClick={() => onChange({ ...state, brightness: 100 })} /> }</div>
                    <div className="col-0 color-muted small">{brightness}%</div>
                </div>
                <input type="range" min={0} max={200} value={brightness} step={1} disabled={!enabled} onChange={e => {
                    onChange({ ...state, brightness: e.target.valueAsNumber })
                }} />
                

                <div className="row middle mt-05">
                    <div className="col-0 color-blue-dark">Contrast&nbsp;</div>
                    <div className="col left color-muted">{ contrast !== 100 && <i title="Reset" className="fa-solid fa-rotate-left small" onClick={() => onChange({ ...state, contrast: 100 })} /> }</div>
                    <div className="col-0 color-muted small">{contrast}%</div>
                </div>
                <input type="range" min={0} max={200} value={contrast} step={1} disabled={!enabled} onChange={e => {
                    onChange({ ...state, contrast: e.target.valueAsNumber })
                }} />

                <div className="row middle mt-05">
                    <div className="col-0 color-blue-dark">Saturation&nbsp;</div>
                    <div className="col left color-muted">{ saturation !== 100 && <i title="Reset" className="fa-solid fa-rotate-left small" onClick={() => onChange({ ...state, saturation: 100 })} /> }</div>
                    <div className="col-0 color-muted small">{saturation}%</div>
                </div>
                <input type="range" min={0} max={200} value={saturation} step={1} disabled={!enabled} onChange={e => {
                    onChange({ ...state, saturation: e.target.valueAsNumber })
                }} />
                
                <div className="mt-1 mb-2">
                    <Checkbox name="" label="Use Global Text Color" disabled={!enabled} onChange={ fontColorEnabled => onChange({ ...state, fontColorEnabled })} checked={ !!fontColorEnabled } />
                    <div className="row" style={{ height: "2em", margin: "2px 0px 0px 0px" }}>
                        <div className="col-0 center top" style={{
                            width: "1em",
                            height: "1.36em",
                            margin: "-3px 0 0 0.75em",
                            borderColor: "#00000016",
                            borderStyle: "solid",
                            borderWidth: "0 0 2px 2px",
                            borderRadius: "0 0 0 14px"
                        }}/>
                        <div className="col-0 pl-05">
                            <ColorEditor prop={{
                                name: "fontColor",
                                type: "color",
                                value: fontColor,
                                disabled: !enabled || !fontColorEnabled,
                                onChange: fontColor => onChange({ ...state, fontColor })
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
