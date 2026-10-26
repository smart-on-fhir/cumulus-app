import { Options }   from "highcharts";
import { stripTags } from "../../../utils";

const options: Options = {
    chart: {
        type: "line",
        options3d: {
            enabled: false
        }
    },
    plotOptions: {
        line: {
            step: "left",
            // A time point missing from a series means no events there, so
            // the curve stays flat until the next point
            connectNulls: true,
            // Survival curves often overlap
            opacity: 0.7,
            // Off, but shown on hover. Otherwise Highcharts turns markers on
            // for a series with a single point, e.g. a group whose records
            // all fall in the last time point
            marker: {
                enabled: false
            },
            // Helps to tell overlapping curves apart
            shadow: {
                color  : "#000000",
                opacity: 0.4,
                offsetX: 1,
                offsetY: 1,
                width  : 1
            }
        }
    }
}

export default options

/**
 * The caption survival charts start with: how to read them. It is a regular
 * (editable) caption, so it can be changed or removed.
 */
export const SURVIVAL_CAPTION =
    "<p><b>How to read this chart:</b> each curve shows the percentage of patients in a group " +
    "who have not had the event yet, over time. A curve steps down when events happen, and ends " +
    "when nobody in its group is followed any longer. Shaded bands, if shown, are 95% confidence " +
    "intervals: the true value is likely within them, and wider bands mean less certainty. The " +
    "numbers under the chart, if shown, are how many patients were still followed at each time " +
    "point.</p>" +
    "<p>The <b>log-rank p-value</b>, if shown in the subtitle, tells how likely curves this " +
    "different would be by chance if all groups had the same survival. Below 0.05 " +
    "usually means a real difference, but not how big it is or why. It is computed from the " +
    "counts at each time point, so it may differ slightly from statistics software.</p>"

/**
 * The caption after changing the chart type: survival charts get the default
 * caption if they have none, and lose it (unless it was edited) when changed
 * to another type.
 */
export function getCaptionForChartType(caption: string, from: string, to: string): string
{
    if (to === "survival" && from !== "survival" && !stripTags(caption || "").trim()) {
        return SURVIVAL_CAPTION
    }
    if (from === "survival" && to !== "survival" && caption === SURVIVAL_CAPTION) {
        return ""
    }
    return caption
}
