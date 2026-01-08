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

const prefix = VITE_APP_PREFIX ? "/" + VITE_APP_PREFIX : "";

export const ChartIcons = {
    pie          : `${prefix}/icons/pie_chart.png`,
    pie3d        : `${prefix}/icons/pie_chart.png`,
    donut        : `${prefix}/icons/donut_chart.png`,
    donut3d      : `${prefix}/icons/donut_chart.png`,

    line         : `${prefix}/icons/line_chart.png`,
    spline       : `${prefix}/icons/line_chart.png`,
    area         : `${prefix}/icons/area_chart.png`,
    areaspline   : `${prefix}/icons/area_chart.png`,

    column       : `${prefix}/icons/column_chart.png`,
    column3d     : `${prefix}/icons/column_chart.png`,
    columnStack  : `${prefix}/icons/column_chart_stacked.png`,
    columnStack3d: `${prefix}/icons/column_chart_stacked.png`,

    bar          : `${prefix}/icons/bar_chart.png`,
    bar3d        : `${prefix}/icons/bar_chart.png`,
    barStack     : `${prefix}/icons/bar_chart.png`,
    barStack3d   : `${prefix}/icons/bar_chart.png`,
}

export type SupportedNativeChartTypes = "pie" | "line" | "spline" | "area" | "areaspline" | "column" | "bar"

/**
 * Charts that can only have one dimension plus count. They DO NOT support
 * grouping!
 */
export const SingleDimensionChartTypes: (keyof typeof SupportedChartTypes)[] = ["pie", "pie3d", "donut", "donut3d"]

export const TURBO_THRESHOLD = 20_000

export const DEFAULT_FONT_SIZE = 16

export const DEFAULT_FONT_FAMILY = "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif"

export const DASH_STYLES: DashStyleValue[] = [
    'Solid', 'ShortDash', 'ShortDot', 'ShortDashDot',
    'ShortDashDotDot', 'Dot', 'Dash', 'LongDash', 'DashDot',
    'LongDashDot', 'LongDashDotDot'
];

export const COLOR_DANGER  = "#DD4433"
export const COLOR_WARNING = "#EE8833"
export const COLOR_SUCCESS = "#44BB33"

export const COLOR_THEMES = [
    { id: "cumulus"      , name: "Cumulus Default", colors: generateColors(12, 70, 55, 0.46, 220) },
    { id: "cumulus_muted", name: "Cumulus Muted"  , colors: generateColors(12, 40, 70, 0.46, 220) },
    { id: "cumulus_light", name: "Cumulus Light"  , colors: generateColors(12, 75, 75, 0.46, 220) },
    { id: "cumulus_dark" , name: "Cumulus Dark"   , colors: generateColors(12, 75, 35, 0.46, 220) },
    { id: "sas_dark"     , name: "SAS Line Colors", colors: ["#445694","#A23A2E","#01665E","#543005","#9D3CDB","#7F8E1F","#2597FA","#B26084","#D17800","#47A82A","#B38EF3","#F9DA04"] },
    { id: "sas_light"    , name: "SAS Fill Colors", colors: ["#6F7EB3","#D05B5B","#66A5A0","#A9865B","#B689CD","#BABC5C","#94BDE1","#CD7BA1","#CF974B","#87C873","#B7AEF1","#DDD17E"] },
    { id: "smart"        , name: "SMART"          , colors: ["#207ccd","#865fda","#bd6bc2","#e44688","#df9320","#c4ae21","#64c10d","#26c7bd","#47bbf4","#97b9d4","#7a76ad","#cabe70"] },
    { id: "smart2"       , name: "SMART 2"        , colors: ["#739df2","#a383e2","#b87ab8","#d65c5c","#df9f20","#dfdf11","#66c20a","#53ac71","#77c5c5","#94b3d1","#8787c5","#ccbb66"] },
    { id: "gradient-1"   , name: "Gradient 1"     , colors: ["#75d7d7","#75a6d7","#7575d7","#a675d7","#d775d7","#d775a6","#d77575","#d7a675","#d7d775","#a6d775","#75d775","#75d7a6"] },
    { id: "gradient-2"   , name: "Gradient 2"     , colors: ["#d775d7","#d775a6","#d77575","#d7a675","#d7d775","#a6d775","#75d775","#75d7a6","#75d7d7","#75a6d7","#7575d7","#a675d7"] },
    { id: "gradient-3"   , name: "Gradient 3"     , colors: ["#d7d775","#a6d775","#75d775","#75d7a6","#75d7d7","#75a6d7","#7575d7","#a675d7","#d775d7","#d775a6","#d77575","#d7a675"] },
]

export const DEFAULT_COLOR_THEME = "cumulus"

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

    // Number Operators --------------------------------------------------------
    { id: "eq"                , label: "== (equal)"                , type: ["integer", "float" ] },
    { id: "ne"                , label: "!= (not equal)"            , type: ["integer", "float" ] },
    { id: "gt"                , label: ">  (greater than)"         , type: ["integer", "float" ] },
    { id: "gte"               , label: ">= (greater than or equal)", type: ["integer", "float" ] },
    { id: "lt"                , label: "<  (less than)"            , type: ["integer", "float" ] },
    { id: "lte"               , label: "<= (less than or equal)"   , type: ["integer", "float" ] },

    // String Operators --------------------------------------------------------
    { id: "strEq"             , label: "Equal"                     , type: ["string"] },
    { id: "strContains"       , label: "Contains"                  , type: ["string"] },
    { id: "strStartsWith"     , label: "Starts with"               , type: ["string"] },
    { id: "strEndsWith"       , label: "Ends with"                 , type: ["string"] },
    { id: "matches"           , label: "Matches RegExp"            , type: ["string"] },
    { id: "strEqCI"           , label: "Equal (CI)"                , type: ["string"] },
    { id: "strContainsCI"     , label: "Contains (CI)"             , type: ["string"] },
    { id: "strStartsWithCI"   , label: "Starts with (CI)"          , type: ["string"] },
    { id: "strEndsWithCI"     , label: "Ends with (CI)"            , type: ["string"] },
    { id: "matchesCI"         , label: "Matches RegExp (CI)"       , type: ["string"] },
    { id: "strNotEq"          , label: "Not: Equals"               , type: ["string"] },
    { id: "strNotContains"    , label: "Not: Contains"             , type: ["string"] },
    { id: "strNotStartsWith"  , label: "Not: Starts with"          , type: ["string"] },
    { id: "strNotEndsWith"    , label: "Not: Ends with"            , type: ["string"] },
    { id: "notMatches"        , label: "Not: Matches RegExp"       , type: ["string"] },
    { id: "strNotEqCI"        , label: "Not: Equals (CI)"          , type: ["string"] },
    { id: "strNotContainsCI"  , label: "Not: Contains (CI)"        , type: ["string"] },
    { id: "strNotStartsWithCI", label: "Not: Starts with (CI)"     , type: ["string"] },
    { id: "strNotEndsWithCI"  , label: "Not: Ends with (CI)"       , type: ["string"] },
    { id: "notMatchesCI"      , label: "Not: Matches RegExp (CI)"  , type: ["string"] },
    
    // Date Operators ----------------------------------------------------------
    { id: "sameDay"           , label: "Same date"                 , type: [ "date:YYYY-MM-DD"                                                ] },
    { id: "sameWeek"          , label: "Same week"                 , type: [ "date:YYYY-MM-DD", "date:YYYY wk W"                              ] },
    { id: "sameMonth"         , label: "Same month"                , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM"              ] },
    { id: "sameYear"          , label: "Same year"                 , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM", "date:YYYY" ] },
    { id: "sameDayOrBefore"   , label: "Same date or before"       , type: [ "date:YYYY-MM-DD"                                                ] },
    { id: "sameWeekOrBefore"  , label: "Same week or before"       , type: [ "date:YYYY-MM-DD", "date:YYYY wk W"                              ] },
    { id: "sameMonthOrBefore" , label: "Same month or before"      , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM"              ] },
    { id: "sameYearOrBefore"  , label: "Same year or before"       , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM", "date:YYYY" ] },
    { id: "sameDayOrAfter"    , label: "Same date or after"        , type: [ "date:YYYY-MM-DD"                                                ] },
    { id: "sameWeekOrAfter"   , label: "Same week or after"        , type: [ "date:YYYY-MM-DD", "date:YYYY wk W"                              ] },
    { id: "sameMonthOrAfter"  , label: "Same month or after"       , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM"              ] },
    { id: "sameYearOrAfter"   , label: "Same year or after"        , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM", "date:YYYY" ] },
    { id: "beforeDay"         , label: "Before date"               , type: [ "date:YYYY-MM-DD"                                                ] },
    { id: "beforeWeek"        , label: "Before week"               , type: [ "date:YYYY-MM-DD", "date:YYYY wk W"                              ] },
    { id: "beforeMonth"       , label: "Before month"              , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM"              ] },
    { id: "beforeYear"        , label: "Before year"               , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM", "date:YYYY" ] },
    { id: "afterDay"          , label: "After date"                , type: [ "date:YYYY-MM-DD"                                                ] },
    { id: "afterWeek"         , label: "After week"                , type: [ "date:YYYY-MM-DD", "date:YYYY wk W"                              ] },
    { id: "afterMonth"        , label: "After month"               , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM"              ] },
    { id: "afterYear"         , label: "After year"                , type: [ "date:YYYY-MM-DD", "date:YYYY wk W", "date:YYYY-MM", "date:YYYY" ] },
    
    // Boolean Operators -------------------------------------------------------
    { id: "isTrue"            , label: "IS TRUE"                   , type: ["boolean"] },
    { id: "isFalse"           , label: "IS FALSE"                  , type: ["boolean"] },
    { id: "isNotTrue"         , label: "IS NOT TRUE"               , type: ["boolean"] },
    { id: "isNotFalse"        , label: "IS NOT FALSE"              , type: ["boolean"] },

    // Universal Operators -----------------------------------------------------
    { id: "isNone"            , label: "IS NONE"                   , type: ["*"] },
    { id: "isNotNone"         , label: "IS NOT NONE"               , type: ["*"] },
    // { id: "isNull"            , label: "IS NULL"                   , type: ["*"] },
    // { id: "isNotNull"         , label: "IS NOT NULL"               , type: ["*"] },
];
