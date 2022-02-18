import { Chart } from "./Chart";


export default function BaseChart({ options }: { options: Highcharts.Options })
{
    return <Chart id="chart" chartOptions={{
        title: {
            text: "",
        },
        legend: {
            enabled: true
        },
        colors: [
            "#f66",
            "#ea5",
            "#dd0",
            "#ae0",
            "#5d0",
            "#2ee",
            "#8af",
            "#96f",
            "#c6f",
            "#f6f",

            "#c44",
            "#cb4",
            "#9b0",
            "#3a0",
            "#3ab",
            "#2bb",
            "#658",
            "#65d",
            "#b5e",
            "#c4c",

            "#d88",
            "#cc3",
            "#9a0",
            "#6b0",
            "#3b6",
            "#3d9",
            "#476",
            "#779",
            "#b7a",
            "#c69",
            
            '#a66',
            '#796',
            '#669',
            '#C66',
            '#6C6',
            '#66C',
            '#F66',
            '#6F6',
            '#63F',
            '#933',
            '#396',
            '#339',


            // "#058DC7",
            // "#50B432",
            // "#ED561B",
            // "#c2c508",
            // "#24CBE5",
            // "#38c548",
            // "#FF9655",
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
        },
        tooltip: {
        //     shared: false,
            useHTML: true,
            // headerFormat: '<table><tr><th colspan="2">{point.name}: {point.key}</th></tr>',
            // pointFormat: '<tr><td style="color: {series.color}">{series.name} </td>' +
                // '<td style="text-align: right"><b>{point.y} EUR</b></td></tr>',
            // footerFormat: '</table>',
            // valueDecimals: 2,
            ...options.tooltip
        },
    }} />
}