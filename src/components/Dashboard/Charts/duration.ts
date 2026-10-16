export interface Duration {

    /**
     * The numeric part of the label
     */
    value: number

    /**
     * - "exact" - the value itself, e.g. "3" or 3
     * - "above" - an open-ended tail, e.g. ">=5", ">5" or "5+"
     * - "below" - everything under the value, e.g. "<1" or "<=1"
     */
    bound: "exact" | "above" | "below"
}

const NUMBER = "(\\d+(?:\\.\\d+)?)"

const PATTERNS: [RegExp, Duration["bound"]][] = [
    [ new RegExp(`^${NUMBER}$`)               , "exact" ],
    [ new RegExp(`^(?:>=|≥|>)\\s*${NUMBER}$`) , "above" ],
    [ new RegExp(`^${NUMBER}\\s*\\+$`)        , "above" ],
    [ new RegExp(`^(?:<=|≤|<)\\s*${NUMBER}$`) , "below" ],
]

/**
 * Reads a value from the X axis of a survival chart as a duration (time to
 * event). Returns null if the value does not look like a duration, which is
 * the case for things like "female", "Crohn's disease", negative numbers or
 * dates.
 */
export function parseDuration(input: string | number): Duration | null {
    if (typeof input === "number") {
        return isFinite(input) && input >= 0 ? { value: input, bound: "exact" } : null
    }

    const label = String(input).trim()

    for (const [pattern, bound] of PATTERNS) {
        const match = label.match(pattern)
        if (match) {
            return { value: parseFloat(match[1]), bound }
        }
    }

    return null
}

const BOUND_ORDER: Record<Duration["bound"], number> = { below: 0, exact: 1, above: 2 }

/**
 * Sort comparator for durations: by value, then "<1" before "1" before ">=1".
 * Values that are not durations go last, in their original order.
 */
export function compareDurations(a: string | number, b: string | number): number {
    const da = parseDuration(a)
    const db = parseDuration(b)
    if (!da || !db) {
        return da ? -1 : db ? 1 : 0
    }
    return da.value - db.value || BOUND_ORDER[da.bound] - BOUND_ORDER[db.bound]
}
