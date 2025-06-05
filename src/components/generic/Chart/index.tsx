import { useEffect, useRef } from "react"
import Highcharts            from "../../../highcharts"
import { classList }         from "../../../utils"


export default function Chart({
    options,
    callback,
    containerProps = {}
}: {
    options: Highcharts.Options
    callback?: (chart: Highcharts.Chart) => void
    containerProps?: React.HTMLAttributes<HTMLDivElement>
})
{
    const containerRef = useRef<HTMLDivElement|null>(null);
    const chartRef     = useRef<Highcharts.Chart|null>(null);

    const reflow = () => {
        if (chartRef.current) {
            chartRef.current.reflow()
        }
    };

    useEffect(() => {
        if (containerRef.current) {
            try {
                if (chartRef.current) {
                    chartRef.current.update(options, true, true, false)
                } else {
                    chartRef.current = Highcharts.chart(containerRef.current, options);
                }
                callback?.(chartRef.current)
            } catch (ex) {
                console.error(ex)
                containerRef.current.innerHTML = '<div><br/><p><b class="color-red">Error rendering chart. See console for details.</b></p><pre>'
                    + (ex as Error).message + 
                '</pre></div>'
            }
        }
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [options])

    useEffect(() => {
        window.addEventListener("transitionend", reflow)
        return () => {
            window.removeEventListener("transitionend", reflow)
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [])

    const { className, ...props } = containerProps

    return <div
        { ...props }
        className={ classList({ [className]: true, chart: true }) }
        ref={ containerRef }
    />
}