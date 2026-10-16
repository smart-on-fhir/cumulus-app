import { BadRequest } from "./errors"

/**
 * The most filter groups a single aggregator request may contain. The number of
 * groups multiplies with every OR chain (see toAggregatorFilters), so this
 * protects the aggregator from huge queries.
 */
export const MAX_AGGREGATOR_FILTER_GROUPS = 100

/**
 * Converts dashboard chart filters to the format the aggregator expects.
 *
 * The two use opposite conventions for the same syntax:
 * - Dashboard: every `filter` param is an OR chain (conditions separated by
 *   commas), and separate `filter` params are joined with AND.
 * - Aggregator: every `filter` param is an AND group (conditions separated by
 *   commas), and separate `filter` params are joined with OR. See `get_filters`
 *   in cumulus-aggregator's src/dashboard/get_chart_data/templates/filter_inline.sql.jinja
 *
 * Every AND of ORs can be written as an OR of ANDs by taking one condition from
 * each OR chain in every possible combination:
 *
 *     (a OR b) AND c  ->  (a AND c) OR (b AND c)
 *     ["a,b", "c"]    ->  ["a,c", "b,c"]
 *
 * Filters that only use AND come out as a single group.
 *
 * @param filters The dashboard `filter` params, each one an OR chain
 * @returns The aggregator `filter` params, each one an AND group
 */
export function toAggregatorFilters(filters: string[]): string[] {
    const chains = filters
        .map(filter => filter.split(",").filter(Boolean))
        .filter(chain => chain.length > 0)

    if (!chains.length) {
        return []
    }

    let groups: string[][] = [[]]

    for (const chain of chains) {
        const next: string[][] = []
        for (const group of groups) {
            for (const condition of chain) {
                next.push([...group, condition])
            }
        }
        if (next.length > MAX_AGGREGATOR_FILTER_GROUPS) {
            throw new BadRequest(
                `These filters are too complex for this data: combining their OR conditions ` +
                `would need more than ${MAX_AGGREGATOR_FILTER_GROUPS} filter groups`
            )
        }
        groups = next
    }

    return groups.map(group => group.join(","))
}
