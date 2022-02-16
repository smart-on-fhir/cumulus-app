import { SupportedChartTypes, SimpleCharts } from "./config"
import Highcharts from "highcharts"

const COLORS = [
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
];

function walk<T=any>(
    obj: Record<string, T>,
    cb: (value: T, key: string, index: number) => void
): void
{
    Object.keys(obj)
    // .sort((a, b) => a.localeCompare(b))
    .forEach((key, index) => cb(obj[key], key, index));
}

export function generateSeries(
    type: keyof typeof SupportedChartTypes,
    column: app.DataRequestDataColumn,
    data: Record<string, any>,
    groupBy?: app.DataRequestDataColumn | null
): Highcharts.SeriesOptionsType[]
{
    const series: Highcharts.SeriesOptionsType[] = []

    // console.log(data)

    if (groupBy) {

        // For each group - natural order, no sorting needed
        walk(data, (group, dimension1, index) => {
            
            // Create data group
            const _data: any[] = [];

            // Add group data
            walk(group, (y, dimension2, index2) => {
                _data.push({
                    name: dimension2 || "Unknown",
                    // id: `${type}-${dimension1}-${dimension2}`,
                    // id: `group-${index}-${index2}`,
                    type,
                    // colorByPoint: true,
                    // color: COLORS[index],
                    // x: index2,
                    y,
                    // showInLegend: true,
                    
                })
            })

            // Add group
            series.push({
                // @ts-ignore
                type,
                // id: `group-${index}`,//`${type}-${dimension1}`,
                // @ts-ignore
                depth: 50,
                name: dimension1 || "Unknown",
                
                // When true, the columns will center in the category, ignoring
                // null or missing points. When false, space will be reserved
                // for null or missing points.
                // centerInCategory: true,

                color: COLORS[index],
                // @ts-ignore
                edgeColor: "rgba(0, 0, 0, 0.1)",
                dataSorting: {
                    enabled: groupBy.dataType === "string",
                    matchByName: false,
                    // sortKey: "name"
                },
                // showCheckbox: true,
                // showInLegend: false,

                tooltip: {
                    headerFormat: `<table><tr><td style="text-align: right">${groupBy.label}: </td><td><b>{point.key}</b></td></tr>`,
                    pointFormat :        `<tr><td style="text-align: right">${column.label}: </td><td><b>{series.name}</b></td></tr>` +
                                         `<tr><td style="text-align: right">Count: </td><td><b>{point.y}</b></td></tr>`,
                    footerFormat: '</table>',
                },

                // data: _data//.sort((a, b) => a.y === b.y ? a.name.localeCompare(b.name) : a.y - b.y)
                data: _data//.sort((a, b) => a.y - b.y)
            })
        })

        // series.sort((a, b) => String(a.name).localeCompare(String(b.name)))
    }

    else {
        series.push({
            // @ts-ignore
            type,
            name: column.label,//"Count",
            custom: {
                label: column.label
            },
            tooltip: {
                headerFormat: `<table><tr><td style="text-align: right">{series.name}:</td><td><b>{point.key}</b></td></tr>`,
                pointFormat : `<tr><td style="text-align: right">Count:</td><td><b>{point.y}</b></td></tr>`,
                footerFormat: '</table>',
            },
            color: COLORS[4],
            // @ts-ignore
            edgeColor: "rgba(0, 0, 0, 0.1)",
            // showInLegend: false,
            dataSorting: {
                enabled: column.dataType === "string",
                matchByName: false,
                // sortKey: "name"
            },
            data: Object.keys(data).map((groupName, i) => {
                let label = groupName === "null" || groupName === "" ? "Unknown" : groupName
                return {
                    name: label,
                    color: SimpleCharts.includes(type) ? COLORS[i] : COLORS[4],
                    y: data[groupName]["<sum>"]
                }
            })
        })
    }
    // console.log(series)
    return series;
}

