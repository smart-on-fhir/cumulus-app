import { Options } from "highcharts";

const options: Options = {
    chart: {
        type: "pie",
        options3d: {
            enabled: false
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