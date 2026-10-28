import "highcharts"

/**
 * Our own settings, kept in `custom` of the chart options and saved with them
 */
export interface ChartCustomOptions {
    /** The id of the color theme (see COLOR_THEMES) */
    theme?: string

    /** Set by buildChartOptions, so that the inspectors can tell survival charts apart */
    isSurvival?: boolean

    /** Set by buildChartOptions: subtitles offered in the config panel (log-rank test results) */
    subtitleSuggestions?: string[]
}

// Highcharts types `custom` on series, axis and point options, but not on the
// chart options, nor on a point, which gets its options' `custom` copied to it
declare module "highcharts" {
    interface Options {
        custom?: ChartCustomOptions
    }
    interface Point {
        custom?: Dictionary<any>
    }
}
