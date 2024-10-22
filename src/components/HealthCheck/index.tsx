import { useCallback, useState } from "react"
import { Link }                  from "react-router-dom"
import Loader                    from "../generic/Loader"
import { AlertError }            from "../generic/Alert"
import Grid                      from "../generic/Grid"
import Collapse                  from "../generic/Collapse"
import { request }               from "../../backend"
import { useBackend }            from "../../hooks"


interface Check {
    name: string
    description: string
    path: string
    result?: CheckResult
}

interface CheckResult {
    status ?: "passed" | "failed" | "mixed" | "loading"
    message?: string
    payload?: { text: string, to?: string }[]
}

function wait(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

let resultsState: Record<string, CheckResult> = {}

export default function HealthCheck() {

    const [results, setResults] = useState<Record<string, CheckResult>>(resultsState)

    const { loading, error, result: checks } = useBackend<Check[]>(
        useCallback(() => request<Check[]>("/api/health-check"), []),
        true
    )

    const runChecks = useCallback(async () => {
        if (checks?.length) {
            for (const check of checks!) {
                resultsState[check.path] = { message: "Loading...", status: "loading" }
                setResults(resultsState)
                await wait(30)
                try {
                    resultsState[check.path] = await request<CheckResult>("/api/health-check/" + check.path)
                } catch (ex) {
                    resultsState[check.path] = { status: "failed", message: ex + "" }
                }
                setResults({ ...resultsState })
                await wait(30)
            }
        }
    }, [checks])

    if (loading) {
        return <Loader msg="Loading checks..." />
    }

    if (error) {
        return <AlertError>{ error }</AlertError>
    }

    if (!checks) {
        return <AlertError>No checks found!</AlertError>
    }

    return (
        <>
            <Grid gap="1rem" cols="auto 1fr" style={{ alignItems: "center" }}>
                <button className="btn btn-blue pl-1 pr-1 bold" type="button" onClick={runChecks}>Run Health Checks</button>
                <Progress checks={checks} results={results} />
            </Grid>
            <hr className="mt-1 mb-1"/>
            <div>
                { checks.map(c => <CheckComponent name={c.name} description={c.description} result={results[c.path]} key={c.path} />) }
            </div>
        </>
    )
}

function Progress({ checks, results }: { checks: Check[], results: Record<string, CheckResult> }) {
    return (
        <Grid gap="3px" cols={checks.map(() => "1fr").join(" ")}>
            { checks.map(c => {
                const result = results[c.path] || {}
                return <div
                    key={c.path}
                    data-tooltip={`<div style="max-width:150px; font-size:14px;text-align:center">${c.description}</div>`}
                    data-tooltip-position="25% 0%"
                    style={{
                        height: "1rem",
                        boxShadow: "0 0 0 1px #0002 inset",
                        borderRadius: 2,
                        background: result.status === "failed" ?
                            "#C00C" :
                            result.status === "mixed" ?
                                "#FB0" :
                                result.status === "passed" ?
                                    "#0C0C" :
                                    result.status === "loading" ?
                                        "#369C" :
                                        "#0001"
                    }}
                />
            }) }
        </Grid>
    )
}

function CheckIcon({ status }: CheckResult) {
    if (status === "failed") {
        return <i className="fa-solid fa-circle-xmark color-red" />
    }
    if (status === "mixed") {
        return <i className="fa-solid fa-circle-exclamation color-orange" />
    }
    if (status === "passed") {
        return <i className="fa-solid fa-circle-check color-green" />
    }
    if (status === "loading") {
        return <i className="fa-solid fa-circle-notch fa-spin" />
    }
    return <i className="far fa-pause-circle color-blue" />
}

function CheckComponent({
    name,
    description,
    result = {}
}: {
    name: string
    description: string
    result: CheckResult
}) {
    return <Grid cols="1.5rem 1fr" className="mb-05">
        <div>
            <CheckIcon { ...result } />
        </div>
        <div><b>{ name }</b><span className="color-muted"> - { description }</span></div>
        { result.status && <div className="mb-2" style={{ gridColumn: 2 }}>
            { result.message && <div>{ result.message }</div> }
            { result.payload && <Collapse header={ <small className="color-red">Affected Records:</small>} collapsed className="ml-0">
                { result.payload.map(({ to, text }, i) => (
                    <div key={i} style={{ margin: "3px 0 3px 1.2rem"}}>
                        <b className="color-blue">●</b> { to ? <Link to={to} className="link">{text}</Link> : text }
                    </div>
                )) }
                </Collapse>
            }
        </div> }
    </Grid>
}
