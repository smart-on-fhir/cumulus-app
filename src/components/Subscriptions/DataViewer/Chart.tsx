import Highcharts from "../../../highcharts";
import { useLayoutEffect, useRef } from 'react';


export default function Chart({ options }: { options: Highcharts.Options })
{
    const containerRef = useRef<HTMLDivElement|null>(null);
    const chartRef     = useRef<Highcharts.Chart|null>(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
            if (chartRef.current) {
                chartRef.current.update(options, true, true, false)
            } else {
                chartRef.current = Highcharts.chart(containerRef.current, options);
            }
        }
        return () => {
            if (chartRef.current) {
              chartRef.current.destroy();
              chartRef.current = null;
            }
        };
    }, [options])

    return <div className="chart" ref={ containerRef } />
}

