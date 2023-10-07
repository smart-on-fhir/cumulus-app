import { AnnotationsLabelsOptions, ChartOptions, LegendOptions, TitleOptions, XAxisOptions, YAxisOptions } from "highcharts"
import { app }                 from "../../../types"
import { SupportedChartTypes } from "../config"
import Annotations             from "./Annotations"
import AxisEditor              from "./Axis"
import AxisGridLinesEditor     from "./AxisGridLines"
import AxisLabelsEditor        from "./AxisLabels"
import AxisPlotLinesUI         from "./AxisPlotLines"
import AxisTitleEditor         from "./AxisTitle"
import Chart                   from "./Chart"
import Legend                  from "./Legend"
import Plot                    from "./Plot"
import Series                  from "./Series"
import Title                   from "./Title"


export default function DynamicInspector({
    inspection,
    chartOptions,
    chartType,
    onChange,
    xCol
}: {
    chartOptions: Partial<Highcharts.Options>
    xCol        : app.DataRequestDataColumn
    onChange    : (state: Partial<Highcharts.Options>) => void
    chartType   : keyof typeof SupportedChartTypes
    inspection  : app.Inspection
}) {
    return (
        <div className="dynamic-inspector">
            { inspection.match.map((type, i) => <Editor
                    type={type}
                    xCol={xCol}
                    key={i}
                    chartOptions={chartOptions}
                    onChange={onChange}
                    // collapsed={i > 0}
                    collapsed={false}
                    context={ inspection.context }
                    chartType={ chartType }
                />)
            }
        </div>
    )
}

function Editor({
    type,
    chartOptions,
    onChange,
    collapsed,
    xCol,
    context,
    chartType
}: {
    type        : string
    chartOptions: Partial<Highcharts.Options>
    onChange    : (state: Partial<Highcharts.Options>) => void
    collapsed  ?: boolean
    xCol        : app.DataRequestDataColumn
    chartType   : keyof typeof SupportedChartTypes
    context     : app.InspectionContext
}) {
    const xAxis = (chartOptions.xAxis ?? {}) as XAxisOptions
    const yAxis = (chartOptions.yAxis ?? {}) as YAxisOptions
    const isBar = chartType.startsWith("bar")

    function dir(XorY: "x" | "y") {
        return XorY === "x" ?
            isBar ? "Y" : "X":
            isBar ? "X" : "Y";
    }

    switch (type) {
        case "xAxis":
            return (
                <div>
                    <h5 className="color-brand-2"><i className="fa-solid fa-crosshairs"/> { dir("x") } Axis</h5>
                    <hr/>
                    <AxisEditor axis={xAxis} onChange={ a => onChange({ xAxis: a as XAxisOptions }) } />
                </div>
            )

        case "yAxis":
            return <>
                <h5 className="color-brand-2"><i className="fa-solid fa-crosshairs"/> { dir("y") } Axis</h5>
                <hr/>
                <AxisEditor axis={yAxis} onChange={ a => onChange({ yAxis: a as YAxisOptions }) } />
            </>
        
        case "xAxisTitle": 
            return <>
                <h5 className="color-brand-2"><i className="fa-solid fa-crosshairs"/> { dir("x") } Axis Title</h5>
                <hr/>
                <AxisTitleEditor title={xAxis.title} onChange={ title => onChange({ xAxis: { title }}) } />
            </>

        case "yAxisTitle": 
            return <>
                <h5 className="color-brand-2"><i className="fa-solid fa-crosshairs"/> { dir("y") } Axis Title</h5>
                <hr/>
                <AxisTitleEditor title={yAxis.title} onChange={ title => onChange({ yAxis: { title }}) } />
            </>

        case "xAxisGridLines":
            return <>
                <h5 className="color-brand-2"><i className="fa-solid fa-crosshairs"/> { dir("x") } Axis GridLines</h5>
                <hr/>
                <AxisGridLinesEditor axis={xAxis} onChange={ a => onChange({ xAxis: a as XAxisOptions }) } />
            </>
        
        case "yAxisGridLines":
            return <>
                <h5 className="color-brand-2"><i className="fa-solid fa-crosshairs"/> { dir("y") } Axis GridLines</h5>
                <hr />
                <AxisGridLinesEditor axis={yAxis} onChange={ a => onChange({ yAxis: a as YAxisOptions }) } />
            </>

        case "xAxisLabels":
            return <>
                <h5 className="color-brand-2"><i className="fa-solid fa-crosshairs"/> { dir("x") } Axis Labels</h5>
                <hr/>
                <AxisLabelsEditor axis={xAxis} onChange={ a => onChange({ xAxis: a as XAxisOptions }) } />
            </>
        
        case "yAxisLabels":
            return <>
                <h5 className="color-brand-2"><i className="fa-solid fa-crosshairs"/> { dir("y") } Axis Labels</h5>
                <hr/>
                <AxisLabelsEditor axis={yAxis} onChange={ a => onChange({ yAxis: a as YAxisOptions }) } />
            </>
        
        case "legend":
            return <>
                <h5 className="color-brand-2"><i className="fa-solid fa-crosshairs"/> Legend</h5>
                <hr/>
                <Legend legend={chartOptions.legend} onChange={ l => onChange({ legend: l as LegendOptions }) } />
            </>

        case "plot":
            return <>
                <h5 className="color-brand-2"><i className="fa-solid fa-crosshairs"/> Plot Area</h5>
                <hr/>
                <Plot chart={chartOptions.chart} onChange={ c => onChange({ chart: c as ChartOptions }) } />
            </>

        case "title":
            return <>
                <h5 className="color-brand-2"><i className="fa-solid fa-crosshairs"/> Chart Title</h5>
                <hr/>
                <Title title={chartOptions.title} onChange={ t => onChange({ title: t as TitleOptions }) } />
            </>

        case "chart":
            return <>
                <h5 className="color-brand-2"><i className="fa-solid fa-crosshairs"/> Chart</h5>
                <hr />
                <Chart chart={chartOptions.chart} onChange={ c => onChange({ chart: c as ChartOptions }) } />
            </>

        case "plotLine":
        case "plotLineLabel":
            return <AxisPlotLinesUI chartOptions={chartOptions} onChange={onChange} selectedId={context.selectedPlotLineId} selectedPlotLineAxis={context.selectedPlotLineAxis} />

        case "annotation":
            return <Annotations
                annotations={ chartOptions.annotations?.[0]?.labels }
                onChange={ a => onChange({
                    annotations: [{
                        visible: true,
                        draggable: '',
                        crop: false,
                        labelOptions: {
                            overflow: "justify",
                            allowOverlap: true,
                            className: "chart-annotation"
                        },
                        labels: a as AnnotationsLabelsOptions[]
                    }]
                }) }
                xType={xCol.dataType}
                selectedIndex={ context.selectedAnnotationIndex }
            />

        case "series":
            return <Series options={chartOptions} onChange={onChange} seriesId={ context.selectedSeriesId } />


        // "highcharts-caption"        : ["caption"],
        // "highcharts-subtitle"       : ["subtitle"],

        default:
            return <p><b className="color-red">No editors configured for "{type}"</b></p>
    }
}


