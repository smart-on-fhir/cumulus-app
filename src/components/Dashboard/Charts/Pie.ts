import { Options } from "highcharts";

const options: Options = {
    chart: {
        type: "pie",
        options3d: {
            enabled: false,
            alpha: 45,
            beta: 0,
            depth: 350,
            fitToPlot: true,
            viewDistance: 25,
            axisLabelPosition: null
        }
    },
    plotOptions: {
        pie: {
            slicedOffset: 30,
            innerSize: 0
        }
    },
    xAxis: {
        lineWidth: 0
    }
}

export default options