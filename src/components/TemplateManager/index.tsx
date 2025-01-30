import { useEffect, useMemo, useState }  from "react"
import { Link }                          from "react-router-dom"
import Loader                            from "../generic/Loader"
import { buildChartOptions }             from "../Dashboard/Charts/lib"
import { getDefaultChartOptions }        from "../Dashboard/Charts/DefaultChartOptions"
import { COLOR_THEMES }                  from "../Dashboard/config"
import Highcharts                        from "../../highcharts"
import { request }                       from "../../backend"
import { app }                           from "../../types"
import { humanizeColumnName, pluralize } from "../../utils"


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
            const svg = chart.container.querySelector("svg")?.outerHTML!
            chart.destroy()
            container.remove()
            resolve("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg))
            // html2canvas(chart.container, {
            //     scale: 1,
            //     logging: false,
            //     ignoreElements: el => el.classList.contains("highcharts-exporting-group")
            // }).then(canvas => {
            //     const url = canvas.toDataURL("image/png");
            //     URL.revokeObjectURL(url);
            //     resolve(url);
            // }, reject).finally(() => {
            //     chart.destroy()
            //     container.remove()
            // })
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
    const [limit  , setLimit  ] = useState(0)
    const [sortBy , setSortBy ] = useState("x:asc")
    const [theme  , setTheme  ] = useState("sas_light")
    const [chartType, setChartType] = useState<"spline" | "column" | "bar">(
        col.dataType === "float" ||
        col.dataType === "integer" ||
        col.dataType.startsWith("date")
     ? "spline" : "column");
    const isCountColumn = col.name.startsWith("cnt");
    const countLabel = humanizeColumnName(sub.metadata?.cols.find(c => c.name === "cnt")?.label || "Counts")
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
            
            // No limit for lines and up to 30 bars/columns
            if (chartType !== "spline" && data.rowCount > 30) {
                setLimit(30)
                setSortBy("y:desc")
            }

            if (chartType === "spline") {
                setTheme("sas_dark")
            }

            const colors = COLOR_THEMES.find(t => t.id === "sas_light")!.colors
                
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
                },
                colors,

                // @ts-ignore
                custom: { theme }
            })

            // @ts-ignore
            const options = buildChartOptions({
                data,
                options         : defaults,
                type            : _chartType,
                column          : col,
                ranges          : { enabled: false },
                inspection      : { enabled: false, context: {selectedAnnotationIndex: -1, selectedPlotLineAxis: "", selectedPlotLineId: "", selectedSeriesId: ""}, match: [] },
                sortBy,
                limit,
                offset          : 0,
                onSeriesToggle  : () => {},
                onInspectionChange: () => {},
            })

            const url = await renderChartAsPng(options, abortController.signal)
            setImgUrl(url)
        } catch (ex) {
            setError(ex as Error)
        } finally {
            setLoading(false)
        }
    }, [chartType, col, sub.id, abortController.signal, countLabel, limit, sortBy, theme])
    
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

    let counted = pluralize(getSubject(sub));
    let description: string, label: string; 

    if (limit) {
        label = `Top ${limit} ${counted.replace(/^counts?\s/i, "")} by ${col.label}`
        description = `Generated from the "${sub.name}" data source to show ${label.toLowerCase()}.`
    } else {
        label = `Count ${counted.replace(/^counts?\s/i, "")} by ${col.label}`
        description = `Generated from the "${sub.name}" data source to ${label.toLowerCase()}.`
    }

    return (
        <Link className="view-thumbnail" to="create-view" state={{
            column: col.name,
            chartType,
            name: label,
            description, countLabel,
            limit,
            sortBy,
            theme,
            colors: COLOR_THEMES.find(t => t.id === theme)!.colors
        }}>
            <div className="view-thumbnail-image center" style={{ aspectRatio: "30/19", position: "relative", placeContent: "center" }} data-tooltip={`<img src=${imgUrl || "about:blank"} alt="Chart Preview" style="display:block" />`}>
                { loading && <Loader msg="" style={{ zIndex: 2 }} /> }
                { error && <small className="color-red" style={{ wordBreak: "break-all" }}>{ error + "" }</small> }
                { !loading && imgUrl && <>
                    <img src={imgUrl || "about:blank"} alt="Thumbnail Preview" loading="lazy" />
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

function getSubject(dataSource: app.Subscription) {
    let subject = getSubjectFromMetadata(dataSource)
    if (!subject) {
        subject = getSubjectFromDataUrl(dataSource)
    }
    if (!subject) {
        subject = getSubjectFromDataSourceName(dataSource)
    }
    return subject || "Count"
}

function getSubjectFromMetadata(dataSource: app.Subscription) {
    return String(dataSource.metadata?.cols.find(c => c.name === "cnt")?.label || "").replace(/^counts?\s*/i, "")
}

function getSubjectFromDataUrl(dataSource: app.Subscription) {
    if (dataSource.dataURL) {
        return parsePackageName(dataSource.dataURL)
    }
    return ""
}

function getSubjectFromDataSourceName(dataSource: app.Subscription) {
    if (dataSource.name.includes("__")) {
        return parsePackageName(dataSource.name)
    }
    return ""
}

function parsePackageName(name: string) {
    const pkgName = name.replace(/(core__)+/, "core__");
    const match = pkgName.match(/^(\w+)__count_([^_]+)./)
    if (match && match[2]) {
        return humanizeColumnName(match[2])
    }
    return humanizeColumnName(pkgName)
}
