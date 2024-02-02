import { Command } from "../Command"
import Highcharts  from "../../highcharts"


export class PrintChart extends Command
{
    label() {
        return "Print Chart"
    }

    icon() {
        return <span className="material-icons-round">print</span>
    }

    available() {
        return Highcharts.charts.length > 0
    }

    execute() {
        Highcharts.charts[Highcharts.charts.length-1]!.print()
    }
}
