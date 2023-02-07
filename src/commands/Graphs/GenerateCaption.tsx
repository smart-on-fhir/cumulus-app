import { ViewState } from "../../components/Dashboard"
import { Command }  from "../Command"


export class GenerateCaption extends Command
{
    private chartOptions: Highcharts.Options
    private state: ViewState
    private dispatch: (caption: string) => void
    
    constructor(chartOptions: Highcharts.Options, state: ViewState, dispatch: (caption: string) => void) {
        super()
        this.chartOptions = chartOptions
        this.state        = state
        this.dispatch     = dispatch
    }

    label() {
        return "Generate Caption Template"
    }

    description() {
        return "Generate an HTML Caption for this chart based on the current chart settings. Once created, you can further edit this caption."
    }

    icon() {
        return <span className="material-icons-round">closed_caption</span>
    }

    available() {
        return !!this.chartOptions;
    }

    enabled() {
        return !!this.chartOptions.series?.length;
    }

    private generateBullet(color: any) {
        let s = `<b class="caption-bullet" style="background:`
        if (typeof color === "string") {
            s += `${color}"></b>`
        }
        else if (Array.isArray(color.stops)) {
            s += `linear-gradient(${color.stops.map((a: any) => a[1]).join(",")})"></b>`
        }
        else {
            s += `transparent"></b>`
        }
        return s;
    }

    private generateCaption() {

        if (this.chartOptions.series?.[0]?.type === "pie") {

            let s = "";

            this.chartOptions.series![0].data!.forEach((x: any, i) => {
                const color = this.chartOptions.colors![this.chartOptions.colors!.length % i];
                s += `<div>${this.generateBullet(color)} `
                let name  = this.chartOptions.series![0]!.name!;
                let value = x.name
                if (value && value.toLowerCase() === name.toLowerCase()) {
                    value = ""
                }
                s += `${name}${value ? " = " + value : ""}</div> `
            })

            return s;
        }

        const { viewColumn, denominator, column2, viewGroupBy } = this.state;

        let s  = `<div><b>X Axis:</b> ${viewColumn.label}${viewColumn.description && viewColumn.description.toLowerCase() !== viewColumn.label.toLowerCase() ? " - " + viewColumn.description : ""}</div>`
            s += `<div><b>Y Axis:</b> ${denominator === "local" ? "% of total count for each group" : denominator === "global" ? "% of total count" : "Aggregate Count"}</div>`
        
        this.chartOptions.series!.forEach((ser: any) => {
            
            s += `<div>${this.generateBullet(ser.color)} `

            if (column2 && ser.id?.startsWith("secondary-")) {
                s += `${column2.label} = ${ser.name}`
            } else {
                let name  = viewGroupBy?.label || viewColumn.label;
                let value = ser.name
                if (value && value.toLowerCase() === name.toLowerCase()) {
                    value = ""
                }
                s += `${name}${value ? " = " + value : ""}`
            }

            s += `</div> `
        })

        return s
    }
    
    execute() {
        
        const caption = this.generateCaption()
        this.dispatch(caption)
        // @ts-ignore
        setTimeout(() => document.querySelector(".chart-caption")?.focus(), 100)
    }
}
