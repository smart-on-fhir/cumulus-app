import Highcharts from "../../../highcharts";
import { useLayoutEffect, useRef } from 'react';


export default function Chart({ options, callback }: { options: Highcharts.Options, callback?: (chart: Highcharts.Chart) => void })
{
    const containerRef = useRef<HTMLDivElement|null>(null);
    const chartRef     = useRef<Highcharts.Chart|null>(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
            try {
                if (chartRef.current) {
                    chartRef.current.update(options, true, true, false)
                } else {
                    chartRef.current = Highcharts.chart(containerRef.current, options, callback);
                }
            } catch (ex) {
                console.error(ex)
                document.getElementById("flat-chart")!.innerHTML = '<div><br/><p><b class="color-red">Error rendering chart. See console for details.</b></p><pre>'
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

    return <div id="flat-chart" className="chart" ref={ containerRef } />
}

