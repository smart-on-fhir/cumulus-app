import React from "react"
import { Options } from "highcharts"
import { defer } from "../../../utils";

declare var Highcharts: any

interface ChartProps {
    chartOptions: Options
    id: string
}



export class Chart extends React.Component<ChartProps>
{
    chart: any;

    constructor(props: ChartProps)
    {
        super(props);
        this.updateChart = this.updateChart.bind(this);
    }

    updateChart()
    {
        this.chart.update(this.props.chartOptions, true, true, false)
    }

    componentDidMount()
    {
        this.chart = Highcharts.chart(this.props.id, {
            credits: { enabled: false },
            ...this.props.chartOptions
        });
    }

    componentDidUpdate()
    {
        defer(this.updateChart);
    }

    render()
    {
        return <div id={this.props.id} className="main-chart" />
    }
}
