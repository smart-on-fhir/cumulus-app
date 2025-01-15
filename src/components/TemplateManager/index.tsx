import { useEffect, useMemo, useState } from "react"
import { Link }                         from "react-router-dom"
import html2canvas                      from "html2canvas"
import Loader                           from "../generic/Loader"
import { buildChartOptions }            from "../Dashboard/Charts/lib"
import { getDefaultChartOptions }       from "../Dashboard/Charts/DefaultChartOptions"
import Highcharts                       from "../../highcharts"
import { request }                      from "../../backend"
import { app }                          from "../../types"
import "./TemplateManager.scss"


async function getChartData(subscriptionId: number, column: string) {
    const base = process.env.REACT_APP_BACKEND_HOST || window.location.origin
    const url = new URL(`/api/requests/${subscriptionId}/api`, base)
    url.searchParams.set("column", column)
    return request(url.href)
}

async function renderChartAsPng(options: Highcharts.Options): Promise<string> {
    return new Promise((resolve, reject) => {
        const container = document.createElement("div")
        Highcharts.chart(container, options, chart => {
            html2canvas(chart.container, {
                scale: 1,
                logging: false,
                ignoreElements: el => el.classList.contains("highcharts-exporting-group")
            }).then(canvas => {
                const url = canvas.toDataURL("image/png");
                URL.revokeObjectURL(url);
                chart.destroy()
                container.remove()
                resolve(url);
            }, reject)
        });
    })
}

export default function TemplateManager({ subscription }: { subscription: app.Subscription }) {
    return (
        <div className="template-manager">
            <h5 className="color-blue-dark">Templates</h5>
            <hr />
            <div className="view-browser view-browser-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(12rem, 1fr))"}}>
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

    const load = useMemo(() => async function () {
        setLoading(true)
        setError(null)
        try {
            const data = await getChartData(sub.id, col.name)
            
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

            const url = await renderChartAsPng(options)
            setImgUrl(url)
        } catch (ex) {
            setError(ex as Error)
        } finally {
            setLoading(false)
        }
    }, [chartType, col, sub.id])
    
    useEffect(() => { 
        if (!isCountColumn) {
            load()
        }
    }, [load, isCountColumn])

    if (isCountColumn) {
        return null
    }

    return (
        <Link className="view-thumbnail" to="create-view" state={{ column: col.name, chartType, name: col.label, description: `Counts by ${ col.label }` }}>
            <div className="view-thumbnail-image center" style={{ aspectRatio: "30/19", position: "relative", placeContent: "center" }}>
                { loading && <Loader msg="" style={{ zIndex: 2 }} /> }
                { error && <small className="color-red" style={{ wordBreak: "break-all" }}>{ error + "" }</small> }
                { !loading && imgUrl && <>
                    <img src={imgUrl} alt="Thumbnail Preview" />
                    <div className="thumbnail-buttons-overlay">
                        <b className="btn"><i className="fa fa-pencil"/></b>
                        <b className="btn"><i className="fa fa-plus"/></b>
                    </div>
                </> }
            </div>
            <div className="view-thumbnail-title">
                <b>{ col.label }</b>
                <div className="view-thumbnail-description color-muted">
                    Counts by { col.label }
                </div>
            </div>
        </Link>
    )
}
