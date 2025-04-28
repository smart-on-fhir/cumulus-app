import { memo, MouseEvent, useCallback, useEffect, useLayoutEffect, useRef } from "react"
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

function setGlobalTextColor(color?: string) {
    const el = document.getElementById("chart-text-color")! as HTMLStyleElement
    if (el) {
        if (color) {
            el.innerText = 
                `.main-chart .highcharts-container text { color: ${color} !important; fill: ${color} !important; }` +
                `.main-chart .highcharts-container svg * { color: ${color} !important; }` +
                `.main-chart .highcharts-container .highcharts-data-labels .highcharts-data-label > span { color: ${color} !important; }` +
                `.main-chart .highcharts-container .highcharts-legend-item-hidden > text { filter: grayscale(1) opacity(0.5) !important; }`;
            el.sheet!.disabled = false
        } else {
            el.sheet!.disabled = true
        }
    }
};

export default memo(Chart);

export function Chart(props: ChartProps) {
    const {
        loading,
        onInspectionChange,
        isDraft,
        options,
        contextMenuItems,
        visualOverrides: {
            enabled: overrideEnabled,
            brightness,
            contrast,
            saturation,
            fontColor,
            fontColorEnabled
        }
    } = props

    const containerRef = useRef<HTMLDivElement|null>(null);
    const chartRef     = useRef<Highcharts.Chart|null>(null);

    useEffect(() => {
        if (containerRef.current) {
            try {
                if (chartRef.current) {
                    defer(() => {
                        chartRef.current.update(options, true, true, false)
                        afterRender()
                    }, "main-chart", 0);
                } else {
                    chartRef.current = Highcharts.chart(containerRef.current, options, afterRender);
                }
            } catch (ex) {
                console.error(ex)
                containerRef.current.innerHTML = '<div><br/><p><b class="color-red">Error rendering chart. See console for details.</b></p><pre>'
                    + (ex as Error).message + 
                '</pre></div>'
            }
        }
    }, [
        overrideEnabled,
        brightness,
        contrast,
        saturation,
        fontColor,
        fontColorEnabled,
        options
    ]);

    useLayoutEffect(() => {
        window.addEventListener("transitionend", reflow)
        return () => {
            window.removeEventListener("transitionend", reflow)
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [])

    const reflow = () => {
        if (chartRef.current) {
            chartRef.current.reflow()
        }
    };

    const afterRender = () => {
        setGlobalTextColor(overrideEnabled && fontColorEnabled && fontColor)
    };

    const onMouseDown = useCallback((e: MouseEvent) => {
        if (containerRef.current && onInspectionChange) {
            let element = e.target as SVGElement | HTMLElement | null
            if (element) {
                let tag = Object.entries(INSPECTORS).find(([, selector]) => element!.matches(selector))?.[0]
                if (tag) {
                    onInspectionChange([tag], {})
                }
            }
        }
        containerRef.current.focus({ preventScroll: true })
    }, [onInspectionChange])
    
    return <div
        style={{ position: "relative", overflow: "hidden" }}
        className={ loading ? "loading" : undefined }
        onMouseDown={onMouseDown}>

        { isDraft && <div className="draft-label">DRAFT</div> }
        <div
            id="chart"
            className={ "main-chart" + (onInspectionChange ? " inspecting" : "") }
            tabIndex={0}
            ref={ containerRef }
            style={ overrideEnabled ?  { filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` } : undefined }
            onContextMenu={e => {

                // @ts-ignore
                let menuItems = [...(e.nativeEvent?.menuItems || [])];

                if (contextMenuItems) {
                    menuItems = menuItems.concat(contextMenuItems)
                }

                // @ts-ignore
                e.nativeEvent.menuItems = menuItems

                // @ts-ignore
                e.nativeEvent.context = { ...e.nativeEvent.context, chart: chartRef.current }
            }}
        />
        <div className="chart-loader"><Loader/></div>
    </div>
}
