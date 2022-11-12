
import { merge }         from "highcharts"
import Select            from "../Select"
import ColumnSelector    from "./ColumnSelector"
import FilterUI          from "./FilterUI"
import Collapse          from "../Collapse"
import Checkbox          from "../Checkbox"
import AnnotationsUI     from "./AnnotationsUI"
import Rating            from "../Rating"
import { request }       from "../../backend"
import { useState }      from "react"
import {
    SupportedChartTypes,
    ChartIcons
} from "./config"

type SupportedChartType = keyof typeof SupportedChartTypes



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
                <label>Secondary Column</label>
                <ColumnSelector
                    addEmptyOption="start"
                    cols={ cols }
                    value={ state.column2 || null }
                    disabled={[ "cnt", state.stratifyBy, state.groupBy ].filter(Boolean)}
                    onChange={ (column2: string) => onChange({ ...state, column2 }) }
                />
            </div>
            
            { !!state.column2 && <div className="pt-1">
                <label>Render As</label>
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
            </div> }

            { !!state.column2 && !!state.column2type && <>
                <div className="pt-1">
                    <label>Colors</label>
                    <br/>
                    <ColorPresetEditor state={state} onChange={onChange} type="secondary" />
                </div>
                <div className="pt-1">
                    <label>
                        Opacity
                        <SecondaryDataOpacityEditor state={state} onChange={onChange} />
                    </label>
                    <p className="small color-muted">
                        Using semitransparent colors might slightly improve readability in case
                        of overlapping lines or shapes
                    </p>
                </div>
            </> }
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
}

export default function ConfigPanel({
    dataRequest,
    state,
    onChange,
    view
} : {
    dataRequest: app.DataRequest
    view: Partial<app.View>
    state: ChartConfigPanelState
    viewType: "overview" | "data"
    onChange: (state: ChartConfigPanelState) => void
}) {
    let [ rating  , setRating   ] = useState(view.normalizedRating || 0)
    let [ votes   , setVotes    ] = useState(view.votes || 0)
    let [ voting  , setVoting   ] = useState(false)
    let [ tabIndex, setTabIndex ] = useState(0)

    const { cols } = dataRequest.metadata || { cols: [] }

    const vote = async (n: number) => {
        setVoting(true)
        await request<app.View>(`/api/views/${view.id}/vote`, {
            method : "PUT",
            body   : "rating=" + n,
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            }
        }).then(
            v => {
                setRating(v.normalizedRating)
                setVotes(v.votes)
                setVoting(false)
            },
            e  => {
                setVoting(false)
                alert(e.message)
            }
        );
    }

    const resetRating = async () => {
        setVoting(true)
        await request<app.View>(`/api/views/${view.id}/reset-rating`, {
            method : "PUT"
        }).then(
            v => {
                setRating(v.normalizedRating)
                setVotes(v.votes)
                setVoting(false)
            },
            e  => {
                setVoting(false)
                alert(e.message)
            }
        );
    }
    
    const { chartOptions } = state;

    const isBar    = state.chartType.startsWith("bar")
    const isColumn = state.chartType.startsWith("column")
    const isPie    = state.chartType.startsWith("pie") || state.chartType.startsWith("donut")
    const isStack  = state.chartType.endsWith("Stack")
    const is3D     = state.chartType.includes("3d")
    const isBarOrColumn = isBar || isColumn

    return (
        <div style={{
            color: "#666",
            padding: "0 15px 0 3px",
            width: 330,
            marginRight: "1em"
        }}>
            { view.id && <Rating
                    value={ rating }
                    votes={ votes }
                    loading={ voting }
                    onVote={ vote }
                    onClear={ resetRating }
                />
            }
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
                <div className="mt-1">
                    <Checkbox
                        name="plotBorderWidth"
                        disabled={ is3D }
                        checked={ !!chartOptions.chart?.plotBorderWidth }
                        onChange={ checked => onChange(merge(state, {
                            chartOptions: {
                                chart: {
                                    plotBorderWidth: checked ? 1 : 0
                                }
                            }
                        }))}
                        label="Render Plot Border"
                    />
                    <Checkbox
                        name="legend"
                        label="Show legend"
                        checked={chartOptions.legend?.enabled !== false}
                        onChange={enabled => onChange(merge(state, {
                            chartOptions: {
                                legend: { enabled }
                            }
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
                <br/>
            </Collapse>

            <Collapse collapsed header="Data">
                <div className="pt-1">
                    <label>{ isPie ? "Slices" : "X Axis" }</label>
                    <ColumnSelector
                        cols={ cols }
                        value={ state.groupBy }
                        disabled={[ "cnt", state.stratifyBy, state.column2 ].filter(Boolean)}
                        onChange={ (groupBy: string) => onChange({ ...state, groupBy }) }
                    />
                </div>
                { !isPie && <>
                    <div className="pt-1 pb-1">
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
                                    value: "local",
                                    icon: "fa-solid fa-percent color-brand-2"
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
                    </div>
                    <div className="tab-panel mt-1">
                        <span
                            onClick={() => setTabIndex(0)}
                            className={"tab" + (tabIndex === 0 ? " active" : "")}
                            style={{ background: tabIndex === 0 ? "#f8f8f7" : "transparent" }}
                        >Primary Data</span>
                        <span
                            onClick={() => setTabIndex(1)}
                            className={"tab" + (tabIndex === 1 ? " active" : "")}
                            style={{ background: tabIndex === 1 ? "#f8f8f7" : "transparent" }}
                        >Secondary Data</span>
                    </div>

                    { tabIndex === 0 && !isPie && <>
                        <div className="pt-1">
                            <label>Stratifier</label>
                            <ColumnSelector
                                cols={ cols }
                                placeholder="Select Column"
                                addEmptyOption="start"
                                value={ state.stratifyBy }
                                disabled={[ "cnt", state.groupBy, state.column2 ].filter(Boolean)}
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
                    </> }

                    { tabIndex === 1 && <SecondaryDataEditor state={state} dataRequest={dataRequest} onChange={onChange} /> }
                </> }

                { tabIndex === 0 && <>
                    <div className="pt-1">
                        <b>Colors</b>
                        <div>
                            <ColorPresetEditor state={state} onChange={onChange} type={ isPie ? "only" : "primary" } />
                        </div>
                    </div>
                    <div className="pt-1">
                        <b>Opacity</b>
                        <PrimaryDataOpacityEditor state={state} onChange={onChange} />
                        <p className="small color-muted">
                            Using semitransparent colors might slightly improve readability in case
                            of overlapping lines or shapes
                        </p>
                    </div>
                </> }
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
                <div className="mt-1 pb-2">
                    <Checkbox
                        name="gridLineWidth"
                        label="Render grid lines"
                        // @ts-ignore
                        checked={chartOptions.yAxis?.gridLineWidth !== 0}
                        onChange={checked => onChange(merge(state, {
                            chartOptions: {
                                yAxis: {
                                    gridLineWidth: checked ? 1 : 0
                                }
                            }
                        }))}
                    />
                    <Checkbox
                        name="lineWidth"
                        label="Render axis line"
                        // @ts-ignore
                        checked={chartOptions.yAxis?.lineWidth !== 0}
                        onChange={checked => onChange(merge(state, {
                            chartOptions: {
                                yAxis: {
                                    lineWidth: checked ? 1 : 0
                                }
                            }
                        }))}
                    />
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
                <div className="mt-1 pb-2">
                    <Checkbox
                        name="XGridLineWidth"
                        label="Render grid lines"
                        // @ts-ignore
                        checked={chartOptions.xAxis?.gridLineWidth === 1}
                        onChange={checked => onChange(merge(state, {
                            chartOptions: {
                                xAxis: {
                                    gridLineWidth: checked ? 1 : 0
                                }
                            }
                        }))}
                    />
                    <Checkbox
                        name="XLineWidth"
                        label="Render axis line"
                        // @ts-ignore
                        checked={!!chartOptions.xAxis?.lineWidth}
                        onChange={checked => onChange(merge(state, {
                            chartOptions: {
                                xAxis: {
                                    lineWidth: checked ? 1 : 0
                                }
                            }
                        }))}
                    />
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
            </Collapse> }

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

function ColorPresetEditor({
    state,
    onChange,
    type
}: {
    state: ChartConfigPanelState,
    type?: "primary" | "secondary" | "only",
    onChange: (state: ChartConfigPanelState) => void
}) {
    let colors = state.chartOptions.colors;
    if (!colors) {
        return null
    }
    return <>{ colors.map((c, i) => {
        
        if (type === "only") {
            // @ts-ignore
            if (i > state.chartOptions.series![0].data.length) {
                return null    
            }
        }

        else if (type && !state.chartOptions.series?.[i]?.id?.startsWith(type + "-")) {
            return null
        }
        
        return <input
            type="color"
            key={i}
            value={String(c || "#DDDDDD")}
            onChange={e => {
                state.chartOptions.colors![i] = e.target.value
                onChange(state)
            }}
        />
    }) }</>
}

function PrimaryDataOpacityEditor({ state, onChange }: { state: ChartConfigPanelState, onChange: (state: ChartConfigPanelState) => void }) {
    return <OpacityEditor
        value={state.chartOptions.series?.find(s => s.id?.startsWith("primary-"))?.opacity ?? 1}
        onChange={opacity => {
            onChange({
                ...state,
                chartOptions: {
                    // @ts-ignore
                    series: state.chartOptions.series!.map(s => {
                        if (s.id!.startsWith("primary-")) {
                            return { ...s, opacity }
                        }
                        return s
                    })
                }
            })
        }}
    />
}

function SecondaryDataOpacityEditor({ state, onChange }: { state: ChartConfigPanelState, onChange: (state: ChartConfigPanelState) => void }) {
    return <OpacityEditor
        value={state.chartOptions.series?.find(s => s.id?.startsWith("secondary-"))?.opacity ?? 1}
        onChange={opacity => {
            onChange({
                ...state,
                chartOptions: {
                    // @ts-ignore
                    series: state.chartOptions.series!.map(s => {
                        if (s.id!.startsWith("secondary-")) {
                            return { ...s, opacity }
                        }
                        return s
                    })
                }
            })
        }}
    />
}

function OpacityEditor({ value, onChange }: { value: number, onChange: (value: number) => void}) {
    return (
        <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={value}
            onChange={e => onChange(e.target.valueAsNumber)}
            style={{ width: "100%", margin: 0 }}
        />
    )
}
