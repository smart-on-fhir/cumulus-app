/**
 * Guesses which columns can play a role in a survival chart. Used to suggest
 * columns, never to hide them: names can't be trusted to tell what a column
 * holds.
 *
 * When data package metadata starts marking column roles, check it first in
 * these functions and fall back to the name.
 */

interface NamedColumn {
    name  : string
    label?: string
}

function matches(col: NamedColumn, pattern: RegExp): boolean {
    // "\b" treats "_" as a word character, so "efs_status" would not match
    return [col.name, col.label || ""].some(text => pattern.test(text.replace(/_/g, " ")))
}

/**
 * Columns that look like time to event, e.g. "age" or "years_since_diagnosis"
 */
export function isDurationColumn(col: NamedColumn): boolean {
    return (
        matches(col, /\b(age|days|weeks|months|years|duration|time|follow ?up|survival)\b/i) &&
        !matches(col, /\b(group|range)\b/i)
    )
}

/**
 * Columns that look like an event/no event status, e.g. "efs_status" or "died"
 */
export function isStatusColumn(col: NamedColumn): boolean {
    return matches(col, /\b(status|event|outcome|censor|censored|died|death|dead|deceased|vital|relapse)\b/i)
}

/**
 * Sort comparator that puts the columns matching `test` first, then sorts by
 * name as the column selector does by default
 */
export function suggestedFirst(test: (col: NamedColumn) => boolean) {
    return (a: NamedColumn, b: NamedColumn) => Number(test(b)) - Number(test(a)) || a.name.localeCompare(b.name)
}
