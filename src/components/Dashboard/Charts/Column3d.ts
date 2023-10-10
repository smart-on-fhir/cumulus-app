import { Options } from "highcharts";

const options: Options = {
    chart: {
        type: "column",
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
        },
    },
    plotOptions: {
        column: {
            stacking: undefined
        }
    }
}

export default options