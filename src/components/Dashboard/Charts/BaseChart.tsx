import { Chart } from "./Chart";


export default function BaseChart({ options }: { options: Highcharts.Options })
{
    return <Chart id="chart" chartOptions={{
        title: {
            text: "",
        },
        colors: [
            "#058DC7",
            "#50B432",
            "#ED561B",
            "#c2c508",
            "#24CBE5",
            "#38c548",
            "#FF9655",
            // "#eede2e",
            // "#3cebaa",
            // "#235bf7",
            // "#329614",
            // "#c93e07",
            // "#81830b",
            // "#0d96ac",
            // "#008610",
            // "#df6e29",
            // "#c5b500",
            // "#2daf80",
        ],
        ...options,
        chart: {
            height: "60%",
            ...options.chart
        }
    }} />
}