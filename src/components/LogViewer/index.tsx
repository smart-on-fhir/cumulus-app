import moment from "moment"
import { useState } from "react"
import EndpointListWrapper from "../generic/EndpointListWrapper"
import "./LogViewer.scss"


function isEmptyObject(x: object) {
    return Object.getOwnPropertyNames(x).length === 0
}

function Level({ level }: { level: string }) {
    switch (level) {
        case "info":
            return <div style={{ width: "6em", color: "#0AB" }}>{ level }</div>
        case "warn":
            return <div style={{ width: "6em", color: "#F70" }}>{ level }</div>
        case "error":
            return <div style={{ width: "6em", color: "#D30" }}>{ level }</div>
        case "http":
            return <div style={{ width: "6em", color: "#A90" }}>{ level }</div>
        case "verbose":
            return <div style={{ width: "6em", color: "#C3C" }}>{ level }</div>
        default:
            return <div style={{ width: "6em" }}>{ level }</div>
    }
}

function Info({ obj }: { obj: Record<string, any> }) {
    return (
        <div className="info">
            { Object.keys(obj).map((k, i) => {
                const value = obj[k]
                if (value && typeof value === "object") {
                    return <div key={i}>
                        {k}:&nbsp;
                        {/* <Info obj={value} /> */}
                        <span className="color-green">{ JSON.stringify(value, null, 4) }</span>
                    </div>
                }
                return (
                    <div key={i}>
                        {k}:&nbsp;
                        <span className="color-green">{ value + "" }</span>
                    </div>
                )
            }) }
        </div>
    )
}

export default function LogViewer()
{
    const [ tags  , setTags   ] = useState<string[]>([])
    const [ levels, setLevels ] = useState<string[]>(["info", "warn", "error"])
    const [ limit , setLimit  ] = useState(100)
    const [ from  , setFrom   ] = useState(moment().subtract(1, "day").format("YYYY-MM-DD"))
    const [ to    , setTo     ] = useState(moment().format("YYYY-MM-DD"))

    function tag(name: string | "all") {
        if (name === "all") {
            setTags([])
        }
        else if (tags.includes(name)) {
            setTags(tags.filter(t => t !== name))
        }
        else {
            setTags([...tags, name])
        }
    }

    function level(name: string | "all") {
        if (name === "all") {
            setLevels([])
        }
        else if (levels.includes(name)) {
            setLevels(levels.filter(t => t !== name))
        }
        else {
            setLevels([...levels, name])
        }
    }

    return (
        <div className="row gap" style={{ flex: 1, maxHeight: "calc(100vh - 6.5rem)", margin: "-1rem" }}>
            <div className="col" style={{ maxHeight: "100%" }}>
                <div className="row gap wrap" style={{ fontSize: 12 }}>
                    <div className="col col-0">
                        <div className="row half-gap middle mb-05">
                            <div className="col col-0"><b>Tags</b></div>
                            <div className="col col-0">
                                <div className="toolbar">
                                    <button className={"btn"+(tags.includes("WEB") ? " active" : "")} onClick={() => tag("WEB")}>web</button>
                                    <button className={"btn"+(tags.includes("AUTH") ? " active" : "")} onClick={() => tag("AUTH")}>auth</button>
                                    <button className={"btn"+(tags.includes("GRAPHS") ? " active" : "")} onClick={() => tag("GRAPHS")}>graphs</button>
                                    <button className={"btn"+(tags.includes("DATA") ? " active" : "")} onClick={() => tag("DATA")}>data</button>
                                    <button className={"btn"+(tags.includes("ACTIVITY") ? " active" : "")} onClick={() => tag("ACTIVITY")}>activity</button>
                                    <button className={"btn"+(tags.length ? "" : " active")} onClick={() => tag("all")}><b>any</b></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col col-0">
                        <div className="row half-gap middle mb-05">
                            <div className="col col-0"><b>Levels</b></div>
                            <div className="col col-0">
                                <div className="toolbar">
                                    <button className={"btn"+(levels.includes("silly")   ? " active" : "")} onClick={() => level("silly"  )}>silly</button>
                                    <button className={"btn"+(levels.includes("debug")   ? " active" : "")} onClick={() => level("debug"  )}>debug</button>
                                    <button className={"btn"+(levels.includes("verbose") ? " active" : "")} onClick={() => level("verbose")}>verbose</button>
                                    <button className={"btn"+(levels.includes("http")    ? " active" : "")} onClick={() => level("http"   )}>http</button>
                                    <button className={"btn"+(levels.includes("info")    ? " active" : "")} onClick={() => level("info"   )}>info</button>
                                    <button className={"btn"+(levels.includes("warn")    ? " active" : "")} onClick={() => level("warn"   )}>warn</button>
                                    <button className={"btn"+(levels.includes("error")   ? " active" : "")} onClick={() => level("error"  )}>error</button>
                                    {/* <button className="btn" onClick={() => level("all")}><b>any</b></button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col col-0">
                        <div className="row half-gap middle mb-05">
                            <div className="col col-0"><b>From</b></div>
                            <div className="col col-0">
                                <input
                                    type="date"
                                    value={from}
                                    onChange={e => setFrom(moment(e.target.valueAsDate).format("YYYY-MM-DD")) }
                                    max={to}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col col-0">
                        <div className="row half-gap middle mb-05">
                            <div className="col col-0"><b>To</b></div>
                            <div className="col col-0">
                                <input
                                    type="date"
                                    value={to}
                                    onChange={e => setTo(moment(e.target.valueAsDate).format("YYYY-MM-DD")) }
                                    max={moment().format("YYYY-MM-DD")}
                                    min={from}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col col-0">
                        <div className="row half-gap middle mb-05">
                            <div className="col col-0"><b>Limit</b></div>
                            <div className="col col-0">
                                <div className="toolbar">
                                    <button className={"btn"+(limit === 100 ? " active" : "")} onClick={() => setLimit(100)}>100</button>
                                    <button className={"btn"+(limit === 500 ? " active" : "")} onClick={() => setLimit(500)}>500</button>
                                    <button className={"btn"+(limit === 1000 ? " active" : "")} onClick={() => setLimit(1000)}>1000</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <pre className="small log-viewer">
                    <EndpointListWrapper endpoint={
                        `/api/logs?tags=${tags.join(",")}&levels=${levels.join(",")}&limit=${limit}&from=${from}&to=${to}`
                    }>
                        { (data: any[]) => {
                            if (!data.length) {
                                return <div className="mt-1 mb-1">No logs found matching your filters</div>
                            }
                            return (
                                <>
                                    { data.map(({ tags, timestamp, level, message, ms, ...rest }, i) => {
                                        const hasInfo = !isEmptyObject(rest)
                                        return (
                                            <details key={i} className={ hasInfo ? "" : "no-info" } tabIndex={0}>
                                                <summary>
                                                    <div style={{ width: "16em" }} className="color-muted">{ new Date(timestamp).toLocaleString() }</div>
                                                    <div style={{ width: "5em" }} className="color-blue">{ ms }</div>
                                                    <Level level={ level } />
                                                    {/* <div style={{ width: "4em"  }} className="color-brand-2"><b>{ tag }</b></div> */}
                                                    <div className="color-blue-dark">{
                                                        message && typeof message === "object" ?
                                                            JSON.stringify(message) :
                                                            message + ""
                                                    }</div>
                                                </summary>
                                                { hasInfo && <Info obj={rest} /> }
                                            </details>
                                        )
                                    })}
                                </>
                            )
                        }}
                    </EndpointListWrapper>
                </pre>
            </div>
        </div>
    )
}