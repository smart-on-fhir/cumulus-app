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
            opacity: 0.3,
            // Helps to tell overlapping curves apart
            shadow: {
                color  : "#000000",
                opacity: 0.4,
                offsetX: 1,
                offsetY: 1,
                width  : 1
            }
        }
    }
}

export default options
