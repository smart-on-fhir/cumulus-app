import { app } from "../../../types"

/**
 * The extra data a survival chart needs: the same query as the chart's
 * primary data, filtered once to events and once to censored records.
 */
export interface SurvivalData {
    events  : app.ServerResponses.DataResponse
    censored: app.ServerResponses.DataResponse

    /**
     * The status column label and the value used for events, for messages
     */
    status?: { label: string, eventValue: string }
}

export interface LifeTableRow {

    /**
     * The time point (X axis value) this row is for
     */
    x: string

    /**
     * Records still under follow-up at the start of this time point
     */
    atRisk: number

    /**
     * Records that had the event during this time point
     */
    events: number

    /**
     * Records whose follow-up ended during this time point without an event
     */
    censored: number

    /**
     * Survival (0 to 1) at the start of this time point, before its events.
     * At the first time point where nobody is left under follow-up this is
     * where the curve ends (0 if its last records had the event), and null at
     * every time point after it.
     */
    survival: number | null

    /**
     * Lower and upper bounds (0 to 1) of the 95% confidence interval of
     * `survival`, using Greenwood's formula. Null when `survival` is null.
     */
    ciLow : number | null
    ciHigh: number | null
}

function clamp01(n: number) {
    return Math.min(1, Math.max(0, n))
}

/**
 * Life-table (actuarial) Kaplan–Meier estimate for one series.
 *
 * Every time point is treated as an interval that lasts until the next one, so
 * a row holds the survival at the START of its interval, and the drop caused by
 * its events shows at the next time point. That way the first time point is
 * always at 100%, and an open-ended last bucket like ">=5" gets the survival
 * reached by then without inventing a step for it.
 *
 * Censored records count as half at risk during the interval they leave in.
 * The confidence interval uses Greenwood's variance over the same effective
 * number at risk.
 *
 * @param ticks    The time points, already sorted
 * @param events   Event counts by time point
 * @param censored Censored counts by time point
 */
export function lifeTable(
    ticks   : string[],
    events  : Record<string, number>,
    censored: Record<string, number>
): LifeTableRow[] {
    const n = ticks.reduce((total, x) => total + (events[x] || 0) + (censored[x] || 0), 0)

    let atRisk   = n
    let survival = 1
    let variance = 0
    let previousAtRisk = 0

    return ticks.map(x => {
        const d = events[x]   || 0
        const c = censored[x] || 0

        // Known while anyone is at risk, and once more right after that: the
        // value the last interval ended with
        const known = atRisk > 0 || previousAtRisk > 0

        const se  = survival * Math.sqrt(variance)
        const row = {
            x,
            atRisk,
            events  : d,
            censored: c,
            survival: known ? survival : null,
            ciLow   : known ? clamp01(survival - 1.96 * se) : null,
            ciHigh  : known ? clamp01(survival + 1.96 * se) : null
        }

        previousAtRisk = atRisk

        const effective = atRisk - c / 2
        if (effective > 0) {
            survival *= Math.max(0, 1 - d / effective)

            // Undefined when everyone at risk has the event
            if (effective > d) {
                variance += d / (effective * (effective - d))
            }
        }

        atRisk -= d + c
        return row
    })
}

/**
 * Event or censored counts by time point for one series of a survival data
 * response. Pass the stratifier value for stratified data.
 */
export function getCountsByTime(data: app.ServerResponses.DataResponse, stratifier?: string): Record<string, number> {
    const group = stratifier === undefined ?
        data.data[0] :
        (data as app.ServerResponses.StratifiedDataResponse).data.find(g => String(g.stratifier) === stratifier)

    const out: Record<string, number> = {}
    for (const row of group?.rows || []) {
        out[String(row[0])] = (out[String(row[0])] || 0) + (+row[1] || 0)
    }
    return out
}
