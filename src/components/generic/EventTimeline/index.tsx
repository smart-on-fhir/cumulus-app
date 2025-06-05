import { useEffect, useState }                     from "react"
import moment, { Moment }                          from "moment"
import { Link }                                    from "react-router-dom"
import Grid                                        from "../Grid"
import { groupBy, humanizeColumnName }             from "../../../utils"
import { DataPackage, StudyPeriod, useAggregator } from "../../../Aggregator"
import { request }                                 from "../../../backend"
import { app }                                     from "../../../types"
import Terminology                                 from "../../../Terminology"


class TimelineData<T=any> {

    private aggregates: Record<string, T[]> = {}

    readonly dateFormat: string;

    constructor(dateFormat: string) {
        this.dateFormat = dateFormat
    }

    add(date: Date | Moment, data: T) {
        const day = moment(date)
        const key = day.format(this.dateFormat)

        if (!this.aggregates[key]) {
            this.aggregates[key] = []
        }

        this.aggregates[key].push(data)
    }

    *stratify(stratifiers: (keyof T)[]) {

        // for each date
        for (const date of Object.keys(this.aggregates)) {
            const items = this.aggregates[date]

            const groups = groupBy(items, stratifiers as string[]) as Record<string, T>

            // for each stratified value
            for (const group of Object.keys(groups)) {
                const data = groups[group]
                yield {
                    date,
                    stratifiers: stratifiers.map(s => data[0][s]),
                    data
                }
            }
        }
    }
}

export default function EventTimeline() {

    const { aggregator } = useAggregator()
    
    const [packages, setPackages] = useState<DataPackage[]>([])
    const [periods , setPeriods ] = useState<StudyPeriod[]>([])
    const [charts  , setCharts  ] = useState<app.View[]>([])
    const [subs    , setSubs    ] = useState<app.Subscription[]>([])
    const [format  , setFormat  ] = useState<"MMM YYYY"|"MM/DD/YYYY"|"YYYY">("MMM YYYY")

    useEffect(() => {
        aggregator.initialize()
        .then(async () => Promise.all([
            aggregator.getPackages(),
            aggregator.getAllStudyPeriods(),
            request("/api/views?attributes=createdAt,name"),
            request("/api/requests?attributes=createdAt,name"),
        ]))
        .then(([packages, periods, charts, subs]) => {
            setPackages(packages)
            setPeriods(periods)
            setCharts(charts)
            setSubs(subs)
        })
        .catch(() => {})
    }, [])

    const pkgData = new TimelineData(format)
    

    packages.forEach(pkg    => pkgData.add(moment(pkg.last_data_update   ), { ...pkg   , type: "dataPackage" }))
    periods .forEach(period => pkgData.add(moment(period.last_data_update), { ...period, type: "studyPeriod" }))
    charts  .forEach(chart  => pkgData.add(moment(chart.createdAt)        , { ...chart , type: "createChart" }))
    subs    .forEach(sub    => pkgData.add(moment(sub.createdAt)          , { ...sub   , type: "createSubscription" }))

    const events = []
    
    Array.from(pkgData.stratify(["type", "study"])).forEach(e => {
        if (e.stratifiers[0] === "dataPackage") {
            events.push({
                date: e.date,
                label: <>Updated data for <b>{e.data.length}</b> packages in study <Link className="link" to={`/studies/${e.stratifiers[1]}`}>{humanizeColumnName(e.stratifiers[1])}</Link></>
            })
        }
    })

    Array.from(pkgData.stratify(["type", "site"])).forEach(e => {
        if (e.stratifiers[0] === "studyPeriod") {
            events.push({
                date: e.date,
                label: e.data.length === 1 ?
                    <>
                        Updated data for study <Link className="link" to={`/studies/${e.data[0].study}`}>
                        {e.data[0].study}
                        </Link> from <Link className="link" to={`/sites/${e.stratifiers[1]}`}>
                        {humanizeColumnName(e.stratifiers[1])}
                        </Link>
                    </> :
                    <>
                        Updated data for <b>{e.data.length}</b> studies
                        from <Link className="link" to={`/sites/${e.stratifiers[1]}`}>{humanizeColumnName(e.stratifiers[1])}</Link>
                    </>
            })
        }
    })

    Array.from(pkgData.stratify(["type"])).forEach(e => {
        if (e.stratifiers[0] === "createChart") {
            events.push({
                date: e.date,
                label: e.data.length === 1 ?
                    <>Created chart <Link className="link" to={`/views/${e.data[0].id}`}>{e.data[0].name}</Link></> :
                    <>Created <b>{e.data.length}</b> charts</>
            })
        }
    })

    Array.from(pkgData.stratify(["type"])).forEach(e => {
        if (e.stratifiers[0] === "createSubscription") {
            events.push({
                date: e.date,
                label: e.data.length === 1 ?
                    <>Created {Terminology.subscription.nameSingular} <Link className="link" to={`/requests/${e.data[0].id}`}>{e.data[0].name}</Link></> :
                    <>Created <b>{e.data.length}</b>  {Terminology.subscription.namePlural}</>
            })
        }
    })

    const data = events.sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())

    const groups = groupBy(data, "date")

    return (
        <div>
            <div className="row middle">
                <div className="col col-0 pr-1">
                    <h4>
                        <span className="icon material-symbols-outlined">calendar_clock</span>Activity
                    </h4>
                </div>
                <div className="col"></div>
                <div className="col" style={{ minWidth: "12em"}}>
                    <div className="toolbar small">
                        <button className={"btn" + (format === "YYYY" ? " active" : "")} onClick={() => setFormat("YYYY")}>Yearly</button>
                        <button className={"btn" + (format === "MMM YYYY" ? " active" : "")} onClick={() => setFormat("MMM YYYY")}>Monthly</button>
                        <button className={"btn" + (format === "MM/DD/YYYY" ? " active" : "")} onClick={() => setFormat("MM/DD/YYYY")}>Daily</button>
                    </div>
                </div>
            </div>
            <hr/>
            <div style={{ maxHeight: "70vh", overflow: "auto" }}>
            { Object.keys(groups).sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf()).map((date, i) => {
                const items = groups[date]
                return (
                    <div key={i} style={{ margin: "0.25em 0" }} className="ellipsis">
                        <span className="color-brand-2">
                            <span className="material-symbols-outlined color-brand-2" style={{ verticalAlign: "top", lineHeight: "1em", margin: "0 0.1em 0 0", fontSize: "1.25em" }}>
                                calendar_clock
                            </span> <span className="small" style={{ fontFamily: "monospace"}}>{ date }</span> {/*items.length > 1 && <b className="badge">{items.length}</b> */}
                        </span>

                        { items.length > 1 ? 
                            <div className="" style={{ padding: "0 0 0 0.35em", margin: "0.25em 0 1em 0em" }}>
                                { items.map((event, i, a) => (
                                    <Grid cols="1fr auto" key={i} gap="1ex" className="">
                                        <div className="ellipsis" style={{ alignItems: "center", lineHeight: "normal" }}>
                                            <span className="color-grey" style={{ fontFamily: "monospace" }}>{i === a.length - 1 ? "└" : "├"}─</span> { event.label }
                                        </div>
                                    </Grid>
                                ))}
                            </div> :
                            <span className="ellipsis" style={{ alignItems: "center"}}> <span className="color-grey" style={{ fontFamily: "monospace"}}>─</span> { items[0].label }</span>
                        }
                    </div>
                )
            })}
            </div>
        </div>
    )
}