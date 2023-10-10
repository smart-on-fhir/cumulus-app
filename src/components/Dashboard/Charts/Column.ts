import { Options } from "highcharts";

const options: Options = {
    chart: {
        type: "column",
        options3d: {
            enabled: false
        }
    },
    plotOptions: {
        column: {
            stacking: undefined
        }
    }
}

export default options