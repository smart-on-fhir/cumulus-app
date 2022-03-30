
import { merge }      from "highcharts"
import { useAuth }    from "../../auth"
import Select         from "../Select"
import ColumnSelector from "./ColumnSelector"
import FilterUI       from "./FilterUI"
import {
    SupportedChartTypes,
    ChartIcons,
    SingleDimensionChartTypes
} from "./config"
import Collapse from "../Collapse"
import Checkbox from "../Checkbox"


type SupportedChartType = keyof typeof SupportedChartTypes

interface ChartConfigPanelState {
    groupBy        : string
    stratifyBy     : string
    sortBy         : string
    filters        : any[]
    chartType      : SupportedChartType
    viewName       : string
    viewDescription: string
    chartOptions   : Partial<Highcharts.Options>
    colorOptions   : app.ColorOptions,
    denominator    : string
}

export default function ConfigPanel({
    dataRequest,
    state,
    onChange,
    viewType
} : {
    dataRequest: app.DataRequest
    state: ChartConfigPanelState
    viewType: "overview" | "data"
    onChange: (state: ChartConfigPanelState) => void
}) {
    let auth = useAuth();
    return (
        <div style={{
            color: "#666",
            // height: "calc(100vh - 13em)",
            // overflowY: "auto",
            padding: "0 15px 0 3px",
            width: 330,
            marginRight: "1em",
            // position: "sticky",
            // top: 0
        }}>
            { viewType === "overview" && auth.user?.role === "admin" && (
                <Collapse header="View">
                    <div className="mt-1">
                        <label>Title</label>
                        <input type="text" value={state.viewName} onChange={ e => onChange({ ...state, viewName: e.target.value })} required />
                    </div>
                    <div className="mt-1 pb-2">
                        <label className="mt-1">Short Description</label>
                        <textarea rows={3} value={state.viewDescription} onChange={ e => onChange({ ...state, viewDescription: e.target.value })}></textarea>
                    </div>
                </Collapse>
            )}
            
            { viewType === "overview" && (
                <Collapse collapsed header="Chart">
                    <div className="mt-1">
                        <label>Chart Type</label>
                        <Select
                            value={ state.chartType }
                            onChange={ chartType => onChange({ ...state, chartType })}
                            options={Object.keys(SupportedChartTypes).map((type, i) => ({
                                value: type,
                                label: SupportedChartTypes[type as SupportedChartType],
                                icon: ChartIcons[type as keyof typeof ChartIcons]
                            }))}
                        />
                    </div>
                    <div className="mt-1">
                        <label>Chart Title</label>
                        <input
                            type="text"
                            value={ state.chartOptions.title?.text || "" }
                            onChange={ e => onChange(merge(state, {
                                chartOptions: {
                                    title: {
                                        text: e.target.value
                                    }
                                }
                            }))}
                        />
                    </div>
                    <div className="mt-1 pb-2">
                        <Checkbox
                            name="plotBorderWidth"
                            disabled={ state.chartType.includes("3d") }
                            checked={ !!state.chartOptions.chart?.plotBorderWidth }
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
                            checked={state.chartOptions.legend?.enabled !== false}
                            onChange={enabled => onChange(merge(state, {
                                chartOptions: {
                                    legend: { enabled }
                                }
                            }))}
                        />
                    </div>
                </Collapse>
            )}

            { !state.chartType.startsWith("pie") && !state.chartType.startsWith("donut") &&
                <Collapse collapsed header={ state.chartType.startsWith("bar") ? "X Axis" : "Y Axis" }>
                    <div className="mt-1">
                        <label>Axis Title</label>
                        <input
                            type="text"
                            // @ts-ignore
                            value={ state.chartOptions.yAxis?.title?.text || "" }
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
                            checked={state.chartOptions.yAxis?.gridLineWidth !== 0}
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
                            checked={state.chartOptions.yAxis?.lineWidth !== 0}
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
                            disabled={state.chartOptions.yAxis?.lineWidth === 0}
                            // @ts-ignore
                            checked={state.chartOptions.yAxis?.tickWidth !== 0}
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
                            checked={state.chartOptions.yAxis?.labels?.enabled !== false}
                            onChange={checked => onChange(merge(state, {
                                chartOptions: {
                                    yAxis: {
                                        labels: { enabled: checked }
                                    }
                                }
                            }))}
                        />
                    </div>
                </Collapse>
            }

            { !state.chartType.startsWith("pie") && !state.chartType.startsWith("donut") &&
                <Collapse collapsed header={ state.chartType.startsWith("bar") ? "Y Axis" : "X Axis" }>
                    <div className="mt-1 pb-2">
                        <Checkbox
                            name="XTitle"
                            label="Render title"
                            // @ts-ignore
                            checked={state.chartOptions.xAxis?.title?.enabled !== false}
                            onChange={enabled => onChange(merge(state, {
                                chartOptions: {
                                    xAxis: {
                                        title: { enabled }
                                    }
                                }
                            }))}
                        />
                        <Checkbox
                            name="XGridLineWidth"
                            label="Render grid lines"
                            // @ts-ignore
                            checked={state.chartOptions.xAxis?.gridLineWidth === 1}
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
                            checked={!!state.chartOptions.xAxis?.lineWidth}
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
                            disabled={state.chartOptions.xAxis?.lineWidth === 0}
                            // @ts-ignore
                            checked={ !!state.chartOptions.xAxis?.tickWidth }
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
                            checked={state.chartOptions.xAxis?.labels?.enabled !== false}
                            onChange={checked => onChange(merge(state, {
                                chartOptions: {
                                    xAxis: {
                                        labels: { enabled: checked }
                                    }
                                }
                            }))}
                        />
                    </div>
                </Collapse>
            }
            
            <Collapse collapsed header="Filters">
                <FilterUI
                    onChange={filters => onChange({ ...state, filters })}
                    current={ state.filters }
                    cols={ dataRequest.data.cols }
                />
                <br/>
            </Collapse>

            <Collapse collapsed header="Colors">
                <div className="pt-1 pb-2">
                    <label>
                        Saturation
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={ state.colorOptions.saturation }
                            onChange={e => onChange({ ...state, colorOptions: { ...state.colorOptions, saturation: e.target.valueAsNumber }})}
                            style={{ width: "100%", margin: 0 }}
                        />
                    </label>
                    <p className="small color-muted">The intensity of all the colors</p>
                    <br/>
                    <label>
                        Brightness
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={ state.colorOptions.brightness }
                            onChange={e => onChange({ ...state, colorOptions: { ...state.colorOptions, brightness: e.target.valueAsNumber }})}
                            style={{ width: "100%", margin: 0 }}
                        />
                    </label>
                    <p className="small color-muted">The lightness or darkness of all the colors</p>
                    <br/>
                    <label>
                        Opacity
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={ state.colorOptions.opacity }
                            onChange={e => onChange({ ...state, colorOptions: { ...state.colorOptions, opacity: e.target.valueAsNumber }})}
                            style={{ width: "100%", margin: 0 }}
                        />
                    </label>
                    <p className="small color-muted">Using semitransparent colors might slightly improve readability in case of overlaping lines or shapes</p>
                    <br/>
                    <label>
                        Variety
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.001}
                            value={ state.colorOptions.variety }
                            onChange={e => onChange({ ...state, colorOptions: { ...state.colorOptions, variety: e.target.valueAsNumber }})}
                            style={{ width: "100%", margin: 0 }}
                        />
                    </label>
                    <p className="small color-muted">We use "golden angle" slices of the color wheel to generate unique colors. However, in some cases you might want to reduce the variety and use colors that are closer to each other.</p>
                    <br/>
                    <label>
                        Start Color
                        <div style={{ background: "linear-gradient(90deg, #F00, #FF0, #0F0, #0FF, #00F, #F0F, #F00)", height: "3px", margin: "0 1px 5px", borderRadius: 6 }}></div>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            step={1}
                            value={ state.colorOptions.startColor }
                            onChange={e => onChange({ ...state, colorOptions: { ...state.colorOptions, startColor: e.target.valueAsNumber }})}
                            style={{ width: "100%", margin: 0 }}
                        />
                    </label>
                    <p className="small color-muted">Select the hue of the first color. Any subsequent colors will be computed by shifting this hue with an ammount depending on the "variety" color setting.</p>

                </div>
            </Collapse>

            <Collapse collapsed header="Data">
                <div className="pt-1">
                    <label>Visualize&nbsp;Column</label>
                    <ColumnSelector
                        cols={ dataRequest.data.cols }
                        value={ state.groupBy }
                        filter={col => {
                            if (col.name === "cnt") return false
                            if (SingleDimensionChartTypes.includes(state.chartType)) {
                                return true
                            }
                            return col.name !== state.stratifyBy
                        } }
                        onChange={(groupBy: string) => onChange({ ...state, groupBy })}
                    />
                </div>
                { !state.chartType.startsWith("pie") && !state.chartType.startsWith("donut") &&
                    <div className="pt-1">
                        <label>Stratifier</label>
                        <Select
                            right
                            placeholder="Select Column"
                            value={ state.stratifyBy }
                            onChange={(stratifyBy: string) => onChange({
                                ...state,
                                stratifyBy,
                                denominator: state.denominator === "local" && !stratifyBy ? "" : state.denominator
                            })}
                            options={[
                                { value: "", label: "NONE", icon: "fas fa-close color-red" },
                                ...dataRequest.data.cols.map(col => ({
                                    value   : col.name,
                                    label   : col.label || col.name,
                                    disabled: col.name === "cnt" || col.name === state.groupBy,
                                    icon    : "/icons/column.png",
                                    right   : <span className={ col.dataType + " color-muted small right" }> {col.dataType}</span>
                                }))
                            ]}
                        />
                    </div>
                }
                { !state.chartType.startsWith("pie") && !state.chartType.startsWith("donut") &&
                    <div className="pt-1 pb-1">
                        <label>Denominator</label>
                        <Checkbox
                            type="radio"
                            checked={ state.denominator === "" }
                            onChange={() => onChange({ ...state, denominator: "" })}
                            name="denominator"
                            label="None"
                            description="Render the aggregate counts found in the data source without further processing"
                            className="mb-1"
                        />
                        <Checkbox
                            type="radio"
                            disabled={ !state.stratifyBy }
                            checked={ state.denominator === "local" }
                            onChange={() => onChange({ ...state, denominator: "local" })}
                            name="denominator"
                            label="Stratified Count"
                            description="Convert counts to percentage of the total count of every given data group. Not available with no stratifier."
                            className="mb-1"
                        />
                        <Checkbox
                            type="radio"
                            // disabled={ !state.stratifyBy }
                            checked={state.denominator === "global"}
                            onChange={() => onChange({ ...state, denominator: "global" })}
                            name="denominator"
                            label="Total Count"
                            description="Convert counts to percentage of the total count within the entire dataset"
                            className="mb-1"
                        />
                        {/* <ColumnSelector
                            cols={ dataRequest.data.cols }
                            value={ state.groupBy }
                            filter={col => {
                                if (col.name === "cnt") return false
                                if (SingleDimensionChartTypes.includes(state.chartType)) {
                                    return true
                                }
                                return col.name !== state.stratifyBy
                            } }
                            onChange={(groupBy: string) => onChange({ ...state, groupBy })}
                        /> */}
                    </div>
                }
            </Collapse>

            <br/>
        </div>
    )
}
