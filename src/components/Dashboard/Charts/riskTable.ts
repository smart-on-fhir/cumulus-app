import Highcharts      from "../../../highcharts"
import { LifeTableRow } from "./kaplanMeier"


/**
 * Class name of the "number at risk" axes, so that the inspector does not take
 * them for the x axis
 */
export const RISK_TABLE_CLASS = "survival-at-risk"

/**
 * Space between a row's numbers and its axis line (not drawn), in px. The group
 * name uses the same, so that both sit on the same line.
 */
const ROW_DISTANCE = 4

/**
 * Space between the x axis (its title) and the table heading, in px
 */
const TABLE_MARGIN = 10

/**
 * The table heading, shown above the group names
 */
export const RISK_TABLE_HEADING = "Number at risk"


/**
 * Space between two rows, in px (Highcharts uses 15px between axes by default)
 */
const ROW_MARGIN = 5

/**
 * The table font size, relative to the x axis labels
 */
const FONT_SCALE = 0.92

/**
 * Space between the group names and the plot area, in px
 */
const NAME_PADDING = 8

/**
 * Smallest space between two numbers in a row, in px
 */
const NUMBER_PADDING = 8

/**
 * Adds a "number at risk" table under a survival chart: one row per visible
 * curve, with the number of records still followed at each time point.
 *
 * Every row is an x axis linked to the main one, so Highcharts lines its numbers
 * up with the time points and reserves the space for it under the plot. It is
 * added only when the chart is rendered, so that the saved options (and the
 * inspectors that edit them) keep a single x axis.
 *
 * The rows show the same time points as the x axis labels. When the numbers
 * don't fit, all rows show every 2nd (3rd, ...) of them instead of rotating.
 */
export function withRiskTable(options: Highcharts.Options): Highcharts.Options
{
    const curves = (options.series || []).filter((s: any) =>
        s.type === "line" &&
        s.visible !== false &&
        s.data?.some((p: any) => p?.custom?.survival)
    ) as any[]

    if (!curves.length) {
        return options
    }

    const mainAxis = (Array.isArray(options.xAxis) ? options.xAxis[0] : options.xAxis) || {}

    // The number at risk of every curve by tick position: x on linear axes,
    // the point index on category axes
    const counts = curves.map(curve => {
        const map = new Map<number, string>()
        curve.data.forEach((p: any, i: number) => {
            const row: LifeTableRow | undefined = p?.custom?.survival
            if (row) {
                map.set(p.x ?? i, Math.round(row.atRisk).toLocaleString())
            }
        })
        return map
    })

    // The widest number in the table, in characters. All rows use it to pick
    // which time points to show, so that they stay lined up.
    const maxChars = Math.max(1, ...counts.flatMap(map => [...map.values()].map(s => s.length)))

    const fontSize = scaleFontSize(mainAxis.labels?.style?.fontSize, FONT_SCALE)

    // What the heading and the rows have in common: an axis that only shows
    // its title (left of the plot) and labels
    const tableAxis = (id: string, title: string, color?: string): Highcharts.XAxisOptions => ({
        id           : "survival-at-risk-" + id,
        className    : RISK_TABLE_CLASS,
        linkedTo     : 0,
        type         : mainAxis.type,
        reversed     : mainAxis.reversed,
        lineWidth    : 0,
        tickLength   : 0,
        gridLineWidth: 0,
        crosshair    : false,
        margin       : ROW_MARGIN,
        title: {
            text     : title,
            align    : "low",
            textAlign: "right",
            offset   : 0,
            x        : -NAME_PADDING,
            y        : ROW_DISTANCE,
            style    : {
                color,
                fontSize,
                fontWeight: "normal"
            }
        }
    })

    // Above the group names, in bold
    const headingAxis = tableAxis("heading", RISK_TABLE_HEADING)
    const heading: Highcharts.XAxisOptions = {
        ...headingAxis,
        margin: TABLE_MARGIN,
        title : { ...headingAxis.title, style: { ...headingAxis.title!.style, fontWeight: "bold" } },
        labels: { enabled: false }
    }

    const rows: Highcharts.XAxisOptions[] = curves.map((curve, i) => ({
        ...tableAxis(curve.id, curve.name, curve.color),
        labels: {
            distance    : ROW_DISTANCE,
            // Typed as number[], but false turns it off
            autoRotation: false as any,
            style: {
                color   : curve.color,
                fontSize,
                // Highcharts would squeeze every number into the width of one
                // time point and cut the ones that don't fit, although the
                // formatter leaves room for them by skipping time points
                whiteSpace: "nowrap"
            },
            formatter() {
                const axis = this.axis as any
                const interval = axis.tickInterval || 1
                const slot = Math.abs(axis.toPixels(this.pos + interval, true) - axis.toPixels(this.pos, true))
                const fontSize = axis.labelMetrics?.().f || 11
                const every = Math.max(1, Math.ceil((maxChars * fontSize * 0.6 + NUMBER_PADDING) / slot))
                const index = Math.round((this.pos - (axis.tickPositions?.[0] ?? 0)) / interval)
                if (index % every) {
                    return ""
                }
                return counts[i].get(this.pos) ?? ""
            }
        }
    }))

    return {
        ...options,
        xAxis: [mainAxis, heading, ...rows],
        chart: {
            ...options.chart,
            events: {
                ...options.chart?.events,
                // Group names longer than the space left of the plot are cut
                render(e) {
                    const spacingLeft = (this as any).spacing[3]
                    this.xAxis.forEach((axis: any) => {
                        if (axis.options.className === RISK_TABLE_CLASS) {
                            axis.axisTitle?.css({
                                width: Math.max(this.plotLeft - NAME_PADDING - spacingLeft, 0) + "px",
                                textOverflow: "ellipsis"
                            })
                        }
                    })
                    // @ts-ignore
                    options.chart?.events?.render?.call(this, e)
                }
            }
        }
    }
}

/**
 * The most of the chart width that the group names may take. Longer names are
 * cut (see the render event above).
 */
const MAX_NAMES_SHARE = 0.3

/**
 * The width of the widest group name (or the heading), in px
 */
function getNamesWidth(chart: any, rows: any[]): number
{
    return Math.max(0, ...rows.map(axis => {
        const text = chart.renderer
            .text(axis.options.title.text, 0, 0)
            .css(axis.options.title.style || {})
            .add()
        const width = text.getBBox().width
        text.destroy()
        return width
    }))
}

/**
 * Highcharts makes the space left of the plot as wide as the y axis needs. The
 * group names of the "number at risk" table and its heading (which sit there,
 * under the y axis) may need more, so once all axes have taken their space, the
 * left side gets as wide as the widest name (up to MAX_NAMES_SHARE of the chart).
 */
const removeMarginHook = Highcharts.addEvent(Highcharts.Axis, "afterGetOffset", function(this: any) {
    const chart = this.chart

    // Wait for the last axis, so that the y axis stays next to the plot
    if (chart.axes.filter((axis: any) => axis.visible).pop() !== this) {
        return
    }

    // Leave a fixed left margin alone
    if (chart.margin[3] !== undefined && chart.margin[3] !== null) {
        return
    }

    const rows = chart.xAxis.filter((axis: any) => axis.visible && axis.options.className === RISK_TABLE_CLASS)
    if (!rows.length) {
        return
    }

    // A couple of px more, so that a name that fits is not cut by rounding
    const needed = Math.min(
        Math.ceil(getNamesWidth(chart, rows)) + NAME_PADDING + 2,
        chart.chartWidth * MAX_NAMES_SHARE
    )

    chart.axisOffset[3] = Math.max(chart.axisOffset[3], needed)
})

/**
 * The smallest plot height (in px) the table may leave. When the table and the
 * rest of the chart need more room, the chart gets taller instead.
 */
export const MIN_PLOT_HEIGHT = 200

/**
 * Data attribute of the chart container while it is made taller for the table:
 * the height (in px) it was made for
 */
const GROWN_ATTR = "data-risk-table-height"

/**
 * Data attribute of the chart container with the aspect ratio of its stylesheet
 */
const NATURAL_RATIO_ATTR = "data-natural-aspect-ratio"

/**
 * The dashboard chart has a fixed shape (CSS aspect-ratio), so a long table
 * would leave no room for the plot. After every render, a chart with the table
 * gets a taller aspect ratio on its container, one that keeps MIN_PLOT_HEIGHT
 * for the plot at the current width, and Highcharts redraws to the new size.
 * The ratio goes back to the stylesheet's when the table goes away.
 *
 * Not a min-height: with an aspect ratio, CSS turns a min-height into a
 * min-width too, and the chart would get wider than the page.
 */
const removeHeightHook = Highcharts.addEvent(Highcharts.Chart, "render", function(this: any) {
    const chart = this
    const el: HTMLElement = chart.renderTo

    // Exported and printed charts have their own size
    if (chart.renderer.forExport || !el) {
        return
    }

    const grown = el.hasAttribute(GROWN_ATTR)
    const hasTable = chart.xAxis.some((axis: any) => axis.options.className === RISK_TABLE_CLASS)

    const reset = () => {
        el.removeAttribute(GROWN_ATTR)
        el.style.removeProperty("aspect-ratio")
        chart.reflow()
    }

    if (!hasTable) {
        if (grown) {
            reset()
        }
        return
    }

    // The height the chart would have without the table's help (the stylesheet's
    // aspect ratio), and the height it needs: what everything but the plot
    // takes, plus the smallest plot
    const naturalHeight = chart.chartWidth / getNaturalAspectRatio(el)
    const target = Math.ceil(chart.chartHeight - chart.plotHeight + MIN_PLOT_HEIGHT)

    if (target <= naturalHeight + 1) {
        if (grown) {
            reset()
        }
        return
    }

    // Set again when the width changed, since the ratio was for the old one
    if (!grown || Math.abs(chart.chartHeight - target) > 1) {
        el.setAttribute(GROWN_ATTR, String(target))
        el.style.setProperty("aspect-ratio", `${chart.chartWidth} / ${target}`)
        chart.reflow()
    }
})

/**
 * The width / height ratio the stylesheet gives the chart container (5 / 3 in
 * the dashboard), read while no ratio of ours is set on it
 */
function getNaturalAspectRatio(el: HTMLElement): number
{
    let ratio = Number(el.getAttribute(NATURAL_RATIO_ATTR))
    if (!ratio) {
        const [w, h = 1] = (getComputedStyle(el).aspectRatio || "").split("/").map(parseFloat)
        ratio = w > 0 && h > 0 ? w / h : 5 / 3
        el.setAttribute(NATURAL_RATIO_ATTR, String(ratio))
    }
    return ratio
}

// The hooks are global, so remove them when this file is reloaded during
// development, or every version of them would keep running
import.meta.hot?.dispose(() => {
    removeMarginHook()
    removeHeightHook()
})

/**
 * Scales a CSS font size like "1.2em" or "12px". Sizes without a unit are px,
 * and no size means the default 1em.
 */
export function scaleFontSize(fontSize: string | number | undefined, scale: number): string
{
    const match = String(fontSize ?? "1em").trim().match(/^([\d.]+)\s*([a-z%]*)$/i)
    if (!match) {
        return scale + "em"
    }
    const value = parseFloat(match[1]) * scale
    return +value.toFixed(3) + (match[2] || "px")
}
