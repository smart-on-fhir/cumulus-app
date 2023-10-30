import { DashStyleValue } from "highcharts"
import { generateColors } from "../../utils"
export { ReadOnlyPaths }  from "../../config"

export const SupportedChartTypes = {
    pie          : "Pie Chart",
    pie3d        : "Pie Chart 3D",
    donut        : "Donut Chart",
    donut3d      : "Donut Chart 3D",
    
    line         : "Line Chart",
    spline       : "Soft Line Chart",
    area         : "Area Chart",
    areaspline   : "Soft Area Chart",

    column       : "Column Chart",
    column3d     : "Column Chart 3D",
    columnStack  : "Stacked Column Chart",
    columnStack3d: "Stacked Column Chart 3D",
    
    bar          : "Bar Chart",
    bar3d        : "Bar Chart 3D",
    barStack     : "Stacked Bar Chart",
    barStack3d   : "Stacked Bar Chart 3D",
}

export const ChartIcons = {
    pie          : "/icons/pie_chart.png",
    pie3d        : "/icons/pie_chart.png",
    donut        : "/icons/donut_chart.png",
    donut3d      : "/icons/donut_chart.png",
    
    line         : "/icons/line_chart.png",
    spline       : "/icons/line_chart.png",
    area         : "/icons/area_chart.png",
    areaspline   : "/icons/area_chart.png",

    column       : "/icons/column_chart.png",
    column3d     : "/icons/column_chart.png",
    columnStack  : "/icons/column_chart_stacked.png",
    columnStack3d: "/icons/column_chart_stacked.png",
    
    bar          : "/icons/bar_chart.png",
    bar3d        : "/icons/bar_chart.png",
    barStack     : "/icons/bar_chart.png",
    barStack3d   : "/icons/bar_chart.png",
}

export type SupportedNativeChartTypes = "pie" | "line" | "spline" | "area" | "areaspline" | "column" | "bar"

/**
 * Charts that can only have one dimension plus count. They DO NOT support
 * grouping!
 */
export const SingleDimensionChartTypes: (keyof typeof SupportedChartTypes)[] = ["pie", "pie3d", "donut", "donut3d"]

export const TURBO_THRESHOLD = 1000

export const DEFAULT_COLORS = generateColors(36)

export const DEFAULT_FONT_SIZE = 16

export const DEFAULT_FONT_FAMILY = "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif"

export const DASH_STYLES: DashStyleValue[] = [
    'Solid', 'ShortDash', 'ShortDot', 'ShortDashDot',
    'ShortDashDotDot', 'Dot', 'Dash', 'LongDash', 'DashDot',
    'LongDashDot', 'LongDashDotDot'
];

export const INSPECTORS = {
    xAxisTitle    : ".highcharts-xaxis .highcharts-axis-title",
    yAxisTitle    : ".highcharts-yaxis .highcharts-axis-title",
    xAxis         : ".highcharts-xaxis, .highcharts-xaxis *",
    yAxis         : ".highcharts-yaxis, .highcharts-yaxis *",
    xAxisLabels   : ".highcharts-xaxis-labels *",
    yAxisLabels   : ".highcharts-yaxis-labels *",
    xAxisGridLines: ".highcharts-xaxis-grid path",
    yAxisGridLines: ".highcharts-yaxis-grid path",
    legend        : ".highcharts-legend *",
    caption       : ".highcharts-caption",
    subtitle      : ".highcharts-subtitle",
    title         : ".highcharts-title",
    chart         : ".highcharts-background",
    plot          : ".highcharts-plot-background",
    plotLineLabel : ".highcharts-plot-line-label, .highcharts-plot-line-label *",
    // plotLine      : ".highcharts-plot-line",
    // annotation    : ".chart-annotation *",
    // annotation    : ".highcharts-label-box.highcharts-annotation-label-box",
};


export const DATE_BOOKMARKS = [
    { date: "2020-03-01", name: "Start of COVID Pre-Delta era" },
    { date: "2021-06-21", name: "Start of COVID Delta era"     },
    { date: "2021-12-20", name: "Start of COVID Omicron era"   },
];

type ColData = string|number|boolean|null

interface FilterConfig {
    id: string
    label: string
    type: string[]
    defaultValue?: ColData
}

export const operators: FilterConfig[] = [
    { id: "eq"                , label: "=="                                    , type: ["integer", "float" ] },
    { id: "ne"                , label: "!="                                    , type: ["integer", "float" ] },
    { id: "gt"                , label: ">"                                     , type: ["integer", "float" ] },
    { id: "gte"               , label: ">="                                    , type: ["integer", "float" ] },
    { id: "lt"                , label: "<"                                     , type: ["integer", "float" ] },
    { id: "lte"               , label: "<="                                    , type: ["integer", "float" ] },

    { id: "strEq"             , label: "Equal"                                 , type: ["string"           ] },
    { id: "strContains"       , label: "Contains"                              , type: ["string"           ] },
    { id: "strStartsWith"     , label: "Starts with"                           , type: ["string"           ] },
    { id: "strEndsWith"       , label: "Ends with"                             , type: ["string"           ] },
    { id: "matches"           , label: "Matches RegExp"                        , type: ["string"           ] },
    { id: "strEqCI"           , label: "Equal (case insensitive)"              , type: ["string"           ] },
    { id: "strContainsCI"     , label: "Contains (case insensitive)"           , type: ["string"           ] },
    { id: "strStartsWithCI"   , label: "Starts with (case insensitive)"        , type: ["string"           ] },
    { id: "strEndsWithCI"     , label: "Ends with (case insensitive)"          , type: ["string"           ] },
    { id: "matchesCI"         , label: "Matches RegExp (case insensitive)"     , type: ["string"           ] },
    { id: "strNotEq"          , label: "Not: Equals"                           , type: ["string"           ] },
    { id: "strNotContains"    , label: "Not: Contains"                         , type: ["string"           ] },
    { id: "strNotStartsWith"  , label: "Not: Starts with"                      , type: ["string"           ] },
    { id: "strNotEndsWith"    , label: "Not: Ends with"                        , type: ["string"           ] },
    { id: "notMatches"        , label: "Not: Matches RegExp"                   , type: ["string"           ] },
    { id: "strNotEqCI"        , label: "Not: Equals (case insensitive)"        , type: ["string"           ] },
    { id: "strNotContainsCI"  , label: "Not: Contains (case insensitive)"      , type: ["string"           ] },
    { id: "strNotStartsWithCI", label: "Not: Starts with (case insensitive)"   , type: ["string"           ] },
    { id: "strNotEndsWithCI"  , label: "Not: Ends with (case insensitive)"     , type: ["string"           ] },
    { id: "notMatchesCI"      , label: "Not: Matches RegExp (case insensitive)", type: ["string"           ] },
    
    { id: "sameDay"           , label: "Same date"                             , type: [ "date:YYYY-MM-DD"                                                ] },
    { id: "sameWeek"          , label: "Same week"                             , type: [ "date:YYYY-MM-DD", "date:YYYY wk W"                              ] },
    { id: "sameMonth"         , label: "Same month"                            , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM"              ] },
    { id: "sameYear"          , label: "Same year"                             , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM", "date:YYYY" ] },
    { id: "sameDayOrBefore"   , label: "Same date or before"                   , type: [ "date:YYYY-MM-DD"                                                ] },
    { id: "sameWeekOrBefore"  , label: "Same week or before"                   , type: [ "date:YYYY-MM-DD", "date:YYYY wk W"                              ] },
    { id: "sameMonthOrBefore" , label: "Same month or before"                  , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM"              ] },
    { id: "sameYearOrBefore"  , label: "Same year or before"                   , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM", "date:YYYY" ] },
    { id: "sameDayOrAfter"    , label: "Same date or after"                    , type: [ "date:YYYY-MM-DD"                                                ] },
    { id: "sameWeekOrAfter"   , label: "Same week or after"                    , type: [ "date:YYYY-MM-DD", "date:YYYY wk W"                              ] },
    { id: "sameMonthOrAfter"  , label: "Same month or after"                   , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM"              ] },
    { id: "sameYearOrAfter"   , label: "Same year or after"                    , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM", "date:YYYY" ] },
    { id: "beforeDay"         , label: "Before date"                           , type: [ "date:YYYY-MM-DD"                                                ] },
    { id: "beforeWeek"        , label: "Before week"                           , type: [ "date:YYYY-MM-DD", "date:YYYY wk W"                              ] },
    { id: "beforeMonth"       , label: "Before month"                          , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM"              ] },
    { id: "beforeYear"        , label: "Before year"                           , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM", "date:YYYY" ] },
    { id: "afterDay"          , label: "After date"                            , type: [ "date:YYYY-MM-DD"                                                ] },
    { id: "afterWeek"         , label: "After week"                            , type: [ "date:YYYY-MM-DD", "date:YYYY wk W"                              ] },
    { id: "afterMonth"        , label: "After month"                           , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM"              ] },
    { id: "afterYear"         , label: "After year"                            , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM", "date:YYYY" ] },
    
    { id: "isTrue"            , label: "IS TRUE"                               , type: ["boolean"          ] },
    { id: "isFalse"           , label: "IS FALSE"                              , type: ["boolean"          ] },
    { id: "isNotTrue"         , label: "IS NOT TRUE"                           , type: ["boolean"          ] },
    { id: "isNotFalse"        , label: "IS NOT FALSE"                          , type: ["boolean"          ] },
    
    { id: "isNull"            , label: "IS NULL"                               , type: ["*"                ] },
    { id: "isNotNull"         , label: "IS NOT NULL"                           , type: ["*"                ] },
];
