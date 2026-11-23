export interface AutocompleteValue {
    value: string
    count: number
}

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true })

/**
 * The values to suggest for what the user typed: the ones that start with it
 * first, then the ones that contain it, ignoring case. Both are in alphabetical
 * order, so similar values stay together for those who scroll through them.
 */
export function getSuggestions(values: AutocompleteValue[], query: string) {
    const q = query.trim().toLowerCase()
    const prefix: AutocompleteValue[] = []
    const other : AutocompleteValue[] = []

    for (const v of values) {
        const index = v.value.toLowerCase().indexOf(q)
        if (index === 0) prefix.push(v)
        else if (index > 0) other.push(v)
    }

    const byValue = (a: AutocompleteValue, b: AutocompleteValue) => collator.compare(a.value, b.value) || b.count - a.count

    return { items: [...prefix.sort(byValue), ...other.sort(byValue)], prefixCount: prefix.length }
}
