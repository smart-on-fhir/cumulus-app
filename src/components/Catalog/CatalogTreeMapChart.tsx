import MAPPING from "./DataMapping";

export function catalogTreeMapChartOptions({ data, search, title }: { data: Record<string, any>[], search?: string, title: string })
{
    if (!data.length) {
        return search ? 
            <div className="color-brand-2 p-1">No results found matching your search</div> :
            <div className="color-brand-2 p-1">No data found</div>
    }

    const {
        count,
        description,
        stratifier = ""
    } = MAPPING;

    const seriesData = []
    let min =  Infinity
    let max = -Infinity
    
    data.forEach(row => {
        seriesData.push({
            id    : row.id + "",
            name  : row.display,
            parent: row.pid ? row.pid + "" : undefined,
            value : row.cnt,
            custom: {
                data: {
                    stratifier: stratifier? row[stratifier] : "",
                    Count: row[count],
                    Description: row[description]
                }
            }
        })

        if (row.pid) {
            if (row.cnt > max) max = row.cnt
            if (row.cnt < min) min = row.cnt
        }
    })

    const options: Highcharts.Options = {
        chart: {
            style: {
                fontSize  : "15px",
                fontFamily: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
                color     : "#222"
            },
            backgroundColor: "#FFF",
            spacingTop     : 20,
            spacingBottom  : 20,
            spacingLeft    : 20,
            spacingRight   : 20,
            animation      : false,
        },
        colorAxis: {
            min: min,
            max: max,
            maxColor: "#FA8",
            minColor: "#9CF"
        },
        title: {
            text: ""
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        tooltip: {
            style: {
                fontSize: "1em",
                whiteSpace: "normal"
            },
            useHTML: true,
            borderColor: "#000",
            backgroundColor: "#FFFE",
            formatter() {
                // @ts-ignore
                let out = `<b class="color-orange">◉</b> <b>${this.point.name}</b> <b class="badge bg-orange">${
                    // @ts-ignore    
                    Number(this.point.custom.data.Count).toLocaleString()}</b><hr style="margin: 8px 0" />`

                return out + `<div style="min-width:200px;white-space:normal">${
                    // @ts-ignore
                    search ? highlight(this.point.custom.data.Description, search, true).join("") : this.point.custom.data.Description
                }</div>`
            }
        },
        navigation: {
            breadcrumbs: {
                relativeTo: "spacingBox",
                buttonSpacing: 5,
                buttonTheme: {
                    fill: "#EEE",
                    style: {
                        padding: "2px"
                    }
                },
                position: {
                    align: "left",
                    verticalAlign: "top",
                    x: 14,
                    y: 16
                }
            },
        },
        series: [{
            type: 'treemap',
            name: title,
            allowTraversingTree: true,
            interactByLeaf: false,
            levelIsConstant: false,
            alternateStartingDirection: true,
            turboThreshold: 10000,
            layoutAlgorithm: 'squarified',
            colorByPoint: true,
            borderColor: "#0002",
            colorAxis: 0,
            colorKey: "value",
            clip: false,
            animation: false,
            dataLabels: {
                inside: true,
                crop: true,
                overflow: "allow",
                enabled: false,
                style: {
                    fontWeight: '600',
                    color: "#000C",
                    textOutline: "1px solid #FFF8",
                    fontSize: "1em",
                    textAlign: "center",
                    zIndex: 0
                }
            },
            
            levels: [
                {
                    level      : 1,
                    borderColor: "#000",
                    dataLabels: {
                        enabled: true,
                    },
                }
            ],
            data: seriesData
        }]
    }

    return options
}