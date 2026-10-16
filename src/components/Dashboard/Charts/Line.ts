import { Options } from "highcharts";

const options: Options = {
    chart: {
        type: "line",
        options3d: {
            enabled: false
        }
    },
    plotOptions: {
        line: {
            // Reset the step that survival charts set by default
            step: false as any
        }
    }
}

export default options