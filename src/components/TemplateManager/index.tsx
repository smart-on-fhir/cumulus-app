import { useEffect, useMemo, useState } from "react"
import { Link }                         from "react-router-dom"
import html2canvas                      from "html2canvas"
import Loader                           from "../generic/Loader"
import { buildChartOptions }            from "../Dashboard/Charts/lib"
import { getDefaultChartOptions }       from "../Dashboard/Charts/DefaultChartOptions"
import Highcharts                       from "../../highcharts"
import { request }                      from "../../backend"
import { app }                          from "../../types"
import { humanizeColumnName }           from "../../utils"


async function getChartData(subscriptionId: number, column: string, signal: AbortSignal) {
    const base = process.env.REACT_APP_BACKEND_HOST || window.location.origin
    const url = new URL(`/api/requests/${subscriptionId}/api`, base)
    url.searchParams.set("column", column)
    return request(url.href, { signal })
}

async function renderChartAsPng(options: Highcharts.Options, signal: AbortSignal): Promise<string> {
    if (signal.aborted) {
        return Promise.reject(signal.reason)
    }
    return new Promise((resolve, reject) => {
        const container = document.createElement("div")
        Highcharts.chart(container, options, chart => {
            if (signal.aborted) {
                return reject(signal.reason)
            }
            html2canvas(chart.container, {
                scale: 1,
                logging: false,
                ignoreElements: el => el.classList.contains("highcharts-exporting-group")
            }).then(canvas => {
                const url = canvas.toDataURL("image/png");
                URL.revokeObjectURL(url);
                resolve(url);
            }, reject).finally(() => {
                chart.destroy()
                container.remove()
            })
        });
    })
}

export default function TemplateManager({ subscription }: { subscription: app.Subscription }) {
    return (
        <div className="template-manager">
            <div className="view-browser view-browser-column nested">
                { subscription.metadata?.cols.map((col, i) => {
                    return <Thumbnail key={i} col={col} sub={subscription} />
                }) }
            </div>
        </div>
    )
}

function Thumbnail({ col, sub }: { col: app.SubscriptionDataColumn, sub: app.Subscription }) {
    const [loading, setLoading] = useState(true)
    const [imgUrl , setImgUrl ] = useState("")
    const [error  , setError  ] = useState<Error | string | null>(null)
    const [chartType, setChartType] = useState<"spline" | "column" | "bar">(
        col.dataType === "float" ||
        col.dataType === "integer" ||
        col.dataType.startsWith("date")
     ? "spline" : "column");
    const isCountColumn = col.name.startsWith("cnt");
    const countLabel = sub.metadata?.cols.find(c => c.name === "cnt")?.label || "Counts"
    const abortController = useMemo(() => new AbortController(), [])

    const load = useMemo(() => async function () {
        setLoading(true)
        setError(null)
        try {
            const data = await getChartData(sub.id, col.name, abortController.signal)
            
            let _chartType = chartType
            if (chartType === "column" && data.rowCount > 20) {
                _chartType = "bar"
                setChartType(_chartType)
            }
                
            const defaults = getDefaultChartOptions(_chartType, {
                chart: {
                    width: 1500,
                    height: 1000
                },
                title: {
                    text: col.label
                },
                yAxis: {
                    title: {
                        text: countLabel
                    }
                }
            })

            // @ts-ignore
            const options = buildChartOptions({
                data,
                options         : defaults,
                type            : _chartType,
                column          : col,
                ranges          : { enabled: false },
                inspection      : { enabled: false, context: {selectedAnnotationIndex: -1, selectedPlotLineAxis: "", selectedPlotLineId: "", selectedSeriesId: ""}, match: [] },
                sortBy          : "x:asc",
                limit           : 0,
                offset          : 0,
                onSeriesToggle  : () => {},
                onInspectionChange: () => {}
            })

            const url = await renderChartAsPng(options, abortController.signal)
            setImgUrl(url)
        } catch (ex) {
            setError(ex as Error)
        } finally {
            setLoading(false)
        }
    }, [chartType, col, sub.id, abortController.signal, countLabel])
    
    useEffect(() => { 
        if (!isCountColumn) {
            load()
        }
    }, [load, isCountColumn, abortController])

    useEffect(() => { 
        return () => {
            abortController.abort("Operation aborted because the component is unmounting")
        }
    }, [abortController])

    if (isCountColumn) {
        return null
    }

    
    let counted = countLabel

    if (sub.dataURL) {
        const pkgName = sub.dataURL.split("__")[1];
        if (pkgName) {
            counted = humanizeColumnName(pkgName)
        }
    } else if (sub.name.includes("__")) {
        const pkgName = sub.name.replace(/(core__)+/, "core__").split("__")[1];
        if (pkgName) {
            counted = humanizeColumnName(pkgName)
        }
    }

    const label = counted + " by " + col.label
    const description = sub.name + ": " + label

    return (
        <Link className="view-thumbnail" to="create-view" state={{ column: col.name, chartType, name: label, description, countLabel }}>
            <div className="view-thumbnail-image center" style={{ aspectRatio: "30/19", position: "relative", placeContent: "center" }}>
                { loading && <Loader msg="" style={{ zIndex: 2 }} /> }
                { error && <small className="color-red" style={{ wordBreak: "break-all" }}>{ error + "" }</small> }
                { !loading && imgUrl && <>
                    <img src={imgUrl} alt="Thumbnail Preview" />
                </> }
            </div>
            <div className="view-thumbnail-title" title={label}>
                <b>{ label }</b>
                <div className="view-thumbnail-description color-muted">
                    { description }
                </div>
            </div>
        </Link>
    )
}
