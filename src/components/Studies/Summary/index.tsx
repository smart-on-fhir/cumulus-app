import { CSSProperties, ReactNode, RefObject, useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams }                         from "react-router-dom"
import Breadcrumbs                                 from "../../generic/Breadcrumbs"
import PageHeader                                  from "../../generic/PageHeader"
import Loader                                      from "../../generic/Loader"
import { AlertError }                              from "../../generic/Alert"
import aggregator, { DataPackage, Metadata }       from "../../../Aggregator"
import { fetchChartData }                          from "../../../backend"
import Terminology                                 from "../../../Terminology"
import Highcharts                                  from "../../../highcharts"
import Chart                                       from "../../generic/Chart"
import { escapeHtml, humanizeColumnName }          from "../../../utils"
import { app }                                     from "../../../types"
import {
    Coverage,
    CoverageCell,
    getCoverage,
    getDateColumns,
    getDimensionMatrix,
    getResourceLabel,
    getResourceSummaries,
    getTimeStrip,
    getUploads,
    TimeStrip,
    TimeStripRow
} from "./lib"
import "./Summary.scss"


const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })

const GRAINS: Record<string, string> = {
    year : "Yearly",
    month: "Monthly",
    week : "Weekly",
    day  : "Daily",
    date : "Daily"
}

function formatMonth(date: string) {
    return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// Tooltips -------------------------------------------------------------------
// HTML for the global Tooltip component (the data-tooltip attribute). It keeps
// line breaks, so the HTML is built without them.

// Errors (not uploaded, or the last attempt failed) and warnings (no date)
const ERROR_ICON   = `<i class="fa-solid fa-circle-xmark"></i>`
const WARNING_ICON = `<i class="fa-solid fa-circle-exclamation"></i>`

/** ", 2 not uploaded, 1 failed, 3 without a date", or nothing */
function problems({ expected, uploaded, failed, undated }: Pick<CoverageCell, "expected" | "uploaded" | "failed" | "undated">) {
    return (expected > uploaded ? `, <span class="tt-error">${expected - uploaded} not uploaded</span>` : "") +
        (failed ? `, <span class="tt-error">${failed} failed</span>` : "") +
        (undated ? `, <span class="tt-warning">${undated} without a date</span>` : "")
}

function packageList(tables: string[], cell?: CoverageCell) {
    const rows = tables.map(table => {
        const upload = cell?.uploads.find(u => u.table === table)
        const status = !cell ? "" :
            !upload || upload.lastError ? `<td class="tt-error">${ERROR_ICON}</td>` :
            !upload.lastUpdate ? `<td class="tt-warning">${WARNING_ICON}</td>` :
            `<td class="tt-ok">✓</td>`
        // When the last attempt failed, the date of the error
        const date = !cell ? "" :
            !upload ? `<td class="tt-muted">not uploaded</td>` :
            upload.lastError ? `<td class="tt-error">${formatDate(upload.lastError)}</td>` :
            `<td class="tt-muted">${ upload.lastUpdate ? formatDate(upload.lastUpdate) : "no date" }</td>`
        const note = upload?.earlierError ?
            `<div class="tt-note">Error on ${formatDate(upload.earlierError)}, then updated</div>` : ""
        return `<tr>${status}<td><div class="tt-name">${escapeHtml(humanizeColumnName(table))}</div>${note}</td>${date}</tr>`
    })
    return `<table>${rows.join("")}</table>`
}

function groupTooltip(group: Coverage["groups"][number]) {
    return `<div class="summary-tooltip"><b>${escapeHtml(group.label)}</b>` +
        `<div class="tt-muted">${group.tables.length} ${group.tables.length === 1 ? "package" : "packages"}</div>` +
        packageList(group.tables) + `</div>`
}

function siteTooltip(site: string, coverage: Coverage) {
    const cells    = Object.values(coverage.cells[site])
    const expected = cells.reduce((s, c) => s + c.expected, 0)
    const uploaded = cells.reduce((s, c) => s + c.uploaded, 0)
    const failed   = cells.reduce((s, c) => s + c.failed, 0)
    const undated  = cells.reduce((s, c) => s + c.undated, 0)
    const latest   = cells.map(c => c.lastUpdate || "").sort().pop()
    return `<div class="summary-tooltip"><b>${escapeHtml(humanizeColumnName(site))}</b>` +
        `<div>${uploaded} of ${expected} packages uploaded` +
        problems({ expected, uploaded, failed, undated }) + `</div>` +
        `<div class="tt-muted">Latest update: ${latest ? formatDate(latest) : "unknown"}</div></div>`
}

function cellTooltip(site: string, group: Coverage["groups"][number], cell: CoverageCell) {
    return `<div class="summary-tooltip"><b>${escapeHtml(humanizeColumnName(site))}</b> · ${escapeHtml(group.label)}` +
        `<div class="tt-muted">${cell.uploaded} of ${cell.expected} packages uploaded` +
        problems(cell) + `</div>` +
        packageList(group.tables, cell) + `</div>`
}

/**
 * The custom properties of the .heat class: `age` (0 for the oldest, 1 for the
 * newest) sets the color from orange to green, and `alpha` its strength
 */
function heatStyle(age: number, alpha: number) {
    return { "--age": age.toFixed(3), "--alpha": alpha.toFixed(2) } as CSSProperties
}

/**
 * The oldest and newest latest updates in the table, so that its colors compare
 * the sites with each other rather than with today
 */
function getUploadRange(coverage: Coverage): [number, number] | null {
    const dates = Object.values(coverage.cells)
        .flatMap(cells => Object.values(cells))
        .filter(cell => cell.lastUpdate)
        .map(cell => +new Date(cell.lastUpdate!))
    return dates.length ? [Math.min(...dates), Math.max(...dates)] : null
}

/**
 * The strength of a cell's color, from the share of its packages that were
 * uploaded. Light, so that the text stays readable.
 */
function getCoverageAlpha(share: number) {
    return 0.05 + 0.15 * share
}

/** From 0 for the oldest update in the range to 1 for the newest */
function getUploadRecency(date: string, [oldest, newest]: [number, number]) {
    return newest > oldest ? (+new Date(date) - oldest) / (newest - oldest) : 1
}

/** Loads one async value, and reloads it when the deps change */
function useAsync<T>(load: () => Promise<T>, deps: any[]) {
    const [state, setState] = useState<{ loading: boolean, error?: Error, data?: T }>({ loading: true })
    useEffect(() => {
        let current = true
        setState({ loading: true })
        load().then(
            data  => current && setState({ loading: false, data }),
            error => current && setState({ loading: false, error })
        )
        return () => { current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
    return state
}

/** `source` says where the data comes from and what it costs, on hover */
function Section({ title, source, children }: { title: string, source: string, children: ReactNode }) {
    return (
        <section className="study-summary-section">
            <h4 className="mt-3 mb-05" title={ source }>{ title }</h4>
            { children }
        </section>
    )
}

export default function StudySummary() {
    const { studyId = "", version = "" } = useParams()

    const packages = useAsync(() => aggregator.filterPackages({ study: studyId, version }), [studyId, version])
    const versions = useAsync(() => aggregator.getStudyVersions(studyId), [studyId])
    const metadata = useAsync(() => aggregator.getMetadata(), [])

    return (
        <div className="container study-summary">
            <title>{ humanizeColumnName(studyId) } Summary</title>
            <Breadcrumbs links={[
                { name: "Home", href: "/" },
                { name: Terminology.study.namePlural, href: "/studies" },
                { name: humanizeColumnName(studyId), href: "/studies/" + studyId },
                { name: "Version " + version, href: "/studies/" + studyId + "/" + version },
                { name: "Summary", href: "/studies/" + studyId + "/" + version + "/summary" },
            ]} />
            <PageHeader
                title={ <>{ humanizeColumnName(studyId) } <span className="color-muted">/ { version } / Summary</span></> }
                icon={ Terminology.study.icon }
                description={ "Prototypes for discussion: three ways to summarize who sent data, what kind of " +
                    "data, and when it is from. Each section says where its data comes from and what it costs." } />

            { versions.data && versions.data.length > 1 && <p className="study-summary-versions">
                Versions: { versions.data.map(v => v === version ?
                    <b key={v}>{ v }</b> :
                    <Link key={v} className="link" to={`/studies/${studyId}/${v}/summary`}>{ v }</Link>
                )}
            </p> }

            { packages.loading ? <Loader msg="Loading packages..." /> :
              packages.error ? <AlertError>{ packages.error + "" }</AlertError> :
              !packages.data!.length ? <AlertError>No packages found for this version</AlertError> :
              <>
                <Section title="A. Who sent what, and when" source={
                    "Built from /metadata: one request (about 5 s), cached for the session. It only has " +
                    "the latest upload, data update, aggregation and error times of each package, so it " +
                    "can't show an upload history."
                }>
                    { metadata.loading ? <Loader msg="Loading upload metadata..." /> :
                      metadata.error ? <AlertError>{ metadata.error + "" }</AlertError> :
                      <CoverageTable packages={ packages.data! } metadata={ metadata.data! } study={ studyId } version={ version } /> }
                </Section>

                <Section title="B. What kind of data" source="Built from the package list, which the app already loads: no extra requests.">
                    <ResourceTable packages={ packages.data! } />
                    <h5 className="mt-2 mb-05">Dimensions by kind of data</h5>
                    <DimensionMatrixView packages={ packages.data! } />
                    <h5 className="mt-2 mb-05">Packages and columns by kind of data</h5>
                    <DataTreemap packages={ packages.data! } />
                    <h5 className="mt-2 mb-05">Shared dimensions</h5>
                    <DimensionSankey packages={ packages.data! } />
                </Section>

                <Section title="C. When the data is from" source={
                    "Built from one package's counts per site and date: one chart-data request per package " +
                    "(5–10 s). A real page would need these precomputed, in our backend or as an aggregator summary."
                }>
                    <TimeSection packages={ packages.data! } />
                </Section>
              </>
            }
        </div>
    )
}

function CoverageTable({ packages, metadata, study, version }: {
    packages: DataPackage[]
    metadata: Metadata
    study   : string
    version : string
}) {
    const coverage = useMemo(
        () => getCoverage(packages, getUploads(metadata, study), version),
        [packages, metadata, study, version]
    )
    const range = useMemo(() => getUploadRange(coverage), [coverage])
    const scroller = useRef<HTMLDivElement>(null)

    useDragToPan(scroller)

    if (!coverage.sites.length) {
        return <p className="color-muted">No uploads found in the metadata for this version.</p>
    }

    return (
        <>
            <div className="study-summary-legend small color-muted mb-05">
                { range && <span>
                    { formatMonth(new Date(range[0]).toISOString()) } <i className="heat-swatch" style={ { "--alpha": getCoverageAlpha(1) + 0.1 } as CSSProperties } /> { formatMonth(new Date(range[1]).toISOString()) }:
                    the color shows how recent the latest update is
                </span> }
                <span>Stronger colors mean more of the packages were uploaded</span>
                <span><i className="fa-solid fa-circle-xmark coverage-error" /> some packages were not uploaded, or their last update failed</span>
                <span><i className="fa-solid fa-circle-exclamation coverage-warning" /> some have no date in the metadata (hover a cell for details)</span>
            </div>
            <div className="coverage-scroll" ref={ scroller }>
                <table className="table table-condensed coverage-table" style={ { "--sites": coverage.sites.length } as CSSProperties }>
                    <thead>
                        <tr>
                            <th>Data</th>
                            { coverage.sites.map(site => (
                                <th key={ site } data-tooltip={ siteTooltip(site, coverage) }>{ humanizeColumnName(site) }</th>
                            )) }
                        </tr>
                    </thead>
                    <tbody>
                        { coverage.groups.map(g => (
                            <tr key={ g.label }>
                                <th className="nowrap" data-tooltip={ groupTooltip(g) }>{ g.label }</th>
                                { coverage.sites.map(site => {
                                    const cell = coverage.cells[site][g.label]
                                    const icons = <>
                                        { (cell.uploaded < cell.expected || cell.failed > 0) && <i className="fa-solid fa-circle-xmark coverage-error" /> }
                                        { cell.undated > 0 && <i className="fa-solid fa-circle-exclamation coverage-warning" /> }
                                    </>
                                    if (!cell.uploaded) {
                                        return (
                                            <td key={ site } className="coverage-cell none" data-tooltip={ cellTooltip(site, g, cell) }>
                                                <span className="coverage-count">
                                                    <b>0</b><span className="color-muted">/{ cell.expected }</span>{ icons }
                                                </span>
                                            </td>
                                        )
                                    }
                                    return (
                                        <td key={ site }
                                            className={ "coverage-cell " + (cell.lastUpdate ? "heat" : "undated") }
                                            // How recent the latest update is sets the color, and the share of packages uploaded its strength
                                            style={ cell.lastUpdate && range ? heatStyle(getUploadRecency(cell.lastUpdate, range), getCoverageAlpha(cell.uploaded / cell.expected)) : undefined }
                                            data-tooltip={ cellTooltip(site, g, cell) }>
                                            <div className="coverage-cell-box">
                                                <div className="coverage-cell-row">
                                                    <span className="coverage-count">
                                                        <b>{ cell.uploaded }</b><span className="color-muted">/{ cell.expected }</span>{ icons }
                                                    </span>
                                                    <span className="coverage-date">{ cell.lastUpdate ? formatMonth(cell.lastUpdate) : "no date" }</span>
                                                </div>
                                            </div>
                                        </td>
                                    )
                                }) }
                            </tr>
                        )) }
                    </tbody>
                </table>
            </div>
        </>
    )
}

function ResourceTable({ packages }: { packages: DataPackage[] }) {
    const summaries = useMemo(() => getResourceSummaries(packages), [packages])
    const [open, setOpen] = useState<string[]>([])
    const toggle = (label: string) => setOpen(open.includes(label) ? open.filter(l => l !== label) : [...open, label])
    return (
        <div className="table-responsive">
            <table className="table table-condensed table-border-x resource-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th className="right">Packages</th>
                        <th className="right">Records</th>
                        <th>Over time</th>
                        <th>Broken down by</th>
                    </tr>
                </thead>
                <tbody>
                    { summaries.map(s => {
                        const expanded = open.includes(s.label)
                        // Expanded, the packages are listed in a second row
                        // under the first four columns, and the breakdowns
                        // span both rows
                        return [
                            // Any cell expands the row, but only the top four collapse it.
                            // The button's clicks (and keys) land here too.
                            <tr key={ s.label } className={ expanded ? "resource-row open" : "resource-row" } onClick={ e => {
                                if (!expanded || !(e.target as Element).closest(".resource-breakdowns-cell")) toggle(s.label)
                            } }>
                                <th className="nowrap">
                                    <button type="button" className="resource-toggle" aria-expanded={ expanded }>
                                        <i className={ "fa-solid " + (expanded ? "fa-caret-down" : "fa-caret-right") } />{ s.label }
                                    </button>
                                </th>
                                <td className="right">{ s.packages.length }</td>
                                <td className="right nowrap" title={ s.records.toLocaleString() + " in the largest package" }>{ compact.format(s.records) }</td>
                                <td className="nowrap">{ s.timeGrains.map(g => GRAINS[g] || g).join(", ") || <span className="color-muted">–</span> }</td>
                                <td className="resource-breakdowns-cell" rowSpan={ expanded ? 2 : undefined }>
                                    { /* One line, cut with an ellipsis; expanded, one per line */ }
                                    <div className={ expanded ? "resource-breakdowns open" : "resource-breakdowns" }>
                                        { s.breakdowns.map((b, i) => (
                                            <span key={ b.name } title={ `${b.name}: ${b.values.toLocaleString()} distinct values` }>
                                                { i > 0 && !expanded && ", " }{ b.label } <span className="resource-values color-muted">({ compact.format(b.values) })</span>
                                            </span>
                                        )) }
                                    </div>
                                </td>
                            </tr>,
                            expanded && (
                                <tr key={ s.label + "/packages" } className="resource-packages">
                                    <td colSpan={ 4 }>
                                        <div className="resource-package-list">
                                            { s.packages.map(p => (
                                                <div key={ p.id }>
                                                    { /* The same icons as the package list on the version page */ }
                                                    <i className="material-symbols-outlined color-brand-2">{ p.type === "flat" ? "table" : "deployed_code" }</i>
                                                    <Link className="link" to={ "/packages/" + p.id } title={ humanizeColumnName(p.name) }>{ humanizeColumnName(p.name) }</Link>
                                                </div>
                                            )) }
                                        </div>
                                    </td>
                                </tr>
                            )
                        ]
                    }) }
                </tbody>
            </table>
        </div>
    )
}

/** A dot's diameter for a number of distinct values, on a log scale: 1 → 6px, 1K → 18px, 100K+ → 26px */
function dotSize(values: number) {
    return Math.round(6 + 4 * Math.min(Math.log10(Math.max(values, 1)), 5))
}

function columnsTooltip(title: string, columns: { name: string, values: number }[]) {
    return `<div class="summary-tooltip"><b>${escapeHtml(title)}</b><table>` +
        columns.map(c => `<tr><td>${escapeHtml(c.name)}</td><td class="tt-muted">${c.values.toLocaleString()} values</td></tr>`).join("") +
        `</table></div>`
}

/**
 * Which dimensions each kind of data can be broken down by: the ones at least
 * two kinds share get a column each, and the rest are counted under Other
 */
function DimensionMatrixView({ packages }: { packages: DataPackage[] }) {
    const matrix   = useMemo(() => getDimensionMatrix(getResourceSummaries(packages)), [packages])
    const scroller = useRef<HTMLDivElement>(null)

    useDragToPan(scroller)

    if (!matrix.dimensions.length) {
        return <p className="color-muted">No two kinds of data share a dimension.</p>
    }

    return (
        <>
            <div className="study-summary-legend small color-muted mb-05">
                <span>
                    The dot size shows the number of distinct values:
                    { [10, 1000, 100000].map(n => (
                        <span key={ n } className="dimension-sample">
                            <i className="dimension-dot" style={ { "--size": dotSize(n) + "px" } as CSSProperties } /> { compact.format(n) }
                        </span>
                    )) }
                </span>
                <span>Other: dimensions only that kind of data has (hover for details)</span>
            </div>
            <div className="coverage-scroll" ref={ scroller }>
                <table className="table table-condensed dimension-matrix">
                    <thead>
                        <tr>
                            <th>Data</th>
                            { matrix.dimensions.map(d => <th key={ d.key }>{ d.label }</th>) }
                            <th>Other</th>
                        </tr>
                    </thead>
                    <tbody>
                        { matrix.rows.map(row => (
                            <tr key={ row.label }>
                                <th className="nowrap">{ row.label }</th>
                                { matrix.dimensions.map(d => {
                                    const cell = row.cells[d.key]
                                    return (
                                        <td key={ d.key } className="dimension-cell" data-tooltip={ cell ? columnsTooltip(`${row.label} · ${d.label}`, cell.columns) : undefined }>
                                            { cell && <i className="dimension-dot" style={ { "--size": dotSize(cell.values) + "px" } as CSSProperties } /> }
                                        </td>
                                    )
                                }) }
                                <td className="dimension-cell dimension-other" data-tooltip={ row.other.length ? columnsTooltip(`${row.label} · Other`, row.other) : undefined }>
                                    { row.other.length > 0 && "+" + row.other.length }
                                </td>
                            </tr>
                        )) }
                    </tbody>
                </table>
            </div>
        </>
    )
}

/**
 * Each kind of data, its packages and their columns, as a treemap to drill
 * into. The area is the number of columns, not records: packages count the
 * same records in different ways, so their totals don't add up. The color
 * shows the records instead, on a log scale.
 */
function DataTreemap({ packages }: { packages: DataPackage[] }) {
    const options = useMemo((): Highcharts.Options => {
        const summaries = getResourceSummaries(packages)
        const log  = (n: number) => Math.log10(Math.max(n, 1))
        const data: Highcharts.PointOptionsObject[] = []

        for (const s of summaries) {
            const kindId = "kind:" + s.label
            data.push({
                id        : kindId,
                name      : s.label,
                colorValue: log(s.records),
                custom    : { kind: "kind", records: s.records, packages: s.packages.length }
            } as any)
            for (const pkg of s.packages) {
                // The site and the count (cnt) are in every package, and aren't dimensions
                const columns = Object.values(pkg.columns).filter(c => c.name !== "site" && c.name !== "cnt")
                data.push({
                    id        : "pkg:" + pkg.id,
                    parent    : kindId,
                    name      : humanizeColumnName(pkg.name),
                    colorValue: log(pkg.total),
                    custom    : { kind: "package", records: pkg.total, columns: columns.length }
                } as any)
                for (const col of columns) {
                    const values = col.distinct_values_count
                    data.push({
                        parent    : "pkg:" + pkg.id,
                        name      : humanizeColumnName(col.name) + (values ? ` (${compact.format(values)})` : ""),
                        value     : 1,
                        colorValue: log(pkg.total),
                        custom    : { kind: "column", type: col.type, values }
                    } as any)
                }
            }
        }

        const values = data.map(d => (d as any).colorValue as number)

        return {
            chart    : { height: 560, backgroundColor: "transparent" },
            title    : { text: undefined },
            credits  : { enabled: false },
            exporting: { enabled: false },
            colorAxis: {
                min     : Math.min(...values),
                max     : Math.max(...values),
                minColor: "#e8f0fa",
                maxColor: "#4f86c6",
                labels  : { formatter() { return compact.format(10 ** (this.value as number)) } }
            },
            legend: {
                title : { text: "Records (log scale)", style: { fontWeight: "400" } },
                align : "right",
                symbolWidth: 240
            },
            tooltip: {
                useHTML: true,
                formatter(this: any) {
                    const c = this.point.custom || {}
                    const name = `<b>${escapeHtml(this.point.name)}</b><br/>`
                    if (c.kind === "kind")    return name + `${c.packages} packages<br/>${c.records.toLocaleString()} records in the largest`
                    if (c.kind === "package") return name + `${c.columns} columns<br/>${c.records.toLocaleString()} records`
                    return name + `Type: ${escapeHtml(c.type)}` + (c.values ? `<br/>${c.values.toLocaleString()} distinct values` : "")
                }
            },
            series: [{
                type               : "treemap",
                name               : "All data",
                layoutAlgorithm    : "squarified",
                allowTraversingTree: true,
                // The levels count from the node shown, so each drill looks the same
                levelIsConstant    : false,
                animationLimit     : 1000,
                borderColor        : "var(--color-window-bg)",
                dataLabels         : { enabled: false },
                // Groups get some space around them, and their labels are
                // headers above their children rather than over them. Long
                // labels are cut to their boxes.
                levels: [
                    {
                        level       : 1,
                        groupPadding: 4,
                        // Gaps between the columns after drilling into a package
                        borderWidth : 3,
                        dataLabels  : {
                            enabled      : true,
                            headers      : true,
                            align        : "left",
                            verticalAlign: "top",
                            style        : { fontSize: "13px", fontWeight: "600", textOutline: "none", color: "#000c", textOverflow: "ellipsis", whiteSpace: "nowrap" }
                        }
                    },
                    {
                        level       : 2,
                        groupPadding: 2,
                        // After drilling into a kind of data, these are the
                        // columns: the gaps tell them apart, as they share
                        // their package's color
                        borderWidth : 3,
                        dataLabels  : {
                            enabled      : true,
                            headers      : true,
                            align        : "left",
                            verticalAlign: "top",
                            style        : { fontSize: "11px", fontWeight: "400", textOutline: "none", color: "#000a", textOverflow: "ellipsis", whiteSpace: "nowrap" }
                        }
                    },
                    { level: 3, borderWidth: 0 }
                ] as any,
                data
            } as Highcharts.SeriesTreemapOptions]
        }
    }, [packages])

    return (
        <>
            <div className="study-summary-legend small color-muted mb-05">
                <span>Area: the number of columns. Color: the number of records.</span>
                <span>Click a box to see its packages, then their columns</span>
            </div>
            <Chart options={ options } />
        </>
    )
}

/**
 * Which kinds of data share which dimensions: a link for each dimension a kind
 * of data has. The shared ones collect many links. The ones only one kind of
 * data has are lumped together, so they don't drown the rest.
 */
function DimensionSankey({ packages }: { packages: DataPackage[] }) {
    const options = useMemo((): Highcharts.Options => {
        const matrix = getDimensionMatrix(getResourceSummaries(packages))
        const OTHER  = "Only this kind of data"
        const links: any[] = []

        for (const row of matrix.rows) {
            for (const d of matrix.dimensions) {
                const cell = row.cells[d.key]
                if (cell) {
                    links.push({ from: row.label, to: d.label, weight: 1, custom: { columns: cell.columns } })
                }
            }
            if (row.other.length) {
                links.push({ from: row.label, to: OTHER, weight: row.other.length, custom: { columns: row.other } })
            }
        }

        const nodeCount = Math.max(matrix.rows.length, matrix.dimensions.length + 1)

        return {
            // The margins make room for the labels, outside the nodes
            chart    : { height: Math.max(360, nodeCount * 34), backgroundColor: "transparent", marginLeft: 170, marginRight: 190 },
            title    : { text: undefined },
            credits  : { enabled: false },
            exporting: { enabled: false },
            tooltip  : {
                useHTML: true,
                formatter(this: any) {
                    const p = this.point
                    if (p.isNode) {
                        return `<b>${escapeHtml(p.name)}</b><br/>` + (p.linksTo.length ?
                            `${p.linksTo.length} kinds of data` :
                            `${p.linksFrom.length} dimensions`)
                    }
                    return `<b>${escapeHtml(p.from)}</b> → ${escapeHtml(p.to)}<br/>` +
                        p.custom.columns.map((c: any) => `${escapeHtml(c.name)}: ${c.values.toLocaleString()} values`).join("<br/>")
                }
            },
            series: [{
                type       : "sankey",
                name       : "Dimensions",
                keys       : ["from", "to", "weight", "custom"],
                data       : links,
                nodes      : [{ id: OTHER, color: "#bab0ac" }],
                nodeWidth  : 12,
                nodePadding: 8,
                linkOpacity: 0.3,
                // Each link fades from its kind of data's color to its dimension's
                linkColorMode: "gradient",
                curveFactor: 0.4,
                dataLabels : {
                    crop    : false,
                    overflow: "allow",
                    style   : { fontSize: "12px", fontWeight: "400", textOutline: "none", color: "#000c", width: 160, textOverflow: "ellipsis", whiteSpace: "nowrap" }
                },
                // The kinds of data are labelled on the left of their nodes,
                // and the dimensions on the right
                levels: [
                    { level: 0, dataLabels: { align: "right", x: -18 } },
                    { level: 1, dataLabels: { align: "left" , x: 18 } }
                ]
            } as Highcharts.SeriesSankeyOptions]
        }
    }, [packages])

    return (
        <>
            <div className="study-summary-legend small color-muted mb-05">
                <span>Kinds of data on the left, the dimensions they can be broken down by on the right. The more links a dimension collects, the more kinds of data share it.</span>
            </div>
            <Chart options={ options } />
        </>
    )
}

function TimeSection({ packages }: { packages: DataPackage[] }) {
    const dated = useMemo(() => packages
        .filter(p => p.type !== "flat" && getDateColumns(p).length)
        .sort((a, b) => getResourceLabel(a.name).localeCompare(getResourceLabel(b.name)) || a.name.localeCompare(b.name)),
        [packages]
    )

    const [pkgId, setPkgId] = useState(() => (
        dated.find(p => p.name.includes("encounter") && p.name.endsWith("_month")) || dated[0]
    )?.id)

    const pkg    = dated.find(p => p.id === pkgId)
    const column = pkg && getDateColumns(pkg)[0]

    const result = useAsync<app.ServerResponses.DataResponse | null>(async () => {
        if (!pkg || !column) return null
        return fetchChartData({ column: column.name, stratifier: pkg.columns.site ? "site" : undefined, dataPackage: pkg })
    }, [pkgId])

    const strip = useMemo(() => result.data ? getTimeStrip(result.data) : null, [result.data])

    if (!dated.length) {
        return <p className="color-muted">None of this version's packages has a date column.</p>
    }

    return (
        <>
            <div className="mb-1">
                <select className="form-control" style={{ width: "auto" }} value={ pkgId } onChange={ e => setPkgId(e.target.value) }>
                    { dated.map(p => (
                        <option key={ p.id } value={ p.id }>
                            { getResourceLabel(p.name) } – { humanizeColumnName(p.name) } ({ getDateColumns(p)[0].name })
                        </option>
                    )) }
                </select>
            </div>
            { result.loading ? <Loader msg="Loading counts per site and date (5–10 s)..." /> :
              result.error ? <AlertError>{ result.error + "" }</AlertError> :
              strip && <TimeStripView strip={ strip } /> }
        </>
    )
}

function percentOf(n: number, of: number) {
    return (n / of * 100).toFixed(n / of < 0.01 ? 2 : 1) + "%"
}

function stripTooltip(row: TimeStripRow, heading: string, count: number, note: string) {
    return `<div class="summary-tooltip"><b>${escapeHtml(humanizeColumnName(row.site))}</b> · ${heading}` +
        `<div>${count.toLocaleString()} records</div>` +
        `<div class="tt-muted">${note}${note ? ", " : ""}${percentOf(count, row.total)} of this site's records</div></div>`
}

/**
 * Lets the mouse pan an element that scrolls sideways, by dragging it. Sets
 * `data-pannable` while its content overflows, and `data-panning` while
 * dragging, for the cursors.
 */
function useDragToPan(ref: RefObject<HTMLElement | null>) {
    useEffect(() => {
        const el = ref.current
        if (!el) return

        const update = () => el.toggleAttribute("data-pannable", el.scrollWidth > el.clientWidth)
        const observer = new ResizeObserver(update)
        observer.observe(el)
        update()

        let startX = 0, startScroll = 0
        const onMove = (e: PointerEvent) => { el.scrollLeft = startScroll - (e.clientX - startX) }
        const onUp = (e: PointerEvent) => {
            el.releasePointerCapture(e.pointerId)
            el.removeAttribute("data-panning")
            el.removeEventListener("pointermove", onMove)
            el.removeEventListener("pointerup", onUp)
            el.removeEventListener("pointercancel", onUp)
        }
        const onDown = (e: PointerEvent) => {
            // Touch and pens scroll natively
            if (e.pointerType !== "mouse" || e.button !== 0 || !el.hasAttribute("data-pannable")) return
            e.preventDefault() // no text selection
            startX = e.clientX
            startScroll = el.scrollLeft
            el.setPointerCapture(e.pointerId)
            el.setAttribute("data-panning", "")
            el.addEventListener("pointermove", onMove)
            el.addEventListener("pointerup", onUp)
            el.addEventListener("pointercancel", onUp)
        }

        el.addEventListener("pointerdown", onDown)
        return () => {
            observer.disconnect()
            el.removeEventListener("pointerdown", onDown)
            el.removeEventListener("pointermove", onMove)
        }
    }, [ref])
}

function TimeStripView({ strip }: { strip: TimeStrip }) {
    const outside  = strip.dated - strip.inRange
    const noDate   = strip.rows.reduce((s, r) => s + r.noDate, 0)
    const percent  = (n: number, of = strip.total) => percentOf(n, of)
    const first    = strip.years[0]
    const last     = strip.years[strip.years.length - 1]
    const scroller = useRef<HTMLDivElement>(null)

    useDragToPan(scroller)

    return (
        <>
            <p>
                { percent(strip.inRange, strip.dated) } of the dated records are
                from <b>{ formatMonth(strip.range[0]) }</b> to <b>{ formatMonth(strip.range[1]) }</b>.
                The full span, { formatMonth(strip.span[0]) } to { formatMonth(strip.span[1]) }, comes
                from { outside.toLocaleString() } records ({ percent(outside) }) outside that range.
                { noDate > 0 && <> Another { noDate.toLocaleString() } records ({ percent(noDate) }) have no date.</> }
            </p>
            { strip.spikes.length > 0 && <div className="study-summary-spikes">
                <b>Possible placeholder or bad dates: </b>
                { strip.spikes.map((s, i) => (
                    <span key={ s.date }>{ i > 0 && ", " }<code>{ s.date }</code> – { s.count.toLocaleString() } records</span>
                )) }
            </div> }
            {/* Three tables side by side, so that only the years scroll. Their
                rows line up because every cell is one line tall. */}
            <div className="time-strip">
                <table className="time-strip-side">
                    <thead>
                        <tr>
                            <th />
                            <th className="time-strip-extra">Earlier</th>
                        </tr>
                    </thead>
                    <tbody>
                        { strip.rows.map(row => (
                            <tr key={ row.site }>
                                <th className="nowrap right">{ humanizeColumnName(row.site) }</th>
                                <td className="time-strip-extra" data-tooltip={ stripTooltip(row, "Earlier", row.earlier, `Dated before ${first}`) }>
                                    { row.earlier ? compact.format(row.earlier) : "" }
                                </td>
                            </tr>
                        )) }
                    </tbody>
                </table>
                <div className="time-strip-scroll" ref={ scroller }>
                    <table>
                        <thead>
                            <tr>
                                { strip.years.map(y => <th key={ y } className="time-strip-year">{ String(y).slice(2) }</th>) }
                            </tr>
                        </thead>
                        <tbody>
                            { strip.rows.map(row => {
                                const max = Math.max(1, ...Object.values(row.years))
                                return (
                                    <tr key={ row.site }>
                                        { strip.years.map((y, i) => {
                                            const count = row.years[y] || 0
                                            // How old the year is sets the color, and the count its strength
                                            const style = count ? heatStyle(i / (strip.years.length - 1), 0.15 + 0.85 * Math.sqrt(count / max)) : undefined
                                            return <td key={ y } className={ "time-strip-cell" + (count ? " heat" : "") } style={ style }
                                                data-tooltip={ stripTooltip(row, String(y), count, "") } />
                                        }) }
                                    </tr>
                                )
                            }) }
                        </tbody>
                    </table>
                </div>
                <table className="time-strip-side">
                    <thead>
                        <tr>
                            <th className="time-strip-extra">Later</th>
                            <th className="time-strip-extra">No date</th>
                            <th className="right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        { strip.rows.map(row => (
                            <tr key={ row.site }>
                                <td className="time-strip-extra" data-tooltip={ stripTooltip(row, "Later", row.later, `Dated after ${last}`) }>
                                    { row.later ? compact.format(row.later) : "" }
                                </td>
                                <td className="time-strip-extra" data-tooltip={ stripTooltip(row, "No date", row.noDate, "No date") }>
                                    { row.noDate ? compact.format(row.noDate) : "" }
                                </td>
                                <td className="right nowrap time-strip-total" data-tooltip={
                                    `<div class="summary-tooltip"><b>${escapeHtml(humanizeColumnName(row.site))}</b> · All records` +
                                    `<div>${row.total.toLocaleString()} records</div>` +
                                    `<div class="tt-muted">${percentOf(row.total, strip.total)} of all sites' records</div></div>`
                                }>{ compact.format(row.total) }</td>
                            </tr>
                        )) }
                    </tbody>
                </table>
            </div>
            <div className="study-summary-legend small color-muted">
                <span>{ first } <i className="heat-swatch" style={ { "--alpha": 0.55 } as CSSProperties } /> { last }: the color shows how old the data is</span>
                <span>Stronger colors mean more records, relative to that site's busiest year, so small sites stay visible</span>
                <span>Hover a cell for details</span>
            </div>
        </>
    )
}
