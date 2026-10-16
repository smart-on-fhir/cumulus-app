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
            step: "left",
            // A time point missing from a series means no events there, so
            // the curve stays flat until the next point
            connectNulls: true,
            // Survival curves often overlap
            opacity: 0.7
        }
    }
}

export default options
