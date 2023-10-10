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
            innerSize: "50%",
            slicedOffset: 10
        }
    },
    xAxis: {
        lineWidth: 0
    }
}

export default options