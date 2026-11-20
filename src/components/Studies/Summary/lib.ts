import { DataPackage, getTableName, Metadata } from "../../../Aggregator"
import { humanizeColumnName }                  from "../../../utils"
import { app }                                 from "../../../types"


/** The FHIR resources (and other subjects) that package names refer to */
const RESOURCES: Record<string, string> = {
    allergyintolerance: "Allergies",
    condition         : "Conditions",
    diagnosticreport  : "Diagnostic Reports",
    documentreference : "Documents",
    encounter         : "Encounters",
    immunization      : "Immunizations",
    medicationdispense: "Medication Dispenses",
    medicationrequest : "Medication Requests",
    note              : "Notes",
    observation       : "Observations",
    patient           : "Patients",
    procedure         : "Procedures",
    servicerequest    : "Service Requests",
    specimen          : "Specimens",
}

const DATE_TYPES = ["year", "month", "week", "day", "date"]

export const NO_DATE = "cumulus__none"

/**
 * The kind of data a table holds, from the first resource its name mentions,
 * e.g. "count_condition_month" → "Conditions"
 */
export function getResourceLabel(tableName: string) {
    const words = tableName.toLowerCase().split("_")
    const resource = words.find(w => w in RESOURCES)
    if (resource) {
        return RESOURCES[resource]
    }
    return words[0] === "meta" ? "Metadata" : "Other"
}

export function getDateColumns(pkg: DataPackage) {
    return Object.values(pkg.columns).filter(c => DATE_TYPES.includes(c.type))
}


// Uploads ---------------------------------------------------------------------

export interface Upload {
    site      : string
    table     : string
    version   : string
    /** The latest of the upload, data update and aggregation times */
    lastUpdate: string | null
    /** The time of the last error, if nothing happened after it */
    lastError : string | null
    /** The time of an error that a later update followed, e.g. a retry */
    earlierError: string | null
}

/** The latest of some dates, which are not all in the same format */
function latest(...dates: (string | null | undefined)[]) {
    return dates.reduce<string | null>((max, d) => d && (!max || +new Date(d) > +new Date(max)) ? d : max, null)
}

/**
 * One entry per site, table and version of the study. Metadata keys are not
 * consistent: some include the study prefix (once or twice), and some entries
 * are keyed by a package id where the version should be.
 */
export function getUploads(metadata: Metadata, study: string): Upload[] {
    const out = new Map<string, Upload>()
    for (const site in metadata) {
        const packages = metadata[site][study] || {}
        for (const key in packages) {
            for (const versionKey in packages[key]) {
                const entry = packages[key][versionKey]
                if (entry.deleted) {
                    continue
                }
                const [, idName, idVersion] = versionKey.match(/^(.*)__(\d+)$/) || []
                let name = idName ?? key
                while (name.startsWith(study + "__")) {
                    name = name.slice(study.length + 2)
                }
                // Only flat packages have the site at the end of their names
                const table   = getTableName({ name, site, type: "flat" })
                const version = idVersion ?? versionKey
                const id      = [site, table, version].join("/")
                const prev    = out.get(id)
                // The timestamps are updated separately, and last_error only
                // says when the last error happened. If anything happened
                // after it, the error is not current.
                const lastUpdate = latest(entry.last_upload, entry.last_data_update, entry.last_aggregation)
                const failed     = !!entry.last_error && latest(lastUpdate, entry.last_error) === entry.last_error
                if (!prev || latest(prev.lastUpdate, lastUpdate) !== prev.lastUpdate) {
                    out.set(id, {
                        site,
                        table,
                        version,
                        lastUpdate,
                        lastError   : failed ? entry.last_error : null,
                        earlierError: failed ? null : entry.last_error
                    })
                }
            }
        }
    }
    return [...out.values()]
}


// Coverage --------------------------------------------------------------------

export interface CoverageCell {
    expected   : number
    uploaded   : number
    failed     : number
    /** Uploaded without errors, but without an upload date in the metadata */
    undated    : number
    lastUpdate?: string
    uploads    : Upload[]
}

export interface Coverage {
    groups: { label: string, tables: string[] }[]
    sites : string[]
    cells : Record<string, Record<string, CoverageCell>>
}

/**
 * Which kinds of data each site uploaded for this version of the study
 */
export function getCoverage(packages: DataPackage[], uploads: Upload[], version: string): Coverage {
    const tables = [...new Set(packages.map(getTableName))].sort()
    const groups: Coverage["groups"] = []
    for (const table of tables) {
        const label = getResourceLabel(table)
        const group = groups.find(g => g.label === label)
        group ? group.tables.push(table) : groups.push({ label, tables: [table] })
    }
    groups.sort((a, b) => a.label.localeCompare(b.label))

    const relevant = uploads.filter(u => u.version === version && tables.includes(u.table))
    const sites    = [...new Set(relevant.map(u => u.site))].sort()
    const cells: Coverage["cells"] = {}

    for (const site of sites) {
        cells[site] = {}
        for (const group of groups) {
            const list = relevant.filter(u => u.site === site && group.tables.includes(u.table))
            cells[site][group.label] = {
                expected  : group.tables.length,
                uploaded  : list.length,
                failed    : list.filter(u => u.lastError).length,
                undated   : list.filter(u => !u.lastUpdate && !u.lastError).length,
                lastUpdate: latest(...list.map(u => u.lastUpdate)) || undefined,
                uploads   : list
            }
        }
    }

    return { groups, sites, cells }
}


// Resources -------------------------------------------------------------------

export interface ResourceSummary {
    label     : string
    packages  : DataPackage[]
    /** The largest package's total. Packages count the same records in different ways, so they don't add up */
    records   : number
    sites     : number
    timeGrains: string[]
    breakdowns: { name: string, label: string, values: number }[]
}

export function getResourceSummaries(packages: DataPackage[]): ResourceSummary[] {
    const out: ResourceSummary[] = []
    for (const pkg of packages) {
        const label = getResourceLabel(getTableName(pkg))
        let summary = out.find(s => s.label === label)
        if (!summary) {
            summary = { label, packages: [], records: 0, sites: 0, timeGrains: [], breakdowns: [] }
            out.push(summary)
        }
        summary.packages.push(pkg)
        summary.records = Math.max(summary.records, pkg.total)
        summary.sites   = Math.max(summary.sites, pkg.columns.site?.distinct_values_count || 0)
        for (const col of Object.values(pkg.columns)) {
            if (DATE_TYPES.includes(col.type)) {
                if (!summary.timeGrains.includes(col.type)) summary.timeGrains.push(col.type)
            }
            else if (col.type === "string" && col.name !== "site" && !summary.breakdowns.some(b => b.name === col.name)) {
                summary.breakdowns.push({ name: col.name, label: humanizeColumnName(col.name), values: col.distinct_values_count || 0 })
            }
        }
    }
    out.forEach(s => {
        s.timeGrains.sort((a, b) => DATE_TYPES.indexOf(a) - DATE_TYPES.indexOf(b))
        // The simplest first, by the number of distinct values
        s.breakdowns.sort((a, b) => a.values - b.values || a.label.localeCompare(b.label))
    })
    return out.sort((a, b) => b.records - a.records)
}


// Time ------------------------------------------------------------------------

export interface TimeStripRow {
    site   : string
    total  : number
    earlier: number
    later  : number
    noDate : number
    years  : Record<number, number>
}

export interface TimeStrip {
    /** The years shown: the last `yearCount` years, up to the current one */
    years : number[]
    /** The first and last dates of the run of years that holds most records */
    range : [string, string]
    /** How many of the dated records are in that range */
    inRange: number
    dated  : number
    /** The dates of all records, outliers included */
    span  : [string, string]
    rows  : TimeStripRow[]
    total : number
    /** Single dates outside the range that hold many records, e.g. placeholder dates */
    spikes: { date: string, count: number }[]
}

/**
 * Counts per site and year, for the last `yearCount` years up to the current
 * one. Older records are counted as earlier, and future ones as later.
 *
 * Separately, `range` is the run of consecutive years that holds the most
 * records, where each year holds at least `threshold` of the busiest year's
 * records, and `spikes` are the busy dates outside it. Neither a percentile
 * range nor the busiest year work for that: a placeholder date can hold more
 * than a 1% tail (1900-01-01 in core 005), or be the busiest year (1869 in
 * core 003), but it is one year far from all the others.
 */
export function getTimeStrip(
    data: app.ServerResponses.DataResponse,
    { now = new Date(), yearCount = 20, threshold = 0.01 } = {}
): TimeStrip {
    const totals: Record<string, number> = {}
    for (const group of data.data) {
        for (const [date, count] of group.rows) {
            totals[date] = (totals[date] || 0) + count
        }
    }

    const dates = Object.keys(totals).filter(d => d !== NO_DATE).sort()
    const perYear: Record<number, number> = {}
    for (const d of dates) {
        perYear[+d.slice(0, 4)] = (perYear[+d.slice(0, 4)] || 0) + totals[d]
    }

    const min = Math.max(...Object.values(perYear)) * threshold
    let firstYear = 0, lastYear = 0, best = -1
    for (const year of Object.keys(perYear).map(Number).filter(y => perYear[y] >= min)) {
        if ((perYear[year - 1] || 0) >= min) continue // not the start of a run
        let end = year, sum = 0
        while ((perYear[end] || 0) >= min) sum += perYear[end++]
        if (sum > best) { best = sum; firstYear = year; lastYear = end - 1 }
    }

    const thisYear  = now.getFullYear()
    const startYear = thisYear - yearCount + 1
    const years: number[] = []
    for (let y = startYear; y <= thisYear; y++) years.push(y)

    const inside  = dates.filter(d => +d.slice(0, 4) >= firstYear && +d.slice(0, 4) <= lastYear)
    const dated   = dates.reduce((sum, d) => sum + totals[d], 0)
    const inRange = inside.reduce((sum, d) => sum + totals[d], 0)

    const rows = data.data.map((group): TimeStripRow => {
        const row: TimeStripRow = {
            site   : (group as any).stratifier || "All sites",
            total  : 0,
            earlier: 0,
            later  : 0,
            noDate : 0,
            years  : {}
        }
        for (const [date, count] of group.rows) {
            row.total += count
            const year = +date.slice(0, 4)
            if (date === NO_DATE) row.noDate += count
            else if (year < startYear) row.earlier += count
            else if (year > thisYear) row.later += count
            else row.years[year] = (row.years[year] || 0) + count
        }
        return row
    }).sort((a, b) => b.total - a.total)

    const total  = rows.reduce((s, r) => s + r.total, 0)
    const spikes = dates
        .filter(d => +d.slice(0, 4) < firstYear || +d.slice(0, 4) > lastYear)
        .map(date => ({ date, count: totals[date] }))
        .filter(s => s.count >= total * 0.005)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    return {
        years,
        range: [inside[0], inside[inside.length - 1]],
        inRange,
        dated,
        span : [dates[0], dates[dates.length - 1]],
        rows,
        total,
        spikes
    }
}


// Dimensions ------------------------------------------------------------------

/**
 * What a breakdown column describes, so that the same dimension matches across
 * resources, e.g. "enc_class_display" and "class_display" → "class", and
 * "observation_code" and "code_display" → "code"
 */
export function getDimension(columnName: string) {
    const words = columnName.toLowerCase().split("_")
    while (words.length > 1 && (words[0] === "enc" || words[0] in RESOURCES)) words.shift()
    while (words.length > 1 && ["display", "code"].includes(words[words.length - 1])) words.pop()
    return words.join("_")
}

type Breakdown = ResourceSummary["breakdowns"][number]

export interface DimensionMatrix {
    /** The dimensions that at least two kinds of data share, the most shared first */
    dimensions: { key: string, label: string, count: number }[]
    rows: {
        label : string
        /** By dimension key, with the columns behind it */
        cells : Record<string, { values: number, columns: Breakdown[] }>
        /** The columns of the dimensions no other kind of data has */
        other : Breakdown[]
    }[]
}

export function getDimensionMatrix(summaries: ResourceSummary[]): DimensionMatrix {
    const rows: DimensionMatrix["rows"] = summaries.map(s => {
        const cells: DimensionMatrix["rows"][number]["cells"] = {}
        for (const b of s.breakdowns) {
            const key  = getDimension(b.name)
            const cell = cells[key] ||= { values: 0, columns: [] }
            cell.values = Math.max(cell.values, b.values)
            cell.columns.push(b)
        }
        return { label: s.label, cells, other: [] }
    })

    const counts: Record<string, number> = {}
    rows.forEach(row => Object.keys(row.cells).forEach(key => counts[key] = (counts[key] || 0) + 1))

    const dimensions = Object.keys(counts)
        .filter(key => counts[key] > 1)
        .map(key => ({ key, label: humanizeColumnName(key), count: counts[key] }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

    for (const row of rows) {
        for (const key in row.cells) {
            if (counts[key] < 2) {
                row.other.push(...row.cells[key].columns)
                delete row.cells[key]
            }
        }
    }

    return { dimensions, rows }
}
