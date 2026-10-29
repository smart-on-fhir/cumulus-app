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
            // Reset the defaults that survival charts set
            step: false as any,
            connectNulls: false,
            opacity: 1,
            shadow: false,
            // Highcharts decides by how dense the points are
            marker: {
                enabled: undefined
            }
        }
    }
}

export default options