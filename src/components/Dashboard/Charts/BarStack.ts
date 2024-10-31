import { Options } from "highcharts";

const options: Options = {
    chart: {
        type: "bar",
        animation: {
            duration: 0,
            defer: 0,
        },
        options3d: {
            enabled: false
        }
    },
    plotOptions: {
        bar: {
            stacking: "normal",
            animation: false
        }
    },
    yAxis: {
        title: {
            text: "Count"
        }
    }
}

export default options