import { Options } from "highcharts";

const options: Options = {
    chart: {
        type: "pie",
        options3d: {
            enabled: true,
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
            innerSize: 0,
            slicedOffset: 30,
            center: ["50%", "50%"]
        }
    },
    xAxis: {
        lineWidth: 0
    }
}

export default options