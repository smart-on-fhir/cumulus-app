import { Command } from "../Command"
import Highcharts  from "../../highcharts"


export class ToggleFullscreen extends Command
{
    label() {
        return "Toggle Fullscreen"
    }

    icon() {
        return <span className="material-icons-round">fullscreen</span>
    }

    available() {
        return !!Highcharts.charts[Highcharts.charts.length-1]?.fullscreen
    }

    execute() {
        Highcharts.charts[Highcharts.charts.length-1]!.fullscreen!.toggle()
    }
}
