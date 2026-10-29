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
     * `survival` (see confidenceInterval). Null when `survival` is null.
     */
    ciLow : number | null
    ciHigh: number | null
}

/**
 * The 95% confidence interval of a survival estimate, computed on the log-log
 * scale (Kalbfleisch–Prentice), which is Stata's default. Unlike a plain
 * `survival ± 1.96 SE`, it never leaves 0 to 1, and it is narrower on the side
 * closer to 0% or 100%, as published Kaplan–Meier results are.
 *
 * At 100% and at 0% the interval has no width.
 *
 * @param survival The survival estimate (0 to 1)
 * @param variance Greenwood's sum, Σ d / (n (n - d)), the variance of log(S)
 */
export function confidenceInterval(survival: number, variance: number): [number, number] {
    if (survival <= 0 || survival >= 1 || variance <= 0) {
        return [survival, survival]
    }
    // Standard error of log(-log S)
    const se = Math.sqrt(variance) / Math.abs(Math.log(survival))
    return [
        Math.pow(survival, Math.exp( 1.96 * se)),
        Math.pow(survival, Math.exp(-1.96 * se))
    ]
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
 * number at risk, on the log-log scale (see confidenceInterval).
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

        const [ciLow, ciHigh] = confidenceInterval(survival, variance)
        const row = {
            x,
            atRisk,
            events  : d,
            censored: c,
            survival: known ? survival : null,
            ciLow   : known ? ciLow  : null,
            ciHigh  : known ? ciHigh : null
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

export interface LogRankResult {

    /**
     * The test statistic
     */
    chi2: number

    /**
     * Degrees of freedom: the number of groups minus 1
     */
    df: number

    /**
     * The probability of differences at least this large if all groups had
     * the same survival
     */
    p: number
}

/**
 * Log-rank test of whether two or more survival curves differ, from their life
 * tables (one per group, with the same time points).
 *
 * At every time point, the events of each group are compared with what it
 * would have had if all groups had the same risk: its share of the total
 * events, by its share of the records at risk. Since the time points are
 * intervals rather than exact times, this is an approximation of the test on
 * exact times that statistics software runs, and gets closer to it with
 * finer time points.
 *
 * @returns null when there are fewer than 2 groups with records, or nothing
 * to compare (e.g. no events at all)
 */
export function logRankTest(tables: Pick<LifeTableRow, "atRisk" | "events">[][]): LogRankResult | null
{
    // Groups without records can't be compared
    const groups = tables.filter(rows => rows.some(row => row?.atRisk > 0))
    const G = groups.length
    if (G < 2) {
        return null
    }

    const T = Math.max(...groups.map(rows => rows.length))

    // Observed minus expected events of each group, and their covariance
    const U = new Array(G).fill(0)
    const V = Array.from({ length: G }, () => new Array(G).fill(0))

    for (let j = 0; j < T; j++) {
        const n = groups.map(rows => rows[j]?.atRisk || 0)
        const d = groups.map(rows => rows[j]?.events || 0)
        const N = n.reduce((a, b) => a + b, 0)
        const D = d.reduce((a, b) => a + b, 0)
        if (N < 2 || D === 0) {
            continue
        }
        const factor = D * (N - D) / (N - 1)
        for (let g = 0; g < G; g++) {
            U[g] += d[g] - n[g] * D / N
            for (let h = 0; h < G; h++) {
                V[g][h] += factor * (n[g] / N) * ((g === h ? 1 : 0) - n[h] / N)
            }
        }
    }

    // The groups add up to zero, so one of them is left out
    const x = solve(V.slice(0, -1).map(row => row.slice(0, -1)), U.slice(0, -1))
    if (!x) {
        return null
    }

    const chi2 = Math.max(0, x.reduce((sum, xi, i) => sum + xi * U[i], 0))
    const df   = G - 1
    return { chi2, df, p: chiSquareSurvival(chi2, df) }
}

/**
 * Solves A x = b by Gaussian elimination. Returns null if A is singular.
 */
function solve(A: number[][], b: number[]): number[] | null
{
    const n = b.length
    const M = A.map((row, i) => [...row, b[i]])

    for (let col = 0; col < n; col++) {
        let pivot = col
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(M[row][col]) > Math.abs(M[pivot][col])) {
                pivot = row
            }
        }
        if (Math.abs(M[pivot][col]) < 1e-12) {
            return null
        }
        [M[col], M[pivot]] = [M[pivot], M[col]]
        for (let row = 0; row < n; row++) {
            if (row !== col) {
                const f = M[row][col] / M[col][col]
                for (let k = col; k <= n; k++) {
                    M[row][k] -= f * M[col][k]
                }
            }
        }
    }

    return M.map((row, i) => row[n] / row[i])
}

/**
 * P(X >= x) for a chi-square distribution with `df` degrees of freedom
 */
export function chiSquareSurvival(x: number, df: number): number
{
    if (x <= 0) {
        return 1
    }
    return upperGamma(df / 2, x / 2)
}

/**
 * The regularized upper incomplete gamma function Q(a, x), using its series
 * for small x and its continued fraction otherwise (Numerical Recipes)
 */
function upperGamma(a: number, x: number): number
{
    const lnPrefix = a * Math.log(x) - x - logGamma(a)

    if (x < a + 1) {
        let term = 1 / a, sum = term
        for (let n = 1; n < 500; n++) {
            term *= x / (a + n)
            sum  += term
            if (Math.abs(term) < Math.abs(sum) * 1e-15) {
                break
            }
        }
        return Math.max(0, 1 - sum * Math.exp(lnPrefix))
    }

    const tiny = 1e-300
    let b = x + 1 - a, c = 1 / tiny, d = 1 / b, h = d
    for (let i = 1; i < 500; i++) {
        const an = -i * (i - a)
        b += 2
        d = an * d + b
        if (Math.abs(d) < tiny) d = tiny
        c = b + an / c
        if (Math.abs(c) < tiny) c = tiny
        d = 1 / d
        const delta = d * c
        h *= delta
        if (Math.abs(delta - 1) < 1e-15) {
            break
        }
    }
    return Math.min(1, Math.exp(lnPrefix) * h)
}

/**
 * ln(Γ(x)) for x > 0 (Lanczos approximation)
 */
function logGamma(x: number): number
{
    const c = [
        676.5203681218851, -1259.1392167224028, 771.32342877765313,
        -176.61502916214059, 12.507343278686905, -0.13857109526572012,
        9.9843695780195716e-6, 1.5056327351493116e-7
    ]
    if (x < 0.5) {
        return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - logGamma(1 - x)
    }
    x -= 1
    let sum = 0.99999999999980993
    for (let i = 0; i < c.length; i++) {
        sum += c[i] / (x + i + 1)
    }
    const t = x + c.length - 0.5
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(sum)
}
