import { useEffect, useReducer }         from "react"
import Link                              from "../Link"
import Loader                            from "../generic/Loader"
import { buildChartOptions }             from "../Dashboard/Charts/lib"
import { getDefaultChartOptions }        from "../Dashboard/Charts/DefaultChartOptions"
import { COLOR_THEMES }                  from "../Dashboard/config"
import Highcharts                        from "../../highcharts"
import { request }                       from "../../backend"
import { app }                           from "../../types"
import { humanizeColumnName, pluralize } from "../../utils"
import { FhirResourceTypes }             from "../../config"
import Terminology                       from "../../Terminology"
import { DataPackage }                   from "../../Aggregator"


async function getChartData(subscriptionId: number | string, column: string, signal: AbortSignal) {
    const base = process.env.REACT_APP_BACKEND_HOST || window.location.origin
    const url = new URL(
        typeof subscriptionId === "number" ?
            `/api/requests/${subscriptionId}/api` :
            `/api/requests/pkg-api?pkg=${encodeURIComponent(subscriptionId)}`,
        base
    )
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
            const svgEl = chart.container.querySelector("svg")!
            // @ts-ignore
            // svgEl.style["webkit-font-smoothing"] = "antialiased";
            const svg = svgEl.outerHTML!
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
            <div className="view-browser view-browser-flex">
                <Templates subscription={subscription} />
            </div>
        </div>
    )
}

export function Templates({ subscription }: { subscription: app.Subscription }) {
    return <>{ subscription.metadata?.cols.filter(col => col.dataType !== "hidden" && !col.name.startsWith("cnt")).map((col, i) => {
        return <Thumbnail key={i} col={col} sub={subscription} />
    })}</>
}

export function PackageTemplates({ pkg }: { pkg: DataPackage }) {
    return (
        <div className="template-manager">
            <div className="view-browser view-browser-flex">
                { Object.keys(pkg.columns).filter(name => !name.startsWith("cnt")).map((col, i) => {
                    return <Thumbnail key={i} col={{
                        dataType   : pkg.columns[col]
                            .replace("year" , "date:YYYY")
                            .replace("month", "date:YYYY-MM")
                            .replace("week" , "date:YYYY-MM-DD")
                            .replace("day"  , "date:YYYY-MM-DD") as app.SubscriptionDataColumn["dataType"],
                        name       : col,
                        label      : humanizeColumnName(col),
                        description: humanizeColumnName(col)
                    }}
                    sub={{
                        id  : pkg.id as any,
                        name: humanizeColumnName(pkg.name)
                    } as app.Subscription} />
                }) }
            </div>
        </div>
    )
}

interface State {
    chartType  : "areaspline" | "spline" | "column" | "bar"
    limit      : number
    sortBy     : "x:asc" | "x:desc" | "y:asc" | "y:desc"
    theme      : "sas_light" | "sas_dark"
    countLabel : string
    counted    : string
    imgUrl     : string
    label      : string
    description: string
    data       : app.ServerResponses.DataResponse
    loading    : boolean
    error      : Error | string | null
}

function reducer(state: State, payload: Partial<State>): State {
    return { ...state, ...payload };
}

function useDataLoader(sub: app.Subscription, col: app.SubscriptionDataColumn): State {

    const counted    = pluralize(getSubject(sub))
    const countLabel = counted.match(/^counts?/i) ? counted : `Count ${counted}`

    const [state, dispatch] = useReducer(reducer, {
        chartType: (col.dataType === "float" || col.dataType === "integer" || col.dataType.startsWith("date")) ? "areaspline" : "column",
        limit      : 0,
        sortBy     : "x:asc",
        theme      : "sas_light",
        data       : {} as any,
        countLabel,
        counted,
        imgUrl     : "",
        label      : `${countLabel} by ${col.label}`,
        description: "",
        loading    : true,
        error      : null
    });

    useEffect(() => {

        let abortController = new AbortController()

        const timer = setTimeout(() => abortController.abort("Operation timed out"), 20_000)

        getChartData(sub.id, col.name, abortController.signal)
        .then(data => {

            let chartType = state.chartType
            let limit     = state.limit
            let sortBy    = state.sortBy
            let theme     = state.theme

            if (chartType === "column" && data.rowCount > 20) {
                chartType = "bar"
            }
            
            // No limit for lines and up to 30 bars/columns
            if (!chartType.includes("line") && data.rowCount > 30) {
                limit = 30
                sortBy = "y:desc"
            }

            if (chartType === "areaspline") {
                theme = "sas_dark"
            }

            const colors = COLOR_THEMES.find(t => t.id === "sas_light")!.colors
            
            const defaults = getDefaultChartOptions(chartType, {
                chart: {
                    width        : 1500,
                    height       : 900,
                    spacingLeft  : 10,
                    spacingBottom: 10,
                    spacingRight : 10,
                    spacingTop   : 10
                },
                exporting: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: col.label,
                    margin: 10,
                    style: {
                        fontSize: "36px",
                        color: "#555"
                    }
                },
                yAxis: {
                    title: {
                        text: ""
                    },
                    labels: {
                        style: {
                            fontSize: "30px"
                        }
                    }
                },
                xAxis: {
                    labels: {
                        padding: 16,
                        style: {
                            fontSize: "30px"
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    column: {
                        groupPadding: 0.1,
                        pointPadding: 0.1,
                        minPointLength: 4,
                    },
                    bar: {
                        groupPadding: 0.1,
                        pointPadding: 0.1,
                        minPointLength: 4,
                    },
                    series: {
                        dataLabels: {
                            padding: 2,
                            backgroundColor: "#FFF8",
                            borderWidth : 3,
                            borderRadius: 10,
                            borderColor : "#FFF0",
                            style: {
                                fontSize: "26px",
                                color: "#444",
                                textOutline: "2px #FFF8",
                                fontWeight: "300",
                            }
                        }
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
                type            : chartType,
                column          : col,
                ranges          : { enabled: false },
                inspection      : { enabled: false, context: {selectedAnnotationIndex: -1, selectedPlotLineAxis: "", selectedPlotLineId: "", selectedSeriesId: ""}, match: [] },
                sortBy,
                limit,
                offset          : 0,
                onSeriesToggle  : () => {},
                onInspectionChange: () => {},
            })

            if (counted.match(/^counts?$/i)) {
                const label = limit ? `Top ${limit} Counts by ${col.label}` : `Counts by ${col.label}`
                dispatch({
                    data,
                    chartType,
                    limit,
                    sortBy,
                    theme,
                    label,
                    description: `Generated from the "${sub.name}" ${Terminology.subscription.nameSingular.toLowerCase()} to show ${label.toLowerCase()}.`
                })
            } else {
                const label = limit ? `Top ${limit} ${counted} by ${col.label}`: `Count ${counted} by ${col.label}`
                dispatch({
                    data,
                    chartType,
                    limit,
                    sortBy,
                    theme,
                    label,
                    description: `Generated from the "${sub.name}" ${Terminology.subscription.nameSingular.toLowerCase()} to ${limit ? "show" : ""} ${label.toLowerCase()}.`
                })
            }

            return renderChartAsPng(options, abortController.signal)
        })
        .then(imgUrl => dispatch({ imgUrl }))
        .catch(error => dispatch({ error }))
        .finally(() => {
            if (timer) {
                clearTimeout(timer)
            }
            dispatch({ loading: false })
        })

        return () => {
            if (timer) {
                clearTimeout(timer)
            }
            if (state.loading) {
                abortController.abort("Operation aborted because the component is unmounting")
            }
        }

    // eslint-disable-next-line
    }, [sub, col])
    
    return state
}


function Thumbnail({ col, sub }: { col: app.SubscriptionDataColumn, sub: app.Subscription }) {
    
    const {
        loading,
        error,
        chartType,
        label,
        description,
        countLabel,
        limit,
        sortBy,
        theme,
        imgUrl
    } = useDataLoader(sub, col)

    
    
    if (loading || error) {
        return (
            <div className="view-thumbnail template">
                <div className="view-thumbnail-image center" style={{ aspectRatio: "30/19", position: "relative", placeContent: "center" }}>
                    { loading && <Loader msg="" style={{ zIndex: 2 }} /> }
                    { error && <small className="color-red" style={{ wordBreak: "break-all" }}>{ error + "" }</small> }
                </div>
                <div className="view-thumbnail-title">{ label }</div>
            </div>
        )
    }

    return (
        <Link className="view-thumbnail template" to={`/requests/${sub.id}/create-view`} state={{
            column: col.name,
            chartType,
            name: label,
            description,
            countLabel,
            limit,
            sortBy,
            theme,
            colors: COLOR_THEMES.find(t => t.id === theme)!.colors
        }}>
            <div className="view-thumbnail-image center" style={{ aspectRatio: "30/19", position: "relative", placeContent: "center" }}
                data-tooltip={`<img src=${imgUrl || "about:blank"} alt="Chart Preview" style="display:block" />`}
                data-tooltip-position="50% auto">
                <img src={imgUrl || "about:blank"} alt="Thumbnail Preview" loading="lazy" />
            </div>
            <div className="view-thumbnail-title" title={description}>{ label }</div>
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

    // Look for the first FHIR resource
    const re = new RegExp("(" + FhirResourceTypes.join("|") + ")", "i")
    let match = pkgName.match(re);
    if (match && match[1]) {
        return humanizeColumnName(match[1])
    }

    // For standard pkg names take the first token after "count"
    match = pkgName.match(/^(\w+)__count_([^_]+)./)
    if (match && match[2]) {
        return humanizeColumnName(match[2])
    }

    // Use the package name as is
    return humanizeColumnName(pkgName)
}
