import React, { MouseEvent } from "react"
import { INSPECTORS }        from "../config"
import Loader                from "../../generic/Loader"
import { MenuItemConfig }    from "../../generic/Menu"
import Highcharts            from "../../../highcharts"
import { defer  }            from "../../../utils"
import { app }               from "../../../types"


interface ChartProps {
    options : Highcharts.Options
    loading?: boolean
    contextMenuItems?: (MenuItemConfig | string)[]
    visualOverrides: app.VisualOverridesState
    onInspectionChange?: (result: string[], ctx: Partial<app.InspectionContext>) => void
    isDraft?: boolean
}

export default class Chart extends React.Component<ChartProps>
{
    chart: any;

    constructor(props: ChartProps) {
        super(props);
        this.updateChart = this.updateChart.bind(this);
    }

    afterRender() {
        const {
            enabled,
            brightness,
            contrast,
            saturation,
            fontColor,
            fontColorEnabled
        } = this.props.visualOverrides
        
        if (enabled) {
            this.chart.container.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
            const el = document.getElementById("chart-text-color")! as HTMLStyleElement
            if (el) {
                el.innerText = fontColor && fontColorEnabled ? 
                    `.main-chart .highcharts-container text { color: ${fontColor} !important; fill: ${fontColor} !important; }` +
                    `.main-chart .highcharts-container svg * { color: ${fontColor} !important; }` +
                    `.main-chart .highcharts-container .highcharts-data-labels .highcharts-data-label > span { color: ${fontColor} !important; }` +
                    `.main-chart .highcharts-container .highcharts-legend-item-hidden > text { filter: grayscale(1) opacity(0.5) !important; }` :
                    ""
                el.sheet!.disabled = false
            }
        } else {
            this.chart.container.style.filter = "none"
            const el = document.getElementById("chart-text-color")! as HTMLStyleElement
            if (el) {
                el.sheet!.disabled = true
            }
        }
    }

    updateChart() {
        try {
            // update(options [, redraw] [, oneToOne] [, animation])
            this.chart.update(this.props.options, !this.props.loading, true, false)
            this.afterRender()
        } catch (e) {
            console.debug(e)
        }
    }

    componentDidMount() {
        this.chart = Highcharts.chart("chart", this.props.options || {});
        Highcharts.charts = [this.chart]
        this.afterRender()
    }

    onMouseDown(e: MouseEvent) {
        if (this.props.onInspectionChange) {
            let element = e.target as SVGElement | HTMLElement | null
            if (element) {
                let tag = Object.entries(INSPECTORS).find(([, selector]) => element!.matches(selector))?.[0]
                if (tag) {
                    this.props.onInspectionChange([tag], {})
                }
            }
        }
        document.getElementById("chart")?.focus({ preventScroll: true })
    }

    componentDidUpdate() {
        // The UI can generate too frequent state updates in some cases (for
        // example via color pickers). Using defer here allows us to skip
        // some needless re-rendering 
        defer(this.updateChart, "main-chart");
    }

    render() {
        const { loading, onInspectionChange, isDraft } = this.props
        return <div style={{ position: "relative", overflow: "hidden" }} className={ loading ? "loading" : undefined } onMouseDown={ e => this.onMouseDown(e) }>
            { isDraft && <div className="draft-label">DRAFT</div> }
            <div id="chart" className={ "main-chart" + (onInspectionChange ? " inspecting" : "") } tabIndex={0} onContextMenu={e => {

                // @ts-ignore
                let menuItems = [...(e.nativeEvent?.menuItems || [])];

                if (this.props.contextMenuItems) {
                    menuItems = menuItems.concat(this.props.contextMenuItems)
                }

                // @ts-ignore
                e.nativeEvent.menuItems = menuItems

                // @ts-ignore
                e.nativeEvent.context = { ...e.nativeEvent.context, chart: this.chart }
            }}/>
            <div className="chart-loader"><Loader/></div>
        </div>
    }
}
