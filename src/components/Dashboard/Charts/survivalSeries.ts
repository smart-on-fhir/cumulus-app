import { parseDuration } from "./duration"
import { SurvivalData }  from "./kaplanMeier"
import { app }           from "../../../types"


// The survival steps of building a chart's series (see getSeriesAndExceptions
// in lib.ts). The survival curves themselves are computed there, because they
// are built like any other series.

/**
 * Survival charts warn about groups with fewer records than this
 */
export const MIN_SURVIVAL_GROUP_SIZE = 10

function escapeHtml(input: string) {
    return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/**
 * Warnings about the data of a survival chart: an X column that doesn't hold
 * durations, a missing status column or event value, or an event value that
 * no record has
 */
export function getSurvivalDataWarnings(
    xTicks: (string | number)[],
    column: app.SubscriptionDataColumn,
    survivalData?: SurvivalData | null
): string[]
{
    const warnings: string[] = []

    const invalid = xTicks.filter(x => parseDuration(x) === null)
    if (invalid.length) {
        const examples = invalid.slice(0, 3).map(x => `"${escapeHtml(x + "")}"`).join(", ")
        warnings.push(
            `<b>${escapeHtml(column.label || column.name)}</b> does not look like a duration ` +
            `(found ${examples}${invalid.length > 3 ? ", ..." : ""}), so this will not be a proper survival chart`
        )
    }
    if (!survivalData) {
        warnings.push("Select a Status Column and an Event Value to compute the survival curve. Showing counts for now.")
    }
    // Usually means the saved Event Value no longer exists in the data
    else if (!survivalData.events.rowCount) {
        const { label, eventValue } = survivalData.status ?? { label: "status", eventValue: "the selected Event Value" }
        warnings.push(
            `No records have <b>${escapeHtml(label)}</b> equal to <b>${escapeHtml(eventValue)}</b>, ` +
            `so the survival curves cannot drop. Check the Event Value.`
        )
    }

    return warnings
}

/**
 * Small groups are shown, but their curves are uncertain. Returns a warning
 * that names them, if there are any.
 */
export function getSmallGroupsWarning(series: any[]): string | null
{
    const small = series
        .map((s: any) => [s.name, s.data?.find((p: any) => p?.custom?.survival)?.custom.survival.atRisk ?? 0])
        .filter(([, n]) => n > 0 && n < MIN_SURVIVAL_GROUP_SIZE)
    if (!small.length) {
        return null
    }
    return (
        `Small group${small.length > 1 ? "s" : ""} (fewer than ${MIN_SURVIVAL_GROUP_SIZE}): ` +
        small.map(([name, n]) => `<b>${escapeHtml(String(name))}</b> (n=${n})`).join(", ") +
        `. ${small.length > 1 ? "Their curves" : "Its curve"}` +
        (series.length > 1 ? " and the log-rank p-value are" : small.length > 1 ? " are" : " is") +
        " less reliable."
    )
}

/**
 * Left steps are the only correct way to draw survival curves, even if another
 * step was saved for a series
 */
export function setLeftSteps(series: any[]): void
{
    series.forEach((s: any) => {
        if (s.type === "line") {
            s.step = "left"
        }
    })
}

/**
 * The 95% confidence band of each survival curve, as series options. The
 * caller adds them after all the curves, so that they don't shift the colors
 * of the curves.
 */
export function getConfidenceBands(curves: any[], savedSeries: Highcharts.Options["series"] = []): any[]
{
    return curves.map((curve: any) => {
        const id  = curve.id + " (95% CI)"
        // Saved options win over these defaults (addSeries would let
        // anything passed here override them)
        const old: any = savedSeries.find(s => s.id === id)
        return {
            type               : "arearange",
            id,
            name               : old?.name ?? curve.name + " (95% CI)",
            linkedTo           : curve.id,
            // A band follows its curve's color unless the user picked one
            // for it (the series inspector saves that in custom.color)
            color              : old?.custom?.color || curve.color,
            custom             : { ...old?.custom, isConfidenceBand: true },
            zIndex             : 0,
            step               : "left",
            lineWidth          : old?.lineWidth ?? 0.2,
            fillOpacity        : old?.fillOpacity ?? 0.15,
            connectNulls       : true,
            enableMouseTracking: false,
            marker             : { enabled: false },
            data: curve.data.map((point: any) => {
                const row = point?.custom?.survival
                if (!row || row.ciLow === null) {
                    return null
                }
                return {
                    ...(point.x !== undefined ? { x: point.x } : {}),
                    name: point.name,
                    low : row.ciLow  * 100,
                    high: row.ciHigh * 100
                }
            })
        }
    })
}
