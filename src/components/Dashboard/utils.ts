import { SupportedChartTypes } from "./config"

export function generateSeries(
    type: keyof typeof SupportedChartTypes,
    data: Record<string, any>,
    groupBy?: app.DataRequestDataColumn | null
): Highcharts.SeriesOptionsType[]
{
    const series: Highcharts.SeriesOptionsType[] = []

    if (groupBy) {
        for (let dimension1 in data) {
            const _data = []
            for (let dimension2 in data[dimension1]) {
                _data.push({
                    name: dimension2 === "null" ? "Unknown" : dimension2,
                    type,
                    y: data[dimension1][dimension2]
                })
            }
            series.push({
                // @ts-ignore
                type,
                // @ts-ignore
                depth: 50,
                name: dimension1 === "null" ? "Unknown" : dimension1,
                centerInCategory: true,
                data: _data//.sort((a, b) => a.y === b.y ? a.name.localeCompare(b.name) : a.y - b.y)
            })
        }    
    }
    else {
        series.push({
            // @ts-ignore
            type,
            name: "Count",
            data: Object.keys(data).map((groupName, i) => {
                let label = groupName === "null" ? "Unknown" : groupName
                return {
                    name: label,
                    y: data[groupName]["<sum>"]
                }
            })
        })
    }
    
    return series;
}

// downloadBase64File(contentType:any, base64Data:any, fileName:any)
// {
//     const linkSource = `data:${contentType};base64,${base64Data}`;
//     const downloadLink = document.createElement("a");
//     downloadLink.href = linkSource;
//     downloadLink.download = fileName;
//     downloadLink.click();
// }