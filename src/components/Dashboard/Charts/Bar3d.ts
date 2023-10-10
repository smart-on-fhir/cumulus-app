import { Options } from "highcharts";

const options: Options = {
    chart: {
        type: "bar",
        animation: {
            duration: 0,
            defer: 0,
        },
        options3d: {
            enabled: true,
            alpha: 10,
            beta: 15,
            depth: 80,
            fitToPlot: true,
            viewDistance: 100,
            axisLabelPosition: null,
            frame: {
                visible: "",
                size: 1
            }
        }
    },
    plotOptions: {
        bar: {
            stacking: undefined
        }
    }
}

export default options
