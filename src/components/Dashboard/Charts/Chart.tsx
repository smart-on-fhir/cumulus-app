import React from "react"
import { Options } from "highcharts"

declare var Highcharts: any

interface ChartProps {
    chartOptions: Options
    id: string
}


export class Chart extends React.Component<ChartProps>
{
    chart: any;

    componentDidMount()
    {
        this.chart = Highcharts.chart(this.props.id, {
            credits: { enabled: false },
            ...this.props.chartOptions
        });
    }

    componentDidUpdate()
    {
        this.chart.update({
            credits: { enabled: false },
            ...this.props.chartOptions
        }, true, true, true);
    }

    render()
    {
        return <div id={this.props.id} />
    }
}
